import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, Wallet, LinkIcon, RefreshCcw } from "lucide-react";
import QRCode from "react-qr-code";
import { Client } from "xrpl";
import { sepolia } from "viem/chains";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const LOCAL_KEY = "rippleBridgeProgress";
const SEPOLIA_CHAIN_ID_DEC = 11155111;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

function WalletConnected() {
  const [searchParams] = useSearchParams();
  const address = searchParams.get("address");
  const network = searchParams.get("network");
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { address: evmWallet, isConnected } = useAccount();
  const { connect, isPending } = useConnect({ connector: injected() });
  const { disconnect } = useDisconnect();

  const xrplClient = new Client("wss://s.altnet.rippletest.net");

  const getBalance = async (addr) => {
    console.log("gettingn")
    setLoadingBalance(true);
    try {
      await xrplClient.connect();
      const res = await xrplClient.request({
        command: "account_info",
        account: addr,
        ledger_index: "validated",
      });
      const drops = res.result.account_data.Balance;
      const xrp = parseFloat(drops) / 1_000_000;
      setBalance(xrp.toFixed(6));
      setBalanceError(null);
    } catch (err) {
      console.error("XRP balance error:", err);
      setBalanceError("Error fetching balance");
    } finally {
      xrplClient.disconnect();
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    setIsMobile(/iPhone|Android|iPad|iPod/i.test(navigator.userAgent));
    if (address) getBalance(address);
  }, [address]);

const connectEvmWallet = async () => {
  try {
    const result = await connect();
    const chainId = result?.chain?.id;

    if (chainId !== SEPOLIA_CHAIN_ID_DEC) {
      await switchChain({ chainId: SEPOLIA_CHAIN_ID_DEC });
    }
  } catch (error) {
    console.error("EVM wallet connection error:", error);
    alert("Failed to connect wallet. Make sure you're using Sepolia Testnet.");
  }
};


  const shorten = (addr) => addr?.slice(0, 6) + "..." + addr?.slice(-4);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 flex flex-col items-center justify-start text-center sm:px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">🎉 Wallet Connected</h1>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
          <Wallet className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold">XRPL Wallet:</span>
          <span className="truncate max-w-[10rem]">{shorten(address)}</span>
          <button onClick={() => navigator.clipboard.writeText(address)}>
            <Copy className="w-4 h-4 hover:text-black" />
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Network:</span> {network || "Unknown"}
        </div>

        <div className="flex justify-center my-4">
          <QRCode value={address || ""} size={120} />
        </div>

        <div className="flex items-center justify-between bg-indigo-50 text-indigo-800 rounded-xl py-2 px-4 mb-4 text-sm font-medium">
          <span>
            Balance:{" "}
            {loadingBalance
              ? "Loading..."
              : balanceError
              ? balanceError
              : `${balance} XRP`}
          </span>
          <button
            onClick={() => getBalance(address)}
            className="hover:text-indigo-900"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <hr className="my-4" />

        {!evmWallet ? (
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Connect EVM-Compatible Wallet</h2>
            <button
              onClick={connectEvmWallet}
              disabled={connecting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          </div>
        ) : (
          <div className="text-sm text-green-700 bg-green-100 py-2 px-4 rounded-xl">
            ✅ EVM Wallet Connected: {shorten(evmWallet)}
          </div>
        )}

        {/* Bridge logic placeholder */}
        {evmWallet && address && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
            🔁 Ready to bridge XRP to EVM wallet<br />
            <span className="font-medium">From:</span> {shorten(address)}<br />
            <span className="font-medium">To:</span> {shorten(evmWallet)}
            <button
              onClick={() =>
                navigate(`/bridge?xrp=${address}&evm=${evmWallet}`)
              }
              className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition duration-300 ease-in-out"
            >
              Bridge Now!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletConnected;

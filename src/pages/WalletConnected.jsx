import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, Wallet, LinkIcon, RefreshCcw } from "lucide-react";
import QRCode from "react-qr-code";
import { Client } from "xrpl";
import { useSwitchChain } from "wagmi";
import { sepolia } from "@wagmi/chains";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const LOCAL_KEY = "rippleBridgeProgress";
const SEPOLIA_CHAIN_ID_DEC = 11155111;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

function WalletConnected() {
  const [searchParams] = useSearchParams();
  const address = searchParams.get("address");
  const {switchChain} = useSwitchChain();
  const { disconnect } = useDisconnect()
  const network = searchParams.get("network");
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { address: evmWallet, isConnected } = useAccount();
  const { connectAsync, isPending, connectors, connect } = useConnect();


  const getBalance = async (addr) => {
  console.log("getting balance");
  setLoadingBalance(true);
  const client = new Client("wss://s.altnet.rippletest.net"); // ✅ Move inside
  try {
    await client.connect();
    const res = await client.request({
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
    client.disconnect();
    setLoadingBalance(false);
  }
};

  useEffect(() => {
    setIsMobile(/iPhone|Android|iPad|iPod/i.test(navigator.userAgent));
    if (address) getBalance(address);
  }, [address]);

const connectEvmWallet = async () => {
  try {
    setConnecting(true);
    console.log("Connectors: ", connectors);

    const metamaskConnector = connectors.find((c) => c.id === "metaMaskSDK");

    if (!metamaskConnector) {
      alert("MetaMask connector not found.");
      return;
    }

    const res = await connectAsync({ connector: metamaskConnector });
    console.log("Connected:", res);

    if (!res || !res.accounts?.length) {
      alert("Failed to connect MetaMask.");
      return;
    }

    // Ethereum Mainnet Chain ID
    const ETHEREUM_MAINNET_CHAIN_ID = 1;

    const currentChainIdHex = await window.ethereum?.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(currentChainIdHex, 16);

    if (currentChainId !== ETHEREUM_MAINNET_CHAIN_ID) {
      try {
        await switchChain({
          chainId: ETHEREUM_MAINNET_CHAIN_ID,
          addEthereumChainParameter: {
            chainName: "Ethereum Mainnet",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.ankr.com/eth"],
            blockExplorerUrls: ["https://etherscan.io"],
          },
        });
      } catch (err) {
        console.error("Error switching to Ethereum Mainnet:", err);
        alert("Please switch to Ethereum Mainnet manually in MetaMask.");
      }
    }

  } catch (error) {
    console.error("MetaMask connection error:", error);
    alert("Failed to connect MetaMask. Ensure MetaMask is installed and on Ethereum Mainnet.");
  } finally {
    setConnecting(false);
  }
};






  const shorten = (addr) => addr?.slice(0, 6) + "..." + addr?.slice(-4);

  return (
    <div className="min-h-screen bg-black px-4 py-8 flex flex-col items-center justify-start text-center sm:px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">🎉 Wallet Connected</h1>

        <div className="flex items-center justify-center space-x-2 text-sm text-black mb-2">
          <Wallet className="w-5 h-5 text-green-600" />
          <span className="font-semibold">XRPL Wallet:</span>
          <span className="truncate max-w-[10rem]">{shorten(address)}</span>
          <button onClick={() => navigator.clipboard.writeText(address)}>
            <Copy className="w-4 h-4 hover:text-green-800" />
          </button>
        </div>

        <div className="text-sm text-black mb-2">
          <span className="font-medium">Network:</span> {network || "Unknown"}
        </div>

        <div className="flex justify-center my-4">
          <QRCode value={address || ""} size={120} />
        </div>

        <div className="flex items-center justify-between bg-green-100 text-green-800 rounded-xl py-2 px-4 mb-4 text-sm font-medium">
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
            className="hover:text-green-900"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <hr className="my-4" />

        {!evmWallet ? (
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold text-black">
              Connect EVM-Compatible Wallet
            </h2>
            <button
              onClick={connectEvmWallet}
              disabled={connecting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              <span>{connecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold text-black">
              Connected to MetaMask
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-black truncate">{evmWallet.address}</span>
              <button
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg text-sm transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {evmWallet && address && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">
            🔁 Ready to bridge XRP to EVM wallet<br />
            <span className="font-medium">From:</span> {shorten(address)}<br />
            <span className="font-medium">To:</span> {shorten(evmWallet)}
            <button
              onClick={() =>
                navigate(`/bridge?xrp=${address}&evm=${evmWallet}`)
              }
              className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition duration-300 ease-in-out"
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

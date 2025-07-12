import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Copy, Wallet, LinkIcon, RefreshCcw } from "lucide-react";
import QRCode from "react-qr-code";

function WalletConnected() {
  const [searchParams] = useSearchParams();
  const address = searchParams.get("address");
  const network = searchParams.get("network");

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [evmWallet, setEvmWallet] = useState(null);

  const getBalance = async (addr) => {
    setLoadingBalance(true);
    setBalanceError(null);
    try {
      const res = await fetch("https://s.altnet.rippletest.net:51234", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "account_info",
          params: [{ account: addr, ledger_index: "validated" }],
        }),
      });
      const json = await res.json();
      if (json.result && json.result.account_data) {
        const bal = parseFloat(json.result.account_data.Balance) / 1_000_000;
        setBalance(bal.toFixed(6));
      } else {
        setBalanceError("No account data found.");
      }
    } catch (e) {
      setBalanceError("Failed to fetch XRP balance.");
      console.error(e);
    }
    setLoadingBalance(false);
  };

  useEffect(() => {
    if (address) getBalance(address);
  }, [address]);

  const connectEvmWallet = async () => {
    try {
      if (!window.ethereum) return window.open("https://metamask.io");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setEvmWallet(accounts[0]);
    } catch (e) {
      console.error("MetaMask connect error:", e);
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Connect MetaMask</span>
            </button>
          </div>
        ) : (
          <div className="text-sm text-green-700 bg-green-100 py-2 px-4 rounded-xl">
            ✅ MetaMask Connected: {shorten(evmWallet)}
          </div>
        )}

        {/* Bridge logic placeholder */}
        {evmWallet && address && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
            🔁 Ready to bridge XRP to EVM wallet<br />
            <span className="font-medium">From:</span> {shorten(address)}<br />
            <span className="font-medium">To:</span> {shorten(evmWallet)}
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletConnected;

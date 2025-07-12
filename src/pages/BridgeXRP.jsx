import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

function BridgeXRP() {
  const [searchParams] = useSearchParams();
  const xrpWallet = searchParams.get("xrp");
  const evmWallet = searchParams.get("evm");

  const [amount, setAmount] = useState("");
  const [bridgeStatus, setBridgeStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleBridge = async () => {
    if (!xrpWallet || !evmWallet || !amount || isNaN(parseFloat(amount))) {
      toast.error("Missing or invalid inputs.");
      return;
    }

    try {
      setBridgeStatus("pending");
      toast.loading("Bridging XRP... Please wait.");

      const res = await fetch("https://snap.xrplevm.org/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: xrpWallet,
          to: evmWallet,
          amount: parseFloat(amount),
          network: "mainnet",
        }),
      });

      const data = await res.json();

      toast.dismiss();

      if (!res.ok) {
        toast.error(data?.error || "Bridge failed");
        setBridgeStatus("error");
        setError(data?.error || "Bridge failed");
        return;
      }

      toast.success("Bridge initiated successfully!");
      setBridgeStatus("success");

    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Unexpected error during bridge.");
      setBridgeStatus("error");
      setError("Unexpected error during bridge.");
    }
  };

  const shorten = (addr) => addr?.slice(0, 6) + "..." + addr?.slice(-4);

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex flex-col items-center sm:px-6">
      <Toaster position="top-center" />

      <div className="w-full max-w-md shadow-xl bg-gray-50 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🔁 Bridge XRP</h1>

        <div className="text-sm mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">From (XRPL):</span>
            <span className="text-gray-800">{shorten(xrpWallet)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">To (EVM):</span>
            <span className="text-gray-800">{shorten(evmWallet)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (XRP)
          </label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          disabled={bridgeStatus === "pending"}
          onClick={handleBridge}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg flex justify-center items-center space-x-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bridgeStatus === "pending" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span>
            {bridgeStatus === "pending" ? "Bridging..." : "Bridge Now!"}
          </span>
        </button>

        {bridgeStatus === "success" && (
          <div className="mt-4 text-green-700 text-sm flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Bridge complete. Funds should appear on EVM side shortly.</span>
          </div>
        )}

        {bridgeStatus === "error" && (
          <div className="mt-4 text-red-600 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BridgeXRP;

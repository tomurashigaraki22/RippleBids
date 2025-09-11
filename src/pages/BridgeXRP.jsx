import React, { useState } from "react";
import { Client, xrpToDrops } from "xrpl";
import { ethers } from "ethers";
import { AbiCoder } from "ethers";
import { XummSdk } from "xumm-sdk";
import { Globe } from "lucide-react";
import { XummPkce } from "xumm-oauth2-pkce";
import { SquidWidget } from "@0xsquid/widget";
import BackToMarketplaceButton from "../components/Back";

const XRPL_RPC = "wss://s.altnet.rippletest.net:51233";
const AXELAR_GATEWAY = "r4DVHyEisbgQRAXCiMtP2xuz5h3dDkwqf1";
const DEST_CONTRACT = "0A90c0Af1B07f6AC34f3520348Dbfae73BDa358E";
const DEST_CHAIN = "xrpl-evm-devnet";

const abiCoder = new AbiCoder();
const XUMM_API_KEY = "6f42c09e-9637-49f2-8d90-d79f89b9d437";
const XUMM_API_SECRET = "c42a01d7-91bf-4547-aaf4-cae7b386b4ec";

export default function BridgeXRP() {
  const [message, setMessage] = useState("Mainnet GMP from browser");
  const [sending, setSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [memos, setMemos] = useState([]);

  const handleBridge = async () => {
    const payloadEncoded = abiCoder.encode(["string"], [message]);
    const payloadHex = payloadEncoded.slice(2);

    const memoData = [
      {
        Memo: {
          MemoType: Buffer.from("type").toString("hex"),
          MemoData: Buffer.from("call_contract").toString("hex"),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from("destination_address").toString("hex"),
          MemoData: Buffer.from(DEST_CONTRACT).toString("hex"),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from("destination_chain").toString("hex"),
          MemoData: Buffer.from(DEST_CHAIN).toString("hex"),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from("payload").toString("hex"),
          MemoData: payloadHex,
        },
      },
    ];

    setMemos(memoData);
    setShowPopup(true);
  };

const confirmAndSend = async () => {
  try {
    setSending(true);
    setShowPopup(false);

    const xumm = new XummPkce(XUMM_API_KEY)

    await xumm.authorize(); // Opens popup or redirects to XUMM app

    const payload = {
      txjson: {
        TransactionType: "Payment",
        Destination: AXELAR_GATEWAY,
        Amount: xrpToDrops("1"),
        Memos: memos,
      },
    };

    const response = await xumm(payload);

    // response contains .uuid and .next.always
    window.open(response.next.always, "_blank");

    // Optionally wait for the result
    const result = await xumm.getTransaction(response.uuid);
    if (result.meta.signed) {
      alert("✅ Transaction submitted successfully!");
    } else {
      alert("❌ User declined the transaction.");
    }

  } catch (err) {
    console.error("Error sending payload via frontend-only XUMM SDK:", err);
    alert("Error sending transaction. See console for details.");
  } finally {
    setSending(false);
  }
};

  const squidConfig = {
    integratorId: "ripplebids-00c8cde3-ccd5-4c63-9908-4b9c9309477e",
    theme: {
      borderRadius: {
        "button-lg-primary": "0.75rem",
        "button-lg-secondary": "0.75rem",
        "button-lg-tertiary": "0.75rem",
        "button-md-primary": "0.5rem",
        "button-md-secondary": "0.5rem",
        "button-md-tertiary": "0.5rem",
        "button-sm-primary": "0.5rem",
        "button-sm-secondary": "0.5rem",
        "button-sm-tertiary": "0.5rem",
        container: "1rem",
        input: "0.5rem",
        "menu-sm": "0.5rem",
        "menu-lg": "0.75rem",
        modal: "1rem",
      },
      fontSize: {
        caption: "0.875rem",
        "body-small": "0.875rem",
        "body-medium": "1rem",
        "body-large": "1.125rem",
        "heading-small": "1.25rem",
        "heading-medium": "1.5rem",
        "heading-large": "2rem",
      },
      fontWeight: {
        caption: "400",
        "body-small": "400",
        "body-medium": "500",
        "body-large": "500",
        "heading-small": "600",
        "heading-medium": "700",
        "heading-large": "700",
      },
      fontFamily: {
        "squid-main": "Inter, sans-serif",
      },
      boxShadow: {
        container: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      color: {
        "grey-100": "#ffffff",
        "grey-200": "#f3f4f6",
        "grey-300": "#39FF14",
        "grey-400": "#9ca3af",
        "grey-500": "#6b7280",
        "grey-600": "#4b5563",
        "grey-700": "#374151",
        "grey-800": "#1f2937",
        "grey-900": "#000000",
        "royal-300": "#39FF14",
        "royal-400": "#39FF14",
        "royal-500": "#39FF14",
        "royal-600": "#39FF14",
        "royal-700": "#39FF14",
        "status-positive": "#39FF14",
        "status-negative": "#ef4444",
        "status-partial": "#f59e0b",
        "highlight-700": "#39FF14",
        "animation-bg": "#39FF14",
        "animation-text": "#000000",
        "button-lg-primary-bg": "#39FF14",
        "button-lg-primary-text": "#000000",
        "button-lg-secondary-bg": "rgba(255, 255, 255, 0.1)",
        "button-lg-secondary-text": "#39FF14",
        "button-lg-tertiary-bg": "transparent",
        "button-lg-tertiary-text": "#39FF14",
        "button-md-primary-bg": "#39FF14",
        "button-md-primary-text": "#000000",
        "button-md-secondary-bg": "rgba(255, 255, 255, 0.1)",
        "button-md-secondary-text": "#39FF14",
        "button-md-tertiary-bg": "transparent",
        "button-md-tertiary-text": "#39FF14",
        "button-sm-primary-bg": "#39FF14",
        "button-sm-primary-text": "#000000",
        "button-sm-secondary-bg": "rgba(255, 255, 255, 0.1)",
        "button-sm-secondary-text": "#39FF14",
        "button-sm-tertiary-bg": "transparent",
        "button-sm-tertiary-text": "#39FF14",
        "input-bg": "rgba(255, 255, 255, 0.05)",
        "input-placeholder": "#6b7280",
        "input-text": "#ffffff",
        "input-selection": "#39FF14",
        "menu-bg": "rgba(0, 0, 0, 0.8)",
        "menu-text": "#ffffff",
        "menu-backdrop": "rgba(0, 0, 0, 0.5)",
        "modal-backdrop": "rgba(0, 0, 0, 0.8)",
      },
    },
    themeType: "dark",
    apiUrl: "https://v2.api.squidrouter.com",
    tabs: {
      swap: true,
      buy: true,
      send: false,
    },
    priceImpactWarnings: {
      warning: 3,
      critical: 5,
    },
    initialAssets: {},
    loadPreviousStateFromLocalStorage: true,
  }

  return (
<div className="max-w-lg mx-auto">
      <BackToMarketplaceButton/>
              <div className="glass-card p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-[#39FF14]" />
                  </div>
                  <h2
                    className="text-2xl md:text-3xl font-bold glow-text-subtle"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    Multi-Chain Bridge
                  </h2>
                </div>
                <p className="text-gray-300 mb-6">
                  Bridge assets across 50+ chains with the most comprehensive cross-chain infrastructure
                </p>

                {/* Squid Widget Container */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14]/10 via-transparent to-[#39FF14]/10 rounded-lg pointer-events-none"></div>
                  <div className="relative z-10">
                    <SquidWidget config={squidConfig} />
                  </div>
                </div>
              </div>
              </div>
  );
}

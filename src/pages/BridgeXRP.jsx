import React, { useState } from "react";
import { Client, xrpToDrops } from "xrpl";
import { ethers } from "ethers";
import { AbiCoder } from "ethers";
import { XummSdk } from "xumm-sdk";
import { XummPkce } from "xumm-oauth2-pkce";
import { SquidWidget } from "@0xsquid/widget";

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex items-center justify-center px-4">
      <SquidWidget config={{
  "integratorId": "ripplebids-00c8cde3-ccd5-4c63-9908-4b9c9309477e",
  "theme": {
    "borderRadius": {
      "button-lg-primary": "3.75rem",
      "button-lg-secondary": "3.75rem",
      "button-lg-tertiary": "3.75rem",
      "button-md-primary": "1.25rem",
      "button-md-secondary": "1.25rem",
      "button-md-tertiary": "1.25rem",
      "button-sm-primary": "1.25rem",
      "button-sm-secondary": "1.25rem",
      "button-sm-tertiary": "1.25rem",
      "container": "1.875rem",
      "input": "9999px",
      "menu-sm": "0.9375rem",
      "menu-lg": "1.25rem",
      "modal": "1.875rem"
    },
    "fontSize": {
      "caption": "0.875rem",
      "body-small": "1.14375rem",
      "body-medium": "1.40625rem",
      "body-large": "1.75625rem",
      "heading-small": "2.1875rem",
      "heading-medium": "3.08125rem",
      "heading-large": "4.40625rem"
    },
    "fontWeight": {
      "caption": "400",
      "body-small": "400",
      "body-medium": "400",
      "body-large": "400",
      "heading-small": "400",
      "heading-medium": "400",
      "heading-large": "400"
    },
    "fontFamily": {
      "squid-main": "Geist, sans-serif"
    },
    "boxShadow": {
      "container": "0px 2px 4px 0px rgba(0, 0, 0, 0.20), 0px 5px 50px -1px rgba(0, 0, 0, 0.33)"
    },
    "color": {
      "grey-100": "#FBFBFD",
      "grey-200": "#EDEFF3",
      "grey-300": "#22d36f",
      "grey-400": "#A7ABBE",
      "grey-500": "#8A8FA8",
      "grey-600": "#f2f3f2",
      "grey-700": "#4C515D",
      "grey-800": "#292C32",
      "grey-900": "#081626",
      "royal-300": "#D9BEF4",
      "royal-400": "#B893EC",
      "royal-500": "#5bb96e",
      "royal-600": "#8353C5",
      "royal-700": "#6B45A1",
      "status-positive": "#7AE870",
      "status-negative": "#FF4D5B",
      "status-partial": "#F3AF25",
      "highlight-700": "#E4FE53",
      "animation-bg": "#5bb96e",
      "animation-text": "#FBFBFD",
      "button-lg-primary-bg": "#5bb96e",
      "button-lg-primary-text": "#FBFBFD",
      "button-lg-secondary-bg": "#FBFBFD",
      "button-lg-secondary-text": "#292C32",
      "button-lg-tertiary-bg": "#292C32",
      "button-lg-tertiary-text": "#D1D6E0",
      "button-md-primary-bg": "#5bb96e",
      "button-md-primary-text": "#FBFBFD",
      "button-md-secondary-bg": "#FBFBFD",
      "button-md-secondary-text": "#292C32",
      "button-md-tertiary-bg": "#292C32",
      "button-md-tertiary-text": "#D1D6E0",
      "button-sm-primary-bg": "#9E79D2",
      "button-sm-primary-text": "#FBFBFD",
      "button-sm-secondary-bg": "#FBFBFD",
      "button-sm-secondary-text": "#292C32",
      "button-sm-tertiary-bg": "#292C32",
      "button-sm-tertiary-text": "#D1D6E0",
      "input-bg": "#17191C",
      "input-placeholder": "#676B7E",
      "input-text": "#D1D6E0",
      "input-selection": "#D1D6E0",
      "menu-bg": "#17191CA8",
      "menu-text": "#FBFBFDA8",
      "menu-backdrop": "#FBFBFD1A",
      "modal-backdrop": "#17191C54"
    }
  },
  "themeType": "dark",
  "apiUrl": "https://v2.api.squidrouter.com",
  "tabs": {
    "swap": true,
    "buy": true,
    "send": false
  },
  "priceImpactWarnings": {
    "warning": 3,
    "critical": 5
  },
  "initialAssets": {},
  "loadPreviousStateFromLocalStorage": true
}} />
    </div>
  );
}

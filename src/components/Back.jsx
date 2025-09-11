import { ArrowLeft } from "lucide-react";

export default function BackToMarketplaceButton() {
  return (
    <a
      href="https://marketplace.ripplebids.com"
      style={{
        position: "fixed",
        top: "16px",
        left: "16px",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        zIndex: 9999,
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      <ArrowLeft size={16} />
      Back
    </a>
  );
}

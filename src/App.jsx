
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card"
import Button from "./components/Button"
import { Client } from 'xrpl';
import Input from "./components/Input"
import Badge from "./components/Badge"
import Progress from "./components/Progress"
import { Alert, AlertDescription } from "./components/Alert"
import {
  Wallet,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  QrCode,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Copy,
  ArrowUpDown,
} from "./components/Icons"
import "./App.css";
import { XummPkce } from "xumm-oauth2-pkce";
import { EsupportedWallet, Networks, XRPLKit } from "xrpl-wallet-kit"
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom"
import WalletConnected from "./pages/WalletConnected";
import HomePage from "./pages/Home";
const client = new XRPLKit(EsupportedWallet.XUMM, Networks.TESTNET);
const xrplClient = new Client('wss://s.altnet.rippletest.net'); // Testnet

const xumm = new XummPkce('6f42c09e-9637-49f2-8d90-d79f89b9d437', {
  redirectUrl: window.location.origin,  // This will use the current URL as redirect
  rememberJwt: true,
  storage: window.localStorage,
  implicit: true
});


const getBalance = async (address) => {
  await xrplClient.connect();
  const response = await xrplClient.request({
    command: 'account_info',
    account: address,
    ledger_index: 'validated',
  });
  await xrplClient.disconnect();

  return (parseFloat(response.result.account_data.Balance) / 1_000_000).toString(); // Convert drops to XRP
};

function App() {
  

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet-connected" element={<WalletConnected />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


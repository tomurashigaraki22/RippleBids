
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
import BridgeXRP from "./pages/BridgeXRP";
import { sepolia } from "viem/chains";
const client = new XRPLKit(EsupportedWallet.XUMM, Networks.TESTNET);
const xrplClient = new Client('wss://s.altnet.rippletest.net'); // Testnet

const projectId = '7f999d777dd494df9a3038f609665cea'; // get this from https://cloud.walletconnect.com

const metadata = {
  name: 'RippleBids',
  description: 'Bridge XRP to EVM',
  url: 'https://ripplebids.pxxl.pro',
};

const chains = [sepolia];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains
});



function App() {
  

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet-connected" element={<WalletConnected />} />
        <Route path="/bridge" element={<BridgeXRP/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App


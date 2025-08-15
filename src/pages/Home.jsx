import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card"
import Button from "../components/Button"
import { Client } from 'xrpl';
import Badge from "../components/Badge"
import {
  Wallet,
  CheckCircle,
  QrCode,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Copy,
  ArrowUpDown,
  Shield,
  Globe,
  X,
} from "lucide-react"
import "../App.css";
import { XummPkce } from "xumm-oauth2-pkce";
import { EsupportedWallet, Networks, XRPLKit } from "xrpl-wallet-kit"
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom"
const client = new XRPLKit(EsupportedWallet.XUMM, Networks.MAINNET);
const xrplClient = new Client('wss://s1.ripple.com');

const xumm = new XummPkce('6f42c09e-9637-49f2-8d90-d79f89b9d437', {
  redirectUrl: window.location.origin,  // This will use the current URL as redirect
  rememberJwt: true,
  storage: window.localStorage,
  implicit: true
});

const LOCAL_KEY = "rippleBridgeProgress";



const getBalance = async (address) => {
  await xrplClient.connect();
  const response = await xrplClient.request({
    command: 'account_info',
    account: address,
    ledger_index: 'validated',
  });

  return (parseFloat(response.result.account_data.Balance) / 1_000_000).toString(); // Convert drops to XRP
};



const HomePage = () => {
    const [currentStep, setCurrentStep] = useState(1)
  const [xrplWallet, setXrplWallet] = useState(null)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const [metamaskWallet, setMetamaskWallet] = useState(null)
  const [xrpBalance, setXrpBalance] = useState(0)
  const [bridgeStatus, setBridgeStatus] = useState("")
  const [evmBalance, setEvmBalance] = useState(0)
  const [bridgeAmount, setBridgeAmount] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [bridgeProgress, setBridgeProgress] = useState(0)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  async function getXrpBalance(address) {
  try {
    const response = await fetch("https://xrplcluster.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        method: "account_info",
        params: [
          {
            account: address,
            ledger_index: "validated",
            strict: true
          }
        ]
      })
    });

    const data = await response.json();
    const drops = data?.result?.account_data?.Balance;

    // Convert from drops to XRP
    return drops ? parseFloat(drops) / 1000000 : 0;
  } catch (error) {
    console.error("Failed to fetch XRP balance:", error);
    return 0;
  }
}

useEffect(() => {
  if (xrplWallet){
      setTimeout(() =>{
        navigate(`/wallet-connected?address=${xrplWallet.address}&network=mainnet`)
      }, 3000)
  }
}, [xrplWallet])


  useEffect(() => {
    // Handle OAuth redirect and events
    xumm.on("success", async () => {
      try {
        const state = await xumm.state();
        console.log("Success - Account:", state.me.account);
        
        setXrplWallet({
          address: state.me.account,
          network: 'mainnet',
        });

        localStorage.setItem(LOCAL_KEY, xrplWallet)

        const balance = await getXrpBalance(state.me.account);
        setXrpBalance(balance);
        setCurrentStep(2);

        // Add URL parameters and navigate

      } catch (err) {
        console.error("Error processing success:", err);
      }
    });

    // Check for xummAuthToken in URL
    const authToken = searchParams.get('xummAuthToken');
    if (authToken) {
      console.log("Detected return from OAuth");
      // The success handler above will process the authentication
    }

    xumm.on("error", (error) => {
      console.error("XUMM error:", error);
      // Handle error appropriately
    });

    // Check if we're returning from OAuth
    if (window.location.href.includes("?xummAuthToken=")) {
      console.log("Detected return from OAuth");
      // The event handlers above will process the authentication
    }

    // return () => {
    //   // Cleanup event listeners
    //   xumm.off("success");
    //   xumm.off("error");
    // };
  }, []); // Empty dependency array - run once on mount

  const steps = [
    { id: 1, title: "Connect XRPL Wallet", description: "Connect your Xaman wallet" },
    { id: 2, title: "Bridge XRP", description: "Bridge XRP to EVM sidechain" },
    { id: 3, title: "Connect MetaMask", description: "Connect your MetaMask wallet" },
    { id: 4, title: "Complete", description: "Ready to use dApps" },
  ]

const connectGemWallet = async () => {
  try {
    const clientSession = await client.connectKitToWallet(null, "6f42c09e-9637-49f2-8d90-d79f89b9d437");

    const walletAddress = clientSession.publicKey.result.address;
    console.log("Connected:", walletAddress);

    // Get balance using the client (assuming your client provides it)
    const balanceResult = await getBalance(walletAddress) // <- Make sure this method exists
    setXrpBalance(balanceResult)

      setXrplWallet({
      address: walletAddress,
      network: 'mainnet',
    });

    console.log("Balance:", balanceResult, "XRP");
  } catch (error) {
    console.error("GemWallet not installed or failed to connect:", error);
    alert("GemWallet is not installed. Please install it from https://gemwallet.app");
  }
};


const disconnectWallet = async () => {
  try {
    // Step 1: Clear local wallet state
    setXrplWallet(null);

    // Step 2: Logout from XUMM session
    await xumm.logout();

    // Step 3 (Optional): Clear localStorage/sessionStorage if used
    // localStorage.removeItem('xummSession');
    // sessionStorage.removeItem('xummSession');

    console.log("Wallet disconnected.");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
};


// async function connect() {
//     xumm.authorize().catch((e) => console.log("e", e));
//   }

//   xumm.on("error", (error) => {
//     console.log("error", error);
//   });

//   xumm.on("success", async () => {
//     const state = await xumm.state();
//     console.log("success");
//     console.log(state.me.account);
//     // setWalletAddres(state.me.account);
//   });

//   xumm.on("retrieved", async () => {
//     const state = await xumm.state();
//     console.log("retrieved");
//     console.log(state.me.account);
//     // setWalletAddres(state.me.account);
//   });

const login = async () => {
  try {
    const payload = await xumm.authorize();

    console.log('Payload:', payload); // Contains the JWT & info
    const state = await xumm.state();  // Contains full user + token info

    console.log("Authorized account:", state.me.account);
    console.log("Full state:", state);

    setXrplWallet({
      address: state.me.account,
      network: 'mainnet',
    });

    const balance = await getBalance(state.me.account);
    setXrpBalance(balance);
    console.log("Balance:", balance, "XRP");

    setCurrentStep(2); // Move to next UI step
  } catch (err) {
    console.error("XUMM login failed:", err);
  }
};


const logout = () => {
  xumm.logout();
  console.log('XUMM logged out');
  setXrplWallet(null);
};




  const bridgeXRP = async () => {
    if (!bridgeAmount || Number.parseFloat(bridgeAmount) <= 0) return

    setBridgeStatus("processing")
    setBridgeProgress(0)

    try {
      // Simulate bridge API call to snap.xrplevm.org
      const progressInterval = setInterval(() => {
        setBridgeProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 500)

      // Simulate bridge transaction
      setTimeout(() => {
        setTransactionHash("0x1234567890abcdef1234567890abcdef12345678")
        setBridgeStatus("completed")
        setXrpBalance((prev) => prev - Number.parseFloat(bridgeAmount))
        setEvmBalance(Number.parseFloat(bridgeAmount))
        setCurrentStep(3)
      }, 5000)
    } catch (error) {
      setBridgeStatus("failed")
      console.error("Bridge failed:", error)
    }
  }

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        setMetamaskWallet({
          address: accounts[0],
          network: "XRPL EVM Sidechain",
        })
        setCurrentStep(4)
      } else {
        // Redirect to MetaMask installation
        window.open("https://metamask.io/download/", "_blank")
      }
    } catch (error) {
      console.error("Failed to connect MetaMask:", error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

return (
<div className="min-h-screen bg-dark-gradient">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-[#39FF14]/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative p-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <ArrowUpDown className="w-12 h-12 text-[#39FF14] mr-4" />
              <h1 className="text-3xl md:text-5xl font-bold glow-text" style={{ fontFamily: "Orbitron, sans-serif" }}>
                XRP Bridge Tool
              </h1>
            </div>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Bridge XRP from XRPL to EVM chains seamlessly with our secure, decentralized bridge
            </p>
          </div>

          {/* Disconnect Button */}
          {xrplWallet && (
            <button
              onClick={disconnectWallet}
              className="fixed top-24 right-6 z-50 glass-card px-4 py-2 text-sm text-[#39FF14] hover:bg-[#39FF14]/10 transition-all duration-300 border-[#39FF14]/30 hover:border-[#39FF14]/50"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Disconnect Wallet
            </button>
          )}

          {/* Progress Tracker */}
          <div className="glass-card p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${
                      currentStep > step.id
                        ? "bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/50"
                        : currentStep === step.id
                          ? "bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/50 animate-pulse"
                          : "bg-gray-800 text-[#39FF14] border border-[#39FF14]/30"
                    }
                  `}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                      w-12 md:w-24 h-1 mx-3 rounded-full transition-all duration-500
                      ${currentStep > step.id ? "bg-[#39FF14] shadow-sm shadow-[#39FF14]/50" : "bg-gray-800"}
                    `}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2
                className="text-xl md:text-2xl font-semibold glow-text-subtle mb-2"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-gray-300">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Wallet Status */}
            <div className="lg:col-span-1 space-y-6">
              {/* XRPL Wallet */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#39FF14]/20">
                  <div className="w-10 h-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#39FF14]" />
                  </div>
                  <h3 className="text-lg font-bold glow-text-subtle" style={{ fontFamily: "Orbitron, sans-serif" }}>
                    XRPL Wallet
                  </h3>
                </div>

                {xrplWallet ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Address:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">{formatAddress(xrplWallet.address)}</span>
                        <button
                          onClick={() => copyToClipboard(xrplWallet.address)}
                          className="p-1 hover:bg-[#39FF14]/10 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-[#39FF14]" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Balance:</span>
                      <span className="font-semibold text-[#39FF14] glow-text-subtle">{xrpBalance} XRP</span>
                    </div>
                    <div className="glass-card p-3 bg-[#39FF14]/10 border-[#39FF14]/30 text-center">
                      <span className="text-[#39FF14] font-medium">Connected</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Not connected</p>
                  </div>
                )}
              </div>

              {/* MetaMask Wallet */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-500/20">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                  </div>
                  <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: "Orbitron, sans-serif" }}>
                    MetaMask
                  </h3>
                </div>

                {metamaskWallet ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Address:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">{formatAddress(metamaskWallet.address)}</span>
                        <button
                          onClick={() => copyToClipboard(metamaskWallet.address)}
                          className="p-1 hover:bg-orange-500/10 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-orange-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">XRP Balance:</span>
                      <span className="font-semibold text-orange-400">{evmBalance.toFixed(2)} XRP</span>
                    </div>
                    <div className="glass-card p-3 bg-orange-500/10 border-orange-500/30 text-center">
                      <span className="text-orange-400 font-medium">Connected</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <div className="w-12 h-12 bg-gray-600 rounded mx-auto mb-3"></div>
                    <p className="text-sm">Not connected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Main Action */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8 h-full">
                {/* Step 1: Connect XRPL Wallet */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-10 h-10 text-[#39FF14]" />
                      </div>
                      <h3
                        className="text-2xl md:text-3xl font-bold mb-4 glow-text-subtle"
                        style={{ fontFamily: "Orbitron, sans-serif" }}
                      >
                        Connect Your Xaman Wallet
                      </h3>
                      <p className="text-gray-300 text-lg mb-8">
                        Connect your Xaman (XUMM) wallet to access your XRP balance and start bridging
                      </p>
                    </div>

                    {showQR ? (
                      <div className="text-center space-y-6">
                        <div className="w-48 h-48 glass-card border-2 border-dashed border-[#39FF14] rounded-lg mx-auto flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-[#39FF14] animate-pulse" />
                        </div>
                        <p className="text-[#39FF14] glow-text-subtle">
                          {isMobile ? "Opening Xaman app..." : "Scan QR code with Xaman app"}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#39FF14]" />
                          <span className="text-gray-300">Waiting for connection...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <button onClick={login} className="neon-button w-full py-4 text-lg font-semibold">
                          {isMobile ? (
                            <>
                              <Smartphone className="w-6 h-6 mr-3" />
                              Open Xaman App
                            </>
                          ) : (
                            <>
                              <QrCode className="w-6 h-6 mr-3" />
                              Connect with QR Code
                            </>
                          )}
                        </button>

                        <div className="text-center">
                          <p className="text-gray-400">
                            Don't have Xaman?{" "}
                            <a
                              href="https://xumm.app"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#39FF14] glow-text-subtle hover:glow-text transition-all duration-300 inline-flex items-center"
                            >
                              Download here <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Bridge XRP */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ArrowUpDown className="w-10 h-10 text-[#39FF14]" />
                      </div>
                      <h3
                        className="text-2xl md:text-3xl font-bold mb-4 glow-text-subtle"
                        style={{ fontFamily: "Orbitron, sans-serif" }}
                      >
                        Bridge Your XRP
                      </h3>
                      <p className="text-gray-300 text-lg mb-8">
                        Enter the amount of XRP you want to bridge to the EVM sidechain
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="glass-card p-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Amount to Bridge</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={bridgeAmount}
                            onChange={(e) => setBridgeAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-4 bg-black/50 border border-[#39FF14]/30 rounded-lg text-white placeholder-gray-500 focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 transition-all backdrop-blur-sm text-lg"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#39FF14] font-semibold">
                            XRP
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400 mt-2">
                          <span>Available: {xrpBalance} XRP</span>
                          <button
                            onClick={() => setBridgeAmount(xrpBalance.toString())}
                            className="text-[#39FF14] hover:glow-text-subtle transition-all duration-300"
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      {bridgeStatus === "processing" && (
                        <div className="glass-card p-6 border-blue-500/30 bg-blue-500/5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-blue-400">Processing Bridge...</span>
                            <span className="text-blue-400">{bridgeProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${bridgeProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={bridgeXRP}
                        disabled={!bridgeAmount || bridgeStatus === "processing"}
                        className="neon-button w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bridgeStatus === "processing" ? (
                          <>
                            <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                            Processing Bridge...
                          </>
                        ) : (
                          <>
                            <ArrowUpDown className="w-6 h-6 mr-3" />
                            Bridge XRP
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Connect MetaMask */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-12 h-12 bg-orange-500 rounded"></div>
                      </div>
                      <h3
                        className="text-2xl md:text-3xl font-bold mb-4 text-orange-400"
                        style={{ fontFamily: "Orbitron, sans-serif" }}
                      >
                        Connect MetaMask
                      </h3>
                      <p className="text-gray-300 text-lg mb-8">
                        Connect your MetaMask wallet to access your bridged XRP on the EVM sidechain
                      </p>
                    </div>

                    <button
                      onClick={connectMetaMask}
                      className="glass-card w-full py-4 text-lg font-semibold border-orange-500/30 text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300"
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded mr-3 inline-block"></div>
                      Connect MetaMask
                    </button>
                  </div>
                )}

                {/* Step 4: Complete */}
                {currentStep === 4 && (
                  <div className="space-y-8 text-center">
                    <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#39FF14]" />
                    </div>
                    <h3
                      className="text-2xl md:text-3xl font-bold mb-4 glow-text-subtle"
                      style={{ fontFamily: "Orbitron, sans-serif" }}
                    >
                      Bridge Complete!
                    </h3>
                    <p className="text-gray-300 text-lg mb-8">
                      Your XRP has been successfully bridged. You're now ready to use dApps on the XRPL EVM Sidechain.
                    </p>
                    <div className="glass-card p-6 bg-[#39FF14]/5 border-[#39FF14]/30">
                      <p className="text-[#39FF14] font-semibold">Bridged Amount: {evmBalance.toFixed(2)} XRP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="glass-card p-6 inline-block">
              <div className="flex items-center justify-center gap-4 text-[#39FF14] glow-text-subtle">
                <Shield className="w-5 h-5" />
                <span>Powered by Squid Router</span>
                <div className="w-1 h-1 bg-[#39FF14] rounded-full"></div>
                <span>Secure</span>
                <div className="w-1 h-1 bg-[#39FF14] rounded-full"></div>
                <span>Decentralized</span>
                <Globe className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card"
import Button from "../components/Button"
import { Client } from 'xrpl';
import Input from "../components/Input"
import Badge from "../components/Badge"
import Progress from "../components/Progress"
import { Alert, AlertDescription } from "../components/Alert"
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
} from "../components/Icons"
import "../App.css";
import { XummPkce } from "xumm-oauth2-pkce";
import { EsupportedWallet, Networks, XRPLKit } from "xrpl-wallet-kit"
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom"
const client = new XRPLKit(EsupportedWallet.XUMM, Networks.MAINNET);
import { sepolia } from "@wagmi/chains";
const xrplClient = new Client(['wss://s1.ripple.com', 'wss://xrplcluster.com']);

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
  const [evmBalance, setEvmBalance] = useState(0)
  const [bridgeAmount, setBridgeAmount] = useState("")
  const [bridgeStatus, setBridgeStatus] = useState("idle")
  const [transactionHash, setTransactionHash] = useState("")
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
    <div className="min-h-screen bg-gradient-to-br from-white-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-2">XRP Bridge Tool</h1>
          <p className="text-green-600 text-lg">Bridge XRP from XRPL to EVM chains seamlessly</p>
        </div>
        {xrplWallet !== null ? (
          <div
  onClick={disconnectWallet}
  className="inline-block absolute z-999 top-10 right-10 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md cursor-pointer font-medium transition"
>
  Disconnect Wallet
</div>


        ) : (
          <></>
        )}

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-green-600"
                  }
                `}
                >
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                    w-8 md:w-16 h-0.5 mx-2
                    ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-900">{steps[currentStep - 1]?.title}</h2>
            <p className="text-green-600">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet Status */}
          <div className="lg:col-span-1 space-y-4">
            {/* XRPL Wallet */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  XRPL Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {xrplWallet ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">Address:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{formatAddress(xrplWallet.address)}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(xrplWallet.address)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">Balance:</span>
                      <span className="font-semibold">{xrpBalance} XRP</span>
                    </div>
                    <Badge variant="secondary" className="w-full justify-center">
                      Connected
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center text-green-500">
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Not connected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MetaMask Wallet */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-5 h-5 bg-orange-500 rounded"></div>
                  MetaMask
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metamaskWallet ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">Address:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{formatAddress(metamaskWallet.address)}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(metamaskWallet.address)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">XRP Balance:</span>
                      <span className="font-semibold">{evmBalance.toFixed(2)} XRP</span>
                    </div>
                    <Badge variant="secondary" className="w-full justify-center">
                      Connected
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center text-green-500">
                    <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                    <p className="text-sm">Not connected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Action */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-6">
                {/* Step 1: Connect XRPL Wallet */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Wallet className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-2xl font-bold mb-2">Connect Your Xaman Wallet</h3>
                      <p className="text-green-600 mb-6">Connect your Xaman (XUMM) wallet to access your XRP balance</p>
                    </div>

                    {showQR ? (
                      <div className="text-center space-y-4">
                        <div className="w-48 h-48 bg-zinc-800 border-2 border-dashed border-green-500 rounded-lg mx-auto flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-green-400" />
                        </div>
                        <p className="text-sm text-green-600">
                          {isMobile ? "Opening Xaman app..." : "Scan QR code with Xaman app"}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Waiting for connection...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Button onClick={login} className="w-full h-12 text-lg" size="lg">
                          {isMobile ? (
                            <>
                              <Smartphone className="w-5 h-5 mr-2" />
                              Open Xaman App
                            </>
                          ) : (
                            <>
                              <QrCode className="w-5 h-5 mr-2" />
                              Connect with QR Code
                            </>
                          )}
                        </Button>

                        <div className="text-center">
                          <p className="text-sm text-green-500">
                            Don't have Xaman?
                            <a
                              href="https://xumm.app"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:underline ml-1"
                            >
                              Download here <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-green-500">
          <p>Powered by XRPL EVM Sidechain • Secure • Decentralized</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage;

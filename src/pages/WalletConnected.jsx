import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Copy, Wallet, LinkIcon, RefreshCcw, CheckCircle, ArrowRight, Shield, Zap } from "lucide-react"
import QRCode from "react-qr-code"
import { useConnect, useAccount, useDisconnect } from "wagmi"
import BackToMarketplaceButton from "../components/Back"

const LOCAL_KEY = "rippleBridgeProgress"
const ETHEREUM_MAINNET_CHAIN_ID = 1

export default function WalletConnected() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const address = searchParams.get("address")
  const network = searchParams.get("network")

  const [balance, setBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [balanceError, setBalanceError] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const { connectAsync, isPending, connectors, connect } = useConnect();


  const [isMobile, setIsMobile] = useState(false)
  const { address: evmWallet, isConnected } = useAccount();
  const { disconnect, disconnectAsync } = useDisconnect()

  const [copySuccess, setCopySuccess] = useState(false)

  const getBalance = async (addr) => {
    if (!addr) return

    console.log("getting balance")
    setLoadingBalance(true)
    setBalanceError(null)

    try {
      const response = await fetch("https://xrplcluster.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "account_info",
          params: [
            {
              account: addr,
              ledger_index: "validated",
              strict: true,
            },
          ],
        }),
      })

      const data = await response.json()
      const drops = data?.result?.account_data?.Balance

      if (drops) {
        const xrp = Number.parseFloat(drops) / 1_000_000
        setBalance(xrp.toFixed(6))
      } else {
        console.log("AA: ", data)
        setBalanceError("Account not found")
      }
    } catch (err) {
      console.error("XRP balance error:", err)
      setBalanceError("Error fetching balance")
    } finally {
      setLoadingBalance(false)
    }
  }

  useEffect(() => {
    setIsMobile(/iPhone|Android|iPad|iPod/i.test(navigator.userAgent))
    if (address) {
      getBalance(address)
    }
  }, [address])

const connectEvmWallet = async () => {
  try {
    setConnecting(true);
    console.log("Connectors: ", connectors);

    const metamaskConnector = connectors.find((c) => c.id === "metaMaskSDK");

    if (!metamaskConnector) {
      alert("MetaMask connector not found.");
      return;
    }

    // 🛑 Check if it's already connected
    if (metamaskConnector.ready && metamaskConnector.options?.getProvider) {
      const provider = await metamaskConnector.options.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        console.log("Already connected:", accounts[0]);
        setEvmWallet(accounts[0]);
        setIsConnected(true);
        return; // Skip connecting again
      }
    }

    const res = await connectAsync({ connector: metamaskConnector });
    console.log("Connected:", res);

    if (!res || !res.accounts?.length) {
      alert("Failed to connect MetaMask.");
      return;
    }



    // Ensure chain is Ethereum Mainnet
    const currentChainIdHex = await window.ethereum?.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(currentChainIdHex, 16);

    if (currentChainId !== ETHEREUM_MAINNET_CHAIN_ID) {
      try {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        });
      } catch (err) {
        console.error("Error switching to Ethereum Mainnet:", err);
        alert("Please switch to Ethereum Mainnet manually in MetaMask.");
      }
    }
  } catch (error) {
    console.log("Error: ", error)
    if (error.name === "ConnectorAlreadyConnectedError") {
      console.warn("Already connected. Ignoring...");
    } else {
      console.error("MetaMask connection error:", error);
      alert("Failed to connect MetaMask. Ensure MetaMask is installed and on Ethereum Mainnet.");
    }
  } finally {
    setConnecting(false);
  }
};








  const disconnectEvmWallet = () => {
    disconnect()
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shorten = (addr) => {
    if (!addr) return ""
    return addr.slice(0, 6) + "..." + addr.slice(-4)
  }

  const handleBridgeNow = () => {
    if (address && evmWallet) {
      navigate(`/bridge?xrp=${address}&evm=${evmWallet}`)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-gray-300">No wallet address found. Please connect your wallet first.</p>
          <button onClick={() => navigate("/")} className="neon-button mt-4 px-6 py-2">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-[#39FF14]/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      <BackToMarketplaceButton/>

      <div className="relative px-4 py-20 flex flex-col items-center justify-start">
        <div className="w-full max-w-2xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#39FF14]" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold glow-text mb-4"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              🎉 Wallet Connected!
            </h1>
            <p className="text-gray-300 text-lg">Your XRPL wallet is successfully connected and ready to use</p>
          </div>

          {/* Main Wallet Card */}
          <div className="glass-card p-8 mb-8">
            {/* XRPL Wallet Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#39FF14]" />
                </div>
                <h2 className="text-xl font-bold glow-text-subtle" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  XRPL Wallet
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{shorten(address)}</span>
                    <button
                      onClick={() => copyToClipboard(address)}
                      className="p-2 hover:bg-[#39FF14]/10 rounded-lg transition-colors group"
                    >
                      <Copy className="w-4 h-4 text-[#39FF14] group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-[#39FF14] font-semibold">{network || "Mainnet"}</span>
                </div>

                {/* QR Code */}
                <div className="flex justify-center my-6">
                  <div className="glass-card p-4 bg-white/5">
                    <QRCode value={address || ""} size={120} bgColor="transparent" fgColor="#39FF14" />
                  </div>
                </div>

                {/* Balance Display */}
                {/* <div className="glass-card p-4 bg-[#39FF14]/5 border-[#39FF14]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[#39FF14] font-medium">Balance:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#39FF14] font-bold text-lg">
                        {loadingBalance ? "Loading..." : balanceError ? balanceError : `${balance} XRP`}
                      </span>
                      <button
                        onClick={() => getBalance(address)}
                        disabled={loadingBalance}
                        className="p-1 hover:bg-[#39FF14]/10 rounded transition-colors disabled:opacity-50"
                      >
                        <RefreshCcw className={`w-4 h-4 text-[#39FF14] ${loadingBalance ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            <div className="neon-divider my-8"></div>

            {/* EVM Wallet Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                </div>
                <h2 className="text-xl font-bold text-orange-400" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  EVM-Compatible Wallet
                </h2>
              </div>

              {!evmWallet ? (
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">Connect your MetaMask wallet to enable cross-chain bridging</p>
                  <button
                    onClick={connectEvmWallet}
                    disabled={connecting}
                    className="glass-card w-full py-4 px-6 border-orange-500/30 text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <LinkIcon className="w-5 h-5" />
                      <span className="font-semibold">{connecting ? "Connecting..." : "Connect MetaMask"}</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="glass-card p-4 bg-orange-500/5 border-orange-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-400 font-medium mb-1">Connected</p>
                        <p className="font-mono text-white text-sm">{shorten(evmWallet)}</p>
                      </div>
                      <button
                        onClick={disconnectEvmWallet}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bridge Ready Section */}
          {evmWallet && address && (
            <div className="glass-card p-8 bg-[#39FF14]/5 border-[#39FF14]/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-[#39FF14]" />
                </div>
                <h3 className="text-2xl font-bold glow-text-subtle mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  Ready to Bridge!
                </h3>
                <p className="text-gray-300 mb-6">
                  Both wallets are connected. You can now bridge XRP to your EVM wallet.
                </p>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">From (XRPL):</span>
                    <span className="font-mono text-[#39FF14]">{shorten(address)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">To (EVM):</span>
                    <span className="font-mono text-orange-400">{shorten(evmWallet)}</span>
                  </div>
                </div>

                <button onClick={handleBridgeNow} className="neon-button w-full py-4 text-lg font-semibold">
                  <ArrowRight className="w-6 h-6 mr-3" />
                  Bridge Now!
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/")}
              className="glass-card px-6 py-3 border-gray-500/30 text-gray-300 hover:border-gray-400/50 hover:bg-gray-500/10 transition-all duration-300"
            >
              Back to Home
            </button>
            {!evmWallet && (
              <button
                onClick={() => navigate("/claim")}
                className="glass-card px-6 py-3 border-[#39FF14]/30 text-[#39FF14] hover:border-[#39FF14]/50 hover:bg-[#39FF14]/10 transition-all duration-300"
              >
                Bridge Tool
              </button>
            )}
          </div>

          {/* Copy Success Toast */}
          {copySuccess && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
              <div className="glass-card p-4 border-[#39FF14]/50 bg-[#39FF14]/10">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#39FF14] mr-2" />
                  <p className="text-[#39FF14] font-medium">Address copied to clipboard!</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="glass-card p-4 inline-block">
              <div className="flex items-center justify-center gap-4 text-[#39FF14] glow-text-subtle text-sm">
                <Shield className="w-4 h-4" />
                <span>Secure Connection</span>
                <div className="w-1 h-1 bg-[#39FF14] rounded-full"></div>
                <span>XRPL Network</span>
                <div className="w-1 h-1 bg-[#39FF14] rounded-full"></div>
                <span>Ready to Bridge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

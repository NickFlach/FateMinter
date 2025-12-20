import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { truncateAddress, CHAIN_CONFIG, cn } from "@/lib/utils";

interface WalletConnectProps {
  n3Address: string;
  setN3Address: (addr: string) => void;
  evmAddress: string;
  setEvmAddress: (addr: string) => void;
  chainId: number;
}

export function WalletConnect({
  n3Address,
  setN3Address,
  evmAddress,
  setEvmAddress,
  chainId
}: WalletConnectProps) {
  const [n3Input, setN3Input] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const connectEVM = async () => {
    setIsConnecting(true);
    setError("");
    try {
      if (!(window as any).ethereum) {
        throw new Error("No EVM wallet found. Please install MetaMask.");
      }
      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setEvmAddress(accounts[0]);
    } catch (err: any) {
      setError(err.message || "Failed to connect EVM wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleN3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (n3Input.length < 30) {
      setError("Invalid Neo N3 address");
      return;
    }
    setN3Address(n3Input);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
      {/* N3 Wallet Section */}
      <Card className="bg-card/50 border-primary/20 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400 font-display">
            <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="font-bold text-xs">N3</span>
            </div>
            Neo N3 Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {n3Address ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20 flex items-center justify-between">
                <span className="font-mono text-sm">{truncateAddress(n3Address)}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-green-400 hover:text-green-300"
                  onClick={() => setN3Address("")}
                >
                  Disconnect
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400/70">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready for N3 operations</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleN3Submit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Manual Connect</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Paste your Neo N3 Address" 
                    value={n3Input}
                    onChange={(e) => setN3Input(e.target.value)}
                    className="bg-black/20 border-white/10 focus:border-green-500/50 font-mono text-sm"
                  />
                  <Button type="submit" variant="outline" className="border-green-500/20 hover:bg-green-500/10 text-green-400">
                    Connect
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                *Paste your N3 address manually for this demo.
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      {/* EVM Wallet Section */}
      <Card className="bg-card/50 border-primary/20 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400 font-display">
            <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            EVM Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {evmAddress ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20 flex items-center justify-between">
                <span className="font-mono text-sm">{truncateAddress(evmAddress)}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => setEvmAddress("")}
                >
                  Disconnect
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current Network:</span>
                <span className={cn("px-2 py-0.5 rounded border font-mono", 
                  chainId === CHAIN_CONFIG.NEO_X.id 
                    ? "bg-green-500/10 border-green-500/30 text-green-400" 
                    : chainId === CHAIN_CONFIG.ETHEREUM.id 
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                )}>
                  {chainId === CHAIN_CONFIG.NEO_X.id ? "Neo X" : chainId === CHAIN_CONFIG.ETHEREUM.id ? "Ethereum" : `Chain ID: ${chainId}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Button 
                onClick={connectEVM} 
                disabled={isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Supports Neo X and Ethereum interactions.
              </p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-950/20 border-red-900/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

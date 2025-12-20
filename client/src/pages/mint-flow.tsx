import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrowserProvider, parseEther } from "ethers";
import { Stepper } from "@/components/stepper";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CONTRACT_CONFIG } from "@/config/contracts";
import { CHAIN_CONFIG, truncateAddress } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Flame, CheckCircle, ArrowRight, ExternalLink, RefreshCcw, Coins } from "lucide-react";
import pitchforkImg from "@assets/generated_images/neon_glowing_pitchfork_symbol.png";
import fateImg from "@assets/generated_images/mystical_fate_token_coin.png";

type Step = "N3_BURN" | "NEOX_BURN" | "ETH_BURN" | "PAYMENT" | "MINT";

const STEPS_INFO = [
  { id: "N3_BURN", label: "Burn N3" },
  { id: "NEOX_BURN", label: "Burn Neo X" },
  { id: "ETH_BURN", label: "Burn Eth" },
  { id: "PAYMENT", label: "Pay 1 NEO" },
  { id: "MINT", label: "Mint FATE" }
];

export default function MintFlow() {
  // Wallet State
  const [n3Address, setN3Address] = useState("");
  const [evmAddress, setEvmAddress] = useState("");
  const [chainId, setChainId] = useState<number>(0);
  const { toast } = useToast();

  // Workflow State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [txHashes, setTxHashes] = useState({
    N3_BURN: "",
    NEOX_BURN: "",
    ETH_BURN: "",
    PAYMENT: "",
    MINT: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Ethers listener
  useEffect(() => {
    if ((window as any).ethereum) {
      const provider = new BrowserProvider((window as any).ethereum);
      provider.getNetwork().then(network => setChainId(Number(network.chainId)));
      
      (window as any).ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(Number(newChainId));
      });
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setEvmAddress(accounts[0] || "");
      });
    }
    
    // Load from local storage
    const saved = localStorage.getItem("pitchfork_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTxHashes(parsed.txHashes || {});
      setCurrentStepIndex(parsed.stepIndex || 0);
      setN3Address(parsed.n3Address || "");
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem("pitchfork_state", JSON.stringify({
      txHashes,
      stepIndex: currentStepIndex,
      n3Address
    }));
  }, [txHashes, currentStepIndex, n3Address]);

  // Helpers
  const switchChain = async (targetChainId: number) => {
    if (!(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + targetChainId.toString(16) }],
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const advanceStep = () => {
    if (currentStepIndex < STEPS_INFO.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Actions
  const handleN3Burn = async (manualHash?: string) => {
    if (!manualHash) {
      // Simulate N3 wallet interaction
      toast({ title: "Initiating N3 Burn..." });
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 2000));
      const mockHash = "0x" + Math.random().toString(16).slice(2) + "..." + Math.random().toString(16).slice(2);
      setTxHashes(prev => ({ ...prev, N3_BURN: mockHash }));
      setIsProcessing(false);
      toast({ title: "Burn Confirmed!", description: "Pitchfork burned on N3." });
      advanceStep();
    } else {
      setTxHashes(prev => ({ ...prev, N3_BURN: manualHash }));
      advanceStep();
    }
  };

  const handleEVMAction = async (type: "NEOX_BURN" | "ETH_BURN" | "PAYMENT_NEOX") => {
    if (!evmAddress) {
      toast({ title: "Connect Wallet", description: "Please connect your EVM wallet first.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      // Chain check
      const targetChainId = type === "ETH_BURN" ? CHAIN_CONFIG.ETHEREUM.id : CHAIN_CONFIG.NEO_X.id;
      if (chainId !== targetChainId) {
        await switchChain(targetChainId);
        // Wait for chain switch to propagate
        await new Promise(r => setTimeout(r, 1000));
      }

      // Mock Transaction
      // In real app: contract.burn() or sendTransaction
      const tx = await signer.sendTransaction({
        to: type === "PAYMENT_NEOX" ? CONTRACT_CONFIG.TREASURY_NEOX : (type === "NEOX_BURN" ? CONTRACT_CONFIG.PITCHFORK_NEOX : CONTRACT_CONFIG.PITCHFORK_ETH),
        value: parseEther("0") // 0 value for demo burn, real app would be token transfer
      });

      toast({ title: "Transaction Sent", description: "Waiting for confirmation..." });
      await tx.wait();
      
      const key = type === "PAYMENT_NEOX" ? "PAYMENT" : type;
      setTxHashes(prev => ({ ...prev, [key]: tx.hash }));
      advanceStep();
      toast({ title: "Success!", description: "Transaction confirmed on-chain." });

    } catch (error: any) {
      console.error(error);
      toast({ title: "Transaction Failed", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMint = async () => {
    setIsProcessing(true);
    try {
        // Verify all previous steps
        if (chainId !== CHAIN_CONFIG.NEO_X.id) {
            await switchChain(CHAIN_CONFIG.NEO_X.id);
        }
        
        // Mock Mint Call
        await new Promise(r => setTimeout(r, 3000)); // Simulate verifying proofs
        
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction({
             to: evmAddress, // Self-send 0 to simulate interaction
             value: parseEther("0")
        });
        
        setTxHashes(prev => ({ ...prev, MINT: tx.hash }));
        toast({ 
            title: "FATE FORGED", 
            description: "The ritual is complete. You have attained FATE.",
            className: "bg-primary text-black border-none"
        });
    } catch (error: any) {
        toast({ title: "Mint Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStepIndex) {
      case 0: // N3 Burn
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
             <div className="flex items-center gap-4 mb-8">
                <img src={pitchforkImg} className="w-16 h-16 rounded-full border border-primary/50 shadow-[0_0_15px_var(--color-primary)]" />
                <div>
                    <h2 className="text-2xl font-bold font-display text-primary">Sacrifice on N3</h2>
                    <p className="text-muted-foreground">Burn 1 Pitchfork token on the Neo N3 network.</p>
                </div>
             </div>
             
             <div className="grid gap-4">
                <Button 
                    onClick={() => handleN3Burn()} 
                    disabled={isProcessing || !n3Address}
                    className="h-16 text-lg bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20"
                >
                    {isProcessing ? <RefreshCcw className="animate-spin mr-2"/> : <Flame className="mr-2" />}
                    Initiate Burn on N3
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or verify manually</span></div>
                </div>
                <div className="flex gap-2">
                    <Input placeholder="Paste N3 Tx Hash (0x...)" id="n3-hash" className="font-mono text-sm" />
                    <Button variant="outline" onClick={() => handleN3Burn((document.getElementById("n3-hash") as HTMLInputElement).value)}>Verify</Button>
                </div>
             </div>
          </div>
        );
      case 1: // Neo X Burn
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/50 flex items-center justify-center">
                    <span className="font-display font-bold text-2xl text-green-500">X</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-display text-green-400">Sacrifice on Neo X</h2>
                    <p className="text-muted-foreground">Burn 1 Pitchfork token on the Neo X network.</p>
                </div>
             </div>
             <Button 
                onClick={() => handleEVMAction("NEOX_BURN")} 
                disabled={isProcessing}
                className="w-full h-16 text-lg bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
             >
                {isProcessing ? <RefreshCcw className="animate-spin mr-2"/> : <Flame className="mr-2" />}
                Burn on Neo X
             </Button>
             <p className="text-xs text-muted-foreground text-center">Will prompt network switch to Neo X Mainnet</p>
          </div>
        );
      case 2: // Eth Burn
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/50 flex items-center justify-center">
                    <span className="font-display font-bold text-2xl text-purple-500">Ξ</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-display text-purple-400">Sacrifice on Ethereum</h2>
                    <p className="text-muted-foreground">Burn 1 Pitchfork token on the Ethereum network.</p>
                </div>
             </div>
             <Button 
                onClick={() => handleEVMAction("ETH_BURN")} 
                disabled={isProcessing}
                className="w-full h-16 text-lg bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]"
             >
                {isProcessing ? <RefreshCcw className="animate-spin mr-2"/> : <Flame className="mr-2" />}
                Burn on Ethereum
             </Button>
             <p className="text-xs text-muted-foreground text-center">Will prompt network switch to Ethereum Mainnet</p>
          </div>
        );
      case 3: // Payment
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/50 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-display text-yellow-400">The Toll</h2>
                    <p className="text-muted-foreground">Pay 1 NEO to the treasury to finalize the ritual.</p>
                </div>
             </div>
             
             <Tabs defaultValue="neox" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/40">
                    <TabsTrigger value="neox">Pay on Neo X</TabsTrigger>
                    <TabsTrigger value="n3">Pay on N3</TabsTrigger>
                </TabsList>
                <TabsContent value="neox" className="space-y-4">
                    <Button 
                        onClick={() => handleEVMAction("PAYMENT_NEOX")} 
                        disabled={isProcessing}
                        className="w-full h-14 bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                    >
                        {isProcessing ? "Processing..." : "Pay 1 NEO (via Neo X)"}
                    </Button>
                </TabsContent>
                <TabsContent value="n3" className="space-y-4">
                     <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-md">
                        <p className="text-sm text-yellow-200 mb-2">Send 1 NEO to Treasury:</p>
                        <code className="block bg-black p-2 rounded text-xs font-mono mb-4 break-all select-all">
                            {CONTRACT_CONFIG.TREASURY_N3}
                        </code>
                        <div className="flex gap-2">
                            <Input placeholder="Paste N3 Tx Hash" id="n3-pay-hash" className="font-mono text-sm" />
                            <Button 
                                variant="outline" 
                                className="border-yellow-500/50 text-yellow-500"
                                onClick={() => {
                                    const val = (document.getElementById("n3-pay-hash") as HTMLInputElement).value;
                                    if(val) {
                                        setTxHashes(prev => ({...prev, PAYMENT: val}));
                                        advanceStep();
                                    }
                                }}
                            >
                                Verify
                            </Button>
                        </div>
                     </div>
                </TabsContent>
             </Tabs>
          </div>
        );
      case 4: // Mint
        return (
          <div className="space-y-6 animate-in zoom-in-95 duration-700 text-center">
             <div className="mx-auto w-32 h-32 relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full animate-pulse" />
                <img src={fateImg} className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]" />
             </div>
             
             <h2 className="text-4xl font-display font-black text-white glow-text">FORGE YOUR FATE</h2>
             <p className="text-lg text-muted-foreground max-w-md mx-auto">
                The requirements are met. The pitchforks are burned. The toll is paid.
             </p>
             
             {txHashes.MINT ? (
                 <div className="p-6 bg-primary/10 border border-primary/50 rounded-xl mt-6">
                    <h3 className="text-xl font-bold text-primary mb-2">MINT SUCCESSFUL</h3>
                    <p className="text-sm text-muted-foreground mb-4">You have received your FATE.</p>
                    <a 
                        href={`${CHAIN_CONFIG.NEO_X.explorer}tx/${txHashes.MINT}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-primary hover:underline text-sm"
                    >
                        View Transaction <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                    <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => {
                            localStorage.removeItem("pitchfork_state");
                            window.location.reload();
                        }}
                    >
                        Start New Ritual
                    </Button>
                 </div>
             ) : (
                 <Button 
                    onClick={handleMint}
                    disabled={isProcessing}
                    className="w-full h-20 text-2xl font-black bg-white text-black hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] mt-4"
                 >
                    {isProcessing ? "FORGING..." : "MINT FATE"}
                 </Button>
             )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
            <h1 className="text-3xl font-display font-bold tracking-widest text-primary/80 mb-2">RITUAL PROGRESS</h1>
            <p className="text-muted-foreground text-sm">Complete the steps to qualify for FATE</p>
        </header>

        <WalletConnect 
            n3Address={n3Address} 
            setN3Address={setN3Address}
            evmAddress={evmAddress}
            setEvmAddress={setEvmAddress}
            chainId={chainId}
        />

        <div className="max-w-3xl mx-auto mt-12">
            <Stepper currentStep={currentStepIndex} steps={STEPS_INFO.map((s, i) => ({
                ...s,
                status: i < currentStepIndex ? "completed" : i === currentStepIndex ? "active" : "locked"
            }))} />

            <Card className="mt-12 bg-card/60 border-white/5 backdrop-blur-xl min-h-[400px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <CardContent className="w-full max-w-lg p-6 relative z-10">
                    {renderStepContent()}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

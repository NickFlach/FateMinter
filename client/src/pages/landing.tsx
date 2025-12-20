import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
             <Flame className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold tracking-wider">PITCHFORKS</span>
        </div>
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          Connect Wallet
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-6 flex flex-col justify-center items-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-mono text-gray-300">NEO X MAINNET MINTING LIVE</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-black leading-tight tracking-tighter glow-text">
            BURN THE <br />
            <span className="text-primary">PITCHFORKS</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            A cross-chain rite of passage. Burn Pitchforks on N3, Neo X, and Ethereum to forge your 
            <span className="text-primary font-bold mx-2">FATE</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/mint">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-green-400 text-black font-bold tracking-wide shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-105">
                START THE RITUAL
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5">
              READ MANIFESTO
            </Button>
          </div>
        </motion.div>

        {/* Steps Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full">
          {[
            { title: "BURN", desc: "Sacrifice Pitchforks across 3 chains", icon: Flame },
            { title: "PAY", desc: "Offer 1 NEO to the treasury", icon: Coins },
            { title: "MINT", desc: "Receive FATE on Neo X", icon: ArrowRight }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (i + 1) }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, ExternalLink, Send, ArrowDownLeft, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { USDT_ADDRESS, USDC_ADDRESS, ERC20_ABI } from "@/config/web3";
import { base, baseSepolia } from "wagmi/chains";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const mockTxHistory = [
  { hash: "0xa1b2c3d4e5f6...7890", type: "receive" as const, amount: "250.00", token: "USDT", date: "2026-04-08", status: "confirmed" },
  { hash: "0xf9e8d7c6b5a4...3210", type: "send" as const, amount: "50.00", token: "USDC", date: "2026-04-07", status: "confirmed" },
  { hash: "0x1122334455...6677", type: "receive" as const, amount: "0.005", token: "ETH", date: "2026-04-06", status: "confirmed" },
];

export default function WalletDashboard() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: ethBalance } = useBalance({ address });
  const { data: usdtRaw } = useReadContract({ address: USDT_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: address ? [address] : undefined });
  const { data: usdcRaw } = useReadContract({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: address ? [address] : undefined });
  const usdtFormatted = usdtRaw ? Number(formatUnits(usdtRaw as bigint, 6)).toFixed(2) : "0.00";
  const usdcFormatted = usdcRaw ? Number(formatUnits(usdcRaw as bigint, 6)).toFixed(2) : "0.00";
  const ethFormatted = ethBalance ? Number(formatUnits(ethBalance.value, 18)).toFixed(6) : "0.000000";

  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [sendForm, setSendForm] = useState({ to: "", amount: "", token: "USDT" });
  const [sending, setSending] = useState(false);

  const networkName = chainId === base.id ? "Base Mainnet" : chainId === baseSepolia.id ? "Base Sepolia" : "Unknown";
  const isTestnet = chainId === baseSepolia.id;

  // Save wallet address to user_wallets when connected
  useEffect(() => {
    if (!user || !isConnected || !address) return;
    supabase
      .from("user_wallets")
      .update({ wallet_address: address })
      .eq("user_id", user.id)
      .then(({ error }) => {
        if (error) console.error("Failed to save wallet address:", error);
      });
  }, [user, isConnected, address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  const handleSend = async () => {
    if (!sendForm.to || !sendForm.amount) return;
    setSending(true);
    // Simulate transaction
    await new Promise((r) => setTimeout(r, 2000));
    setSending(false);
    setShowSend(false);
    toast.success("Transaction submitted!", {
      description: `Sent ${sendForm.amount} ${sendForm.token} to ${truncateAddress(sendForm.to)}`,
    });
    setSendForm({ to: "", amount: "", token: "USDT" });
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h2 className="font-display font-bold text-2xl text-foreground">Wallet</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-12 text-center"
        >
          <Wallet className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Base wallet to view balances, send & receive crypto.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Wallet</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isTestnet ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary"}`}>
              {networkName}
            </span>
            {isTestnet && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                Testnet Mode
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSend(true)} className="gap-2 rounded-xl">
            <Send size={14} /> Send
          </Button>
          <Button onClick={() => setShowReceive(!showReceive)} variant="outline" className="gap-2 rounded-xl">
            <ArrowDownLeft size={14} /> Receive
          </Button>
        </div>
      </div>

      {/* Address Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
        <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
        <div className="flex items-center gap-3">
          <code className="text-foreground font-mono text-sm sm:text-base break-all">{address}</code>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={copyAddress}>
            <Copy size={14} />
          </Button>
        </div>
      </motion.div>

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "USDT", value: usdtFormatted, sub: "Base" },
          { label: "USDC", value: usdcFormatted, sub: "Base" },
          { label: "ETH", value: ethFormatted, sub: "Gas" },
        ].map((b) => (
          <motion.div key={b.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">{b.label} <span className="text-muted-foreground/60">({b.sub})</span></p>
            <p className="text-2xl font-bold text-foreground mt-1">{b.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Receive Panel */}
      {showReceive && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Receive Crypto</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCode value={address || ""} size={160} />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">Send crypto to this address on the Base network:</p>
              <code className="block text-sm text-foreground font-mono bg-accent p-3 rounded-lg break-all">{address}</code>
              <Button variant="outline" onClick={copyAddress} className="gap-2">
                <Copy size={14} /> Copy Address
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Send Modal */}
      {showSend && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Send Crypto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Recipient Address</Label>
              <Input placeholder="0x..." value={sendForm.to} onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })} className="bg-accent border-border font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <Input type="number" placeholder="0.00" value={sendForm.amount} onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })} className="bg-accent border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Token</Label>
              <Select value={sendForm.token} onValueChange={(v) => setSendForm({ ...sendForm, token: v })}>
                <SelectTrigger className="bg-accent border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Estimated Gas Fee: <span className="text-foreground">~0.0001 ETH</span></p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowSend(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={!sendForm.to || !sendForm.amount || sending}>
              {sending ? "Sending..." : "Confirm & Send"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-4 font-medium">Hash</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTxHistory.map((tx, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="p-4 font-mono text-foreground">
                    <a href={`https://basescan.org/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      {tx.hash} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tx.type === "receive" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                      {tx.type === "receive" ? "Received" : "Sent"}
                    </span>
                  </td>
                  <td className="p-4 text-foreground font-semibold">{tx.amount} {tx.token}</td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{tx.date}</td>
                  <td className="p-4"><span className="flex items-center gap-1 text-primary"><CheckCircle2 size={14} /> Confirmed</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

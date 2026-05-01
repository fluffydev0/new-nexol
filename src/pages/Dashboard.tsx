import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import PaymentScheduler from "@/components/dashboard/PaymentScheduler";
import VaultFeature from "@/components/dashboard/VaultFeature";
import YieldCalculator from "@/components/dashboard/YieldCalculator";
import WalletDashboard from "@/components/dashboard/WalletDashboard";
import GiftCardPage from "@/components/dashboard/GiftCardPage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_wallets")
      .select("usdc_balance")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setWalletBalance(Number(data.usdc_balance));
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 shrink-0 gap-2">
            <SidebarTrigger className="mr-2" />
            <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:inline">
              {user.email}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <ConnectButton
                chainStatus="icon"
                accountStatus="avatar"
                showBalance={false}
              />
              <span className="text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
                {walletBalance.toFixed(2)} USDC
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
                <LogOut size={14} />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="redeem" element={<GiftCardPage />} />
              <Route path="giftcard" element={<GiftCardPage />} />
              <Route path="scheduler" element={<PaymentScheduler />} />
              <Route path="vault" element={<VaultFeature />} />
              <Route path="wallet" element={<WalletDashboard />} />
              <Route path="calculator" element={<YieldCalculator />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

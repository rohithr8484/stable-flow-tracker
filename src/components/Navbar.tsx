import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import WalletConnectControl from "@/components/WalletConnectControl";
import MezoPassportButton from "@/components/MezoPassportButton";
import { logWalletActivity } from "@/lib/walletActivity";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/risk-analysis", label: "Risk Analysis" },
  { to: "/blockchain-forensics", label: "Blockchain Forensics" },
  { to: "/aml-screening", label: "AML Screening" },
  { to: "/contract-risk", label: "Contract Risk" },
  { to: "/compliance", label: "Compliance" },
];

const routeAction: Record<string, string> = {
  "/": "viewed_home",
  "/risk-analysis": "viewed_risk_analysis",
  "/blockchain-forensics": "viewed_blockchain_forensics",
  "/investigation": "viewed_blockchain_forensics",
  "/aml-screening": "viewed_aml_screening",
  "/contract-risk": "viewed_contract_risk",
  "/compliance": "viewed_compliance",
};

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const loggedRoutes = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected || !address) return;
    const action = routeAction[location.pathname];
    if (!action) return;
    const key = `${address.toLowerCase()}::${action}`;
    if (loggedRoutes.current.has(key)) return;
    loggedRoutes.current.add(key);
    void logWalletActivity(address, action, chain?.id);
  }, [location.pathname, address, isConnected, chain?.id]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-heading font-bold text-lg text-foreground hidden sm:inline">Mezo Auth Comply</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 min-w-0">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <MezoPassportButton />
            <WalletConnectControl size="sm" />
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 px-4 space-y-2">
            <MezoPassportButton className="w-full" />
            <WalletConnectControl className="w-full" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

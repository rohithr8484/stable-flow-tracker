import { motion } from "framer-motion";
import { FileCheck, AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const volumeData = [
  { month: "Jan 2025", MUSD: 520, BTC: 300 },
  { month: "Feb 2025", MUSD: 150, BTC: 420 },
  { month: "Apr 2025", MUSD: 350, BTC: 310 },
];

const complianceItems = [
  { label: "AML Screening", status: "pass", detail: "All addresses cleared" },
  { label: "KYC Verification", status: "pass", detail: "Identity verified" },
  { label: "OFAC Check", status: "warning", detail: "1 flagged entity" },
  { label: "Travel Rule", status: "pass", detail: "Compliant" },
  { label: "Transaction Monitoring", status: "pass", detail: "No anomalies" },
  { label: "Sanctions Screening", status: "warning", detail: "Pending review" },
];

const statusIcon = {
  pass: <CheckCircle className="h-4 w-4 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  fail: <AlertTriangle className="h-4 w-4 text-destructive" />,
};

const stats = [
  { label: "Total Transfers Monitored", value: "12,847", icon: TrendingUp },
  { label: "Flagged Transactions", value: "23", icon: AlertTriangle },
  { label: "Compliance Score", value: "94%", icon: FileCheck },
  { label: "Avg Review Time", value: "4.2m", icon: Clock },
];

const Compliance = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Compliance Dashboard</h1>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <div className="font-heading text-2xl font-bold text-foreground">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Volume Chart */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Filtered Gross Transfer Volume
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} tickFormatter={(v) => `$${v}B`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 41%, 10%)",
                    border: "1px solid hsl(222, 20%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 95%)",
                  }}
                />
                <Legend />
                <Bar dataKey="MUSD" fill="hsl(205, 80%, 70%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="BTC" fill="hsl(222, 47%, 20%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Competitive positioning */}
          <div className="glass-card p-6">
            <h3 className="font-heading text-xl font-bold text-foreground mb-4">Competitive Positioning</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Compare your liquidity sources vs. competitors.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Track relationship changes month-by-month.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Understand where competitors get growth and where you can differentiate.
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Compliance Checklist</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {complianceItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                {statusIcon[item.status as keyof typeof statusIcon]}
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Compliance;

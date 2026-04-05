import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, FileCheck, ArrowRight, Cpu, Lock, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const services = [
  {
    icon: Search,
    title: "Risk Analysis",
    desc: "Analyze BTC and MUSD addresses for incoming/outgoing risk exposure with real-time scoring.",
    to: "/risk-analysis",
  },
  {
    icon: Shield,
    title: "Investigation",
    desc: "Trace transaction flows, identify source and destination of funds across BTC and MUSD networks.",
    to: "/investigation",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    desc: "Institutional-grade compliance dashboards for treasury operations, AML/KYC monitoring.",
    to: "/compliance",
  },
];

const features = [
  { icon: Cpu, title: "AI-Powered Analysis", desc: "Machine learning models detect suspicious patterns in real time." },
  { icon: Lock, title: "Institutional Security", desc: "Enterprise-grade encryption and access controls." },
  { icon: BarChart3, title: "Treasury Analytics", desc: "Deep insights into MUSD and BTC portfolio risk exposure." },
  { icon: Globe, title: "Multi-Chain Support", desc: "Track transactions across BTC, ETH, and MUSD ecosystems." },
];

const Index = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Institutional Compliance Infrastructure
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            BTC Treasury Management &{" "}
            <span className="text-gradient">Institutional Services</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Enterprise compliance infrastructure for BTC and MUSD treasury operations.
            Analyze risk, trace transactions, and maintain regulatory compliance at scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/risk-analysis">
                Start Analysis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/investigation">Explore Investigation</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Services */}
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">Core Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <Link to={s.to} className="glass-card p-6 block h-full hover:glow-blue transition-shadow group">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 px-4 border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">Platform Capabilities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="text-center p-5"
            >
              <div className="p-3 rounded-xl bg-secondary w-fit mx-auto mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-heading font-semibold text-foreground text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto text-center text-xs text-muted-foreground">
        © 2026 BTC Treasury Management & Institutional Services. All rights reserved.
      </div>
    </footer>
  </div>
);

export default Index;

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, FileCheck, ArrowRight, Cpu, Lock, BarChart3, Globe, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnectControl from "@/components/WalletConnectControl";
import MezoPassportButton from "@/components/MezoPassportButton";
import OracleFeedsBanner from "@/components/OracleFeedsBanner";
import Navbar from "@/components/Navbar";
import heroImg from "@/assets/hero-treasury.jpg";
import riskImg from "@/assets/service-risk.jpg";
import investigationImg from "@/assets/service-investigation.jpg";
import complianceImg from "@/assets/service-compliance.jpg";
import amlImg from "@/assets/service-aml.jpg";

const services = [
  {
    icon: Search,
    title: "Risk Analysis",
    desc: "Analyze BTC and MUSD addresses for incoming/outgoing risk exposure with real-time scoring.",
    to: "/risk-analysis",
    img: riskImg,
  },
  {
    icon: Shield,
    title: "Investigation",
    desc: "Trace transaction flows, identify source and destination of funds across BTC and MUSD networks.",
    to: "/investigation",
    img: investigationImg,
  },
  {
    icon: FileCheck,
    title: "Compliance",
    desc: "Institutional-grade compliance dashboards for treasury operations, AML/KYC monitoring.",
    to: "/compliance",
    img: complianceImg,
  },
  {
    icon: ShieldAlert,
    title: "AML Screening",
    desc: "Screen addresses against global sanctions lists, PEP databases, and adverse media for compliance.",
    to: "/aml-screening",
    img: amlImg,
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
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroImg} alt="BTC Treasury Infrastructure" className="w-full h-full object-cover opacity-30" width={1280} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      <div className="container mx-auto text-center max-w-4xl relative z-10">
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <WalletConnectControl size="lg" />
            <MezoPassportButton size="lg" />
            <Button asChild size="lg" className="gap-2">
              <Link to="/risk-analysis">
                Start Analysis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/aml-screening">AML Screening</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Services */}
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">Core Services</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
            >
              <Link to={s.to} className="glass-card block h-full hover:glow-blue transition-shadow group overflow-hidden">
                <div className="h-44 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={640}
                    height={512}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground text-lg">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
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

    {/* Oracle Feeds */}
    <OracleFeedsBanner />

    {/* Footer */}
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto text-center text-xs text-muted-foreground">
        © 2026 BTC Treasury Management & Institutional Services. All rights reserved.
      </div>
    </footer>
  </div>
);

export default Index;

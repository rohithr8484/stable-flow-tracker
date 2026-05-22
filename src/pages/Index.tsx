import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  FileCheck,
  ArrowRight,
  Cpu,
  Lock,
  BarChart3,
  Globe,
  ShieldAlert,
  FileCode2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import WalletConnectControl from "@/components/WalletConnectControl";
import Navbar from "@/components/Navbar";
import MezoPassportButton from "@/components/MezoPassportButton";
import PriceFeed from "@/components/PriceFeed";
import heroImg from "@/assets/hero-treasury.jpg";
import riskImg from "@/assets/service-risk.jpg";
import investigationImg from "@/assets/service-investigation.jpg";
import complianceImg from "@/assets/service-compliance.jpg";
import amlImg from "@/assets/service-aml.jpg";

const services = [
  {
    icon: Search,
    title: "Risk Analysis",
    desc: "Real-time risk scoring for BTC and MUSD addresses with deep exposure breakdowns and counterparty intelligence.",
    to: "/risk-analysis",
    img: riskImg,
    accent: "from-primary/30 to-cyan-glow/10",
  },
  {
    icon: Shield,
    title: "Blockchain Forensics",
    desc: "Trace transaction flows across chains with graph visualizations and AI-generated investigative summaries.",
    to: "/blockchain-forensics",
    img: investigationImg,
    accent: "from-purple-glow/30 to-primary/10",
  },
  {
    icon: ShieldAlert,
    title: "AML Screening",
    desc: "Screen against sanctions, PEP databases, adverse media, and FATF typologies in one unified pipeline.",
    to: "/aml-screening",
    img: amlImg,
    accent: "from-destructive/30 to-warning/10",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    desc: "Institutional dashboards for treasury operations, AML/KYC monitoring, and audit-ready reporting.",
    to: "/compliance",
    img: complianceImg,
    accent: "from-accent/30 to-cyan-glow/10",
  },
  {
    icon: FileCode2,
    title: "Contract Risk",
    desc: "Smart-contract auditing with vulnerability detection across reentrancy, overflow, and access-control vectors.",
    to: "/contract-risk",
    img: riskImg,
    accent: "from-warning/30 to-destructive/10",
  },
];

const features = [
  { icon: Cpu, title: "AI-Powered Analysis", desc: "ML models surface suspicious patterns and adverse media in real time." },
  { icon: Lock, title: "Institutional Security", desc: "End-to-end encryption with enterprise access controls." },
  { icon: BarChart3, title: "Treasury Analytics", desc: "Deep portfolio insight across MUSD and BTC exposure." },
  { icon: Globe, title: "Multi-Chain Support", desc: "BTC, ETH, Mezo, and MUSD ecosystems in one view." },
];

const stats = [
  { value: "$4.2B+", label: "Assets monitored" },
  { value: "180M+", label: "Addresses screened" },
  { value: "99.97%", label: "Uptime SLA" },
  { value: "< 800ms", label: "Avg. scoring latency" },
];

const workflow = [
  {
    icon: Search,
    title: "1. Ingest",
    desc: "Connect wallets, addresses, or upload batches across BTC, EVM, and MUSD networks.",
  },
  {
    icon: Activity,
    title: "2. Analyze",
    desc: "AI models score risk, trace flows, and cross-reference global watchlists in seconds.",
  },
  {
    icon: FileCheck,
    title: "3. Report",
    desc: "Generate audit-ready evidence packs with LLM-written investigative summaries.",
  },
];

const faqs = [
  {
    q: "Which blockchains does the platform support?",
    a: "We support Bitcoin (BTC), Ethereum (ETH), Mezo mainnet and testnet, and the full MUSD ecosystem. Cross-chain tracing works out of the box without manual reconciliation.",
  },
  {
    q: "How is the risk score calculated?",
    a: "Risk scores combine on-chain heuristics, counterparty exposure, sanctions matches, behavioral typologies (structuring, layering, velocity), and adverse media signals. Each score is fully decomposed so analysts can audit every contributing factor.",
  },
  {
    q: "Which sanctions and watchlists are checked during AML screening?",
    a: "OFAC SDN, EU consolidated list, UK HMT, UN Security Council, FATF high-risk jurisdictions, and curated PEP datasets — refreshed continuously. Adverse media uses NLP across global news sources.",
  },
  {
    q: "Can I use the AI chatbot for live blockchain data?",
    a: "Yes. The integrated Treasury Advisor and Boar MCP modes resolve ENS names, fetch live balances, decode failed transactions, list ERC-20 holdings, and query UTXO sets on demand.",
  },
  {
    q: "Is the platform suitable for regulated financial institutions?",
    a: "Yes. We provide audit logs, role-based access, SOC 2-aligned controls, and exportable evidence documentation that satisfies FinCEN, FCA, and MiCA reporting requirements.",
  },
  {
    q: "Do I need to install anything to get started?",
    a: "No. The platform runs entirely in the browser. Connect a wallet or paste an address to start an analysis — no SDK, no infrastructure setup.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Index = () => (
  <div className="min-h-screen relative overflow-hidden">
    {/* Ambient background */}
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute -top-32 -left-32 w-[42rem] h-[42rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-[40rem] h-[40rem] rounded-full bg-purple-glow/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    </div>

    <div className="relative z-10">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="BTC Treasury Infrastructure"
            className="w-full h-full object-cover opacity-20"
            width={1280}
            height={640}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-primary text-xs font-medium mb-8 shadow-[0_0_30px_-10px_hsl(var(--primary))]">
              <Sparkles className="h-3.5 w-3.5" />
              Institutional Compliance Infrastructure
              <span className="h-1 w-1 rounded-full bg-primary/60" />
              <span className="text-primary/80">v2.6 Live</span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-6">
              BTC Treasury at{" "}
              <span className="text-gradient">institutional scale</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Score risk, trace funds, screen sanctions, and ship audit-ready reports — all
              in one unified platform built for treasuries, custodians, and regulators.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
              <Button asChild size="lg" className="gap-2 shadow-[0_10px_40px_-10px_hsl(var(--primary))]">
                <Link to="/risk-analysis">
                  Start free analysis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="backdrop-blur-md">
                <Link to="/aml-screening">Run AML Screening</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <MezoPassportButton />
              <WalletConnectControl size="default" />
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              {["SOC 2 aligned", "FATF compliant", "MiCA ready", "OFAC integrated"].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Price Feeds */}
      <PriceFeed />

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="glass-card p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <div className="font-heading text-3xl md:text-4xl font-bold text-gradient">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-3">
              <Zap className="h-3.5 w-3.5" /> Core Services
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything compliance teams need
            </h2>
            <p className="text-muted-foreground">
              Modular workflows covering pre-trade screening, post-trade investigation, and continuous monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={i}
                variants={fadeUp}
              >
                <Link
                  to={s.to}
                  className="glass-card block h-full hover:glow-blue transition-all duration-300 group overflow-hidden hover:-translate-y-1"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={s.img}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      width={640}
                      height={512}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} mix-blend-overlay`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <div className="absolute top-3 left-3 p-2 rounded-lg bg-background/60 backdrop-blur-md border border-border/50">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold text-foreground text-lg">{s.title}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-3">
              <TrendingUp className="h-3.5 w-3.5" /> Workflow
            </div>
            <h2 className="font-heading text-4xl font-bold text-foreground">From address to audit in three steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {workflow.map((w, i) => (
              <motion.div
                key={w.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="glass-card p-6 text-center relative"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center mb-4 shadow-[0_10px_40px_-10px_hsl(var(--primary))]">
                  <w.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">{w.title}</h4>
                <p className="text-sm text-muted-foreground">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-4xl font-bold text-center text-foreground mb-14">Platform Capabilities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="glass-card p-6 text-center hover:border-primary/40 transition-colors group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-foreground text-sm mb-2">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" /> FAQ
            </div>
            <h2 className="font-heading text-4xl font-bold text-foreground mb-3">Frequently asked questions</h2>
            <p className="text-muted-foreground">Everything you need to know before getting started.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-2 md:p-4"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-border/40 last:border-0 px-3"
                >
                  <AccordionTrigger className="text-left font-heading font-medium text-foreground hover:text-primary hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pr-4">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card p-10 md:p-14 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative z-10">
              <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to ship compliant treasury operations?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Start analyzing addresses in seconds. No setup, no SDK — just connect and screen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/risk-analysis">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/compliance">View Compliance</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            BTC Treasury Management
          </div>
          <div className="text-xs text-muted-foreground">
            © 2026 BTC Treasury Management & Institutional Services. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  </div>
);

export default Index;

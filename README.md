# 🛡 Mezo Auth Comply - AI-Powered Blockchain Compliance & Risk Intelligence Platform

Mezo Auth Comply is an AI-powered blockchain compliance, AML, and transaction intelligence platform built for the Mezo ecosystem.  
The platform provides real-time transaction monitoring, forensic analysis, sanctions screening, wallet risk scoring, and smart contract risk detection using advanced compliance infrastructure.

<img width="1806" height="871" alt="image" src="https://github.com/user-attachments/assets/compliance-dashboard.png" />

<p align="left"> 
<img src="https://img.shields.io/badge/Compliance-red?style=flat-square" /> 
<img src="https://img.shields.io/badge/AML-blue?style=flat-square" /> 
<img src="https://img.shields.io/badge/Blockchain%20Forensics-yellow?style=flat-square" /> 
<img src="https://img.shields.io/badge/Risk%20Analysis-green?style=flat-square" /> 
</p>

---

## ✨ Features

**🛡 Risk Analysis**

AI-powered transaction intelligence and wallet risk monitoring.

- Risk Analysis Transaction Graph
- Sender → Transaction → Receiver flow analysis
- Each row below the main flow represents token transfers between two addresses
- Wallet Connections Breakdown
- Wallet risk score analysis
- Suspicious wallet interaction detection
- Transaction exposure monitoring
- Behavioral transaction analysis

---

**🔍 Blockchain Forensics**

Advanced forensic investigation and blockchain intelligence infrastructure.

- Forensic Transaction Graph
- AI Summary — Transaction Graph
- Entity Investigation Graph
- Transaction Flow visualization
- AI Summary — Entity Map
- Wallet clustering and entity attribution
- Cross-wallet activity tracing
- On-chain forensic investigation workflows

---

**🚨 AML Screening**

Real-time AML monitoring and sanctions intelligence systems.

- AML Transaction Flow Graph
- Sanctions Checks
- Real-time screening against 6 global watchlists
- Payment Screening
- Behavior analysis against laundering typologies & FATF red-flag indicators
- Adverse Media Screening
- AML Screening Results
- Automated compliance monitoring
- Continuous transaction surveillance

---

**📑 Contract Risk Analyser**

AI-powered smart contract security and risk intelligence engine.

- Moderate risks identified
- Recommended to address before production use
- Smart contract vulnerability analysis
- Administrative permission checks
- Upgradeability risk detection
- Suspicious logic analysis
- Security best-practice validation
- Production deployment readiness insights

---

**📊 AI Compliance Intelligence**

AI-powered compliance and transaction investigation infrastructure.

- AI-generated compliance summaries
- AI-powered entity mapping
- Automated transaction insights
- Wallet relationship intelligence
- Behavioral anomaly detection
- Compliance risk recommendations
- AI-assisted forensic investigations

---

## 🛠 Tech Stack

### Frontend
- **React** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### State Management
- **React Query** - Server state management
- **Zod** - Schema validation

### Blockchain Infrastructure
- **Wagmi** - React Hooks for blockchain
- **Viem** - Blockchain interaction library
- **Ethers.js** - Smart contract interaction
- **Mezo RPC** - Blockchain connectivity
- **MUSD SDK** - Stablecoin transaction monitoring

### AI & Compliance Infrastructure
- **AI Risk Engine** - Wallet and transaction scoring
- **Graph Intelligence Engine** - Wallet relationship analysis
- **AML Detection Engine** - Suspicious activity monitoring
- **Entity Resolution System** - Wallet clustering & attribution

### Monitoring & Analytics
- **Real-Time Monitoring** - Continuous transaction analysis
- **Behavioral Analytics** - Wallet activity intelligence
- **Forensic Investigation Tools** - Blockchain tracing infrastructure
- **Compliance Reporting** - AML & sanctions reporting systems

### UI/UX Enhancements
- **Lucide Icons** - Beautiful iconography
- **Sonner** - Toast notifications
- **React Flow** - Graph & transaction visualization

---

## Technical Architecture

<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/compliance-architecture.png" />

---

## Compliance Infrastructure

### 🛡 Risk Analysis Engine

Analyze wallet behavior, transaction exposure, and suspicious interactions.

- Wallet risk score generation
- Sender → Receiver transaction tracing
- Wallet exposure intelligence
- High-risk transaction monitoring
- Wallet relationship mapping
- Transaction graph visualization

---

### 🔍 Blockchain Forensics Engine

Advanced blockchain investigation and forensic intelligence tools.

- Forensic transaction graph analysis
- Entity investigation workflows
- Wallet clustering infrastructure
- AI-generated investigation summaries
- Transaction tracing systems
- Cross-wallet relationship analytics

---

### 🚨 AML Screening Infrastructure

Real-time AML monitoring and sanctions intelligence platform.

- Global sanctions list screening
- FATF red-flag analysis
- Payment behavior monitoring
- Adverse media screening
- Suspicious activity detection
- AML compliance reporting

---

### 📑 Contract Risk Analyzer

Analyze smart contracts for vulnerabilities and production risks.

- Smart contract scanning
- Permission analysis
- Security validation checks
- Upgradeability analysis
- Risk recommendations
- Deployment readiness assessment

---

## Environment Variables

### 🌐 Blockchain Infrastructure

```bash
MEZO_CHAIN_ID=

MEZO_RPC_HTTP=

MEZO_RPC_WS=

MEZO_BLOCK_EXPLORER=
```

### 🤖 AI Compliance Engine

```bash
AI_RISK_ENGINE_KEY=

AI_ANALYTICS_ENDPOINT=

ENTITY_RESOLUTION_API=

FORENSICS_ENGINE_KEY=
```

### 🚨 AML Infrastructure

```bash
AML_SCREENING_API_KEY=

SANCTIONS_API_KEY=

ADVERSE_MEDIA_API_KEY=

PAYMENT_MONITORING_API=
```

### 🔗 Wallet Infrastructure

```bash
WALLETCONNECT_PROJECT_ID=
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/rohithr8484/stable-flow-tracker.git

cd stable-flow-tracker

cd src

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173`

---

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

---

### 🛠 Features

| **Feature**                     | **Description**                                                            | **Tech Used**              |
| ------------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| **Risk Analysis Engine**        | Wallet risk scoring and suspicious transaction monitoring                  | AI + Graph Analytics       |
| **Transaction Graph Analysis**  | Visual sender-to-receiver transaction intelligence                         | React Flow + Blockchain    |
| **Blockchain Forensics**        | Trace wallet interactions and forensic transaction activity                | AI + Graph Database        |
| **AML Screening**               | Real-time sanctions and payment screening                                  | Explorer Rest APIs + AI              |
| **Adverse Media Detection**     | Detect negative intelligence associated with wallets/entities              | AI Search Infrastructure   |
| **Entity Investigation**        | Wallet clustering and entity mapping                                       | AI Entity Resolution       |
| **Contract Risk Analysis**      | Smart contract vulnerability and permission analysis                       | Solidity + AI              |
| **AI Compliance Summaries**     | Generate automated compliance and forensic investigation reports           | AI Analytics               |

---

### 🚀 Infrastructure Components

| **Infrastructure**              | **Purpose**                                            |
| --------------------------------| ------------------------------------------------------ |
| Mezo RPC Infrastructure         | Blockchain connectivity and monitoring                 |
| AI Compliance Engine            | Wallet risk analysis and AML intelligence              |
| Graph Investigation Engine      | Transaction and wallet relationship mapping            |
| AML Screening Infrastructure    | Global sanctions and payment monitoring                |
| Smart Contract Analyzer         | Security validation and risk detection                 |

---

## Folder Structure

```bash
stable-flow-tracker/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── graphs/
│   ├── compliance/
│   ├── aml/
│   ├── forensics/
│   └── contracts/
│
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

### 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to improve the project.

---

## 📄 License

This project is private. Please contact the maintainer for access.

---

**AI-Powered Compliance Infrastructure for the Future of Blockchain Security 🚀**

*Built with modern compliance infrastructure, blockchain intelligence systems, and AI-powered forensic analytics*

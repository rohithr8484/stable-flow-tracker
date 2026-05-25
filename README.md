# 🛡 Mezo Auth Comply - AI-Powered Blockchain Compliance Infrastructure & Risk Intelligence Platform

Mezo Auth Comply is an AI-powered blockchain compliance, AML, and transaction intelligence platform built for the Mezo ecosystem. The platform provides real-time transaction monitoring, forensic analysis, sanctions screening, wallet risk scoring, and smart contract risk detection for MUSD and BTC transactions using advanced compliance infrastructure.

<img width="1923" height="818" alt="image" src="https://github.com/user-attachments/assets/827c1252-053f-4cbd-86de-3703523d4055" />

<p align="left"> 
<img src="https://img.shields.io/badge/Compliance-red?style=flat-square" /> 
<img src="https://img.shields.io/badge/AML-blue?style=flat-square" /> 
<img src="https://img.shields.io/badge/Blockchain%20Forensics-yellow?style=flat-square" /> 
<img src="https://img.shields.io/badge/Risk%20Analysis-green?style=flat-square" /> 
</p>

---

## ✨ Features on Pay per use 0.2 MUSD or 0.0002 BTC

**🛡 Risk Analysis**

AI-powered transaction intelligence and wallet risk monitoring for MUSD/BTC transactions.

- Risk Analysis Transaction Graph
- Sender → Transaction → Receiver flow analysis
- Wallet Connections Breakdown
- Wallet risk score analysis
- Suspicious wallet interaction detection
- Transaction exposure monitoring
- Behavioral transaction analysis

---

**🔍 Blockchain Forensics**

Advanced forensic investigation and blockchain intelligence infrastructure for MUSD/BTC transactions.

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

Real-time AML monitoring and sanctions intelligence systems for MUSD/BTC transactions.

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

AI-powered smart contract security and risk intelligence engine for MUSD/BTC contracts.

- Moderate risks identified
- Recommended to address before production use
- Smart contract vulnerability analysis
- Administrative permission checks
- Upgradeability risk detection
- Suspicious logic analysis
- Security best-practice validation

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

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/0f72ecf2-5e26-4dcf-9eb4-b7cc886fef14" />

---

## Environment Variables

```bash
VITE_SUPABASE_PROJECT_ID=

VITE_SUPABASE_PUBLISHABLE_KEY=

VITE_SUPABASE_URL=
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

# DeFi Protocol Risk Assessment Report

## Sample Transactions Analysed

| Sl | Transaction Hash | Protocol Component | Category | Key Activity | Risk |
|----|------------------|--------------------|----------|--------------|------|
| 1 | `0x5ad9ee250a6b7b2acfb733da84c4337fa403de90616889fdc0d44a95d1c3466c` | PCV / MUSDSavingsRate | Treasury Accounting | MUSD distribution and equivalent token burn | 35/100 |
| 2 | `0x90a3c725a93fed176eb12cce67bfbcdc9c5ba88a2a208978c26ad3ed8b842112` | PrizePool / VaultGauge | Incentives Distribution | MEZO reward distribution to user | 45/100 |
| 3 | `0xd19aa858a36569226dd46efe9e2df67e58dd5aa4759335a8d5f8028279d14b06` | Router / Liquidity Pool | Swap / Liquidity Routing | BTC and MUSD moved between liquidity pools via router contract | 60/100 |

---

## Smart Contract Risk Analysis

| Contract | Risk Score | Risk Level | Assessment |
|----------|------------|------------|-------------|
| `BTCBackedLoan.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCBridge.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCEscrow.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCFeeCollector.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCGovernance.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCInsurancePool.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCLiquidation.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCMUSDPool.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCPriceFeed.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCReceiverHandler.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCRewardsDistributor.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCSavingsVault.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCSendRouter.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCStaking.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `BTCVesting.sol` | 25/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `BTCYieldFarm.sol` | 100/100 | Critical Risk | Critical vulnerabilities detected — do NOT deploy without remediation. |
| `ComplianceOracle.sol` | 35/100 | Moderate Risk | Moderate risks identified. Recommended to address before production use. |
| `MUSDFlashLoan.sol` | 75/100 | Critical Risk | Critical vulnerabilities detected — do NOT deploy without remediation. |
| `MUSDMinter.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |
| `SafeMath.sol` | 15/100 | Low Risk | Minor risks identified. Generally safe for use. |
| `TreasuryMultisig.sol` | 45/100 | High Risk | High-risk issues found. Requires thorough audit before mainnet deployment. |

---

## Folder Structure

## Folder Structure

```
stable-flow-tracker/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   │
│   │   ├── ui/
│   │   │
│   │   ├── AMLEnhancedChecks.tsx
│   │   ├── AddressInput.tsx
│   │   ├── ChatBot.tsx
│   │   ├── EntityGraph.tsx
│   │   ├── ForensicsSummary.tsx
│   │   ├── InvestigationCaseAnalysis.tsx
│   │   ├── MezoPassportButton.tsx
│   │   ├── NavLink.tsx
│   │   ├── Navbar.tsx
│   │   ├── PaymentGate.tsx
│   │   ├── PriceFeed.tsx
│   │   ├── RiskGauge.tsx
│   │   ├── TransactionAnalytics.tsx
│   │   ├── TransactionFlowDiagram.tsx
│   │   ├── TransactionGraph.tsx
│   │   ├── TransferTable.tsx
│   │   ├── WalletConnectControl.tsx
│   │   ├── WalletConnectionsBreakdown.tsx
│   │   └── WalletProvider.tsx
│   │
│   ├── contracts/
│   │
│   ├── hooks/
│   │
│   ├── integrations/
│   │   └── supabase/
│   │
│   ├── lib/
│   │
│   ├── pages/
│   │
│   ├── test/
│   │
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── supabase/
│
├── .env
├── .gitignore
├── README.md
├── bun.lock
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── playwright-fixture.ts
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---


## Mezo Network Configuration

Connect your wallet to Mezo Testnet (RPC: https://rpc.test.mezo.org, chain ID 31611).

Get BTC + MEZO from faucet ( https://faucet.test.mezo.org/ )

Open Mezo website (testnet)

Deposit testnet BTC as collateral

Borrow → Mint MUSD

MUSD appears in your wallet

- **Network:** Mezo Testnet    **Chain ID:** `31611`


**Native Currency:** MUSD 



**Explorer:**

https://explorer.mezo.org

---

### 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to improve the project.

---

## 📄 License

This project is private. Please contact the maintainer for access.

---

**AI-Powered Compliance Infrastructure for the Future of Blockchain Security 🚀**

*Built with modern compliance infrastructure, blockchain intelligence systems, and AI-powered forensic analytics*

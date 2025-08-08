# Blockchain-based Gamified Rewards Platform

**University of New South Wales – COMP6452 2024 T3 Graduation Project**  
Group: **BOOM**

## 📌 Overview
This platform is a **blockchain-based gamified rewards system** designed to incentivize positive user behaviors through tokenized rewards. It was developed as a team project where each member independently implemented one functional module, followed by final integration into a unified platform.

Our system leverages **Ethereum smart contracts** and integrates multiple features into a single decentralized application (DApp), including:

- **Good Morning** – A staking-based “wake-up check-in” game that rewards users for punctuality.  
- **Weather Insurance** – Purchase high-temperature insurance and receive payouts via smart contracts.  
- **Cross-Chain Transactions** – Transfer tokens between Ethereum Sepolia and Arbitrum Sepolia test networks.

The platform includes **frontend, backend, and blockchain components**, deployed via Docker and accessible via MetaMask.

---

## 🛠️ Tech Stack

- **Blockchain**: Ethereum (Sepolia, Arbitrum Sepolia)  
- **Smart Contracts**: Solidity, Remix IDE  
- **Frontend**: React.js, Web3.js, MetaMask integration  
- **Backend**: Node.js, Oracle services  
- **Deployment**: Docker, Virtual Machine  
- **Other Tools**: npm, Swagger for API documentation

---

## 🚀 My Contribution – *Good Morning (Wake-up Check-in) Module*

I independently designed and implemented the **Good Morning** smart contract module, which gamifies waking up on time by rewarding users with tokens.

### 💡 Design Goals & Ideas
- **Entertainment + Utility** – Encourage punctuality through minimal token staking and rewards.  
- **Sustainable Participation** – Users stake a small amount of tokens, check in within the allowed time, and receive rewards.  
- **Fair Rewarding** – Prevent repeated check-ins in a single round.

### 🔍 Core Logic
1. **User & Admin Management** – Only the contract deployer can assign admin rights and create the participant list. Duplicate registrations are blocked.  
2. **Check-in Process** – Users can check in only once per round when the check-in status is `true`.  
3. **Reward Process** – After check-in closes (time-based or manually by admin), the list is copied to a reward list. Admin toggles reward status to allow token distribution.  
4. **List Reset** – Reward distribution clears the reward list without affecting the next round’s check-in.

---

## 📷 Project Demo & Slides
- [System Design & Architecture PPT](./2ea7cc25-fb22-4635-b42d-4fd5d5bbc328.pptx)  
- [Module Design Document](./59b1a447-d447-4de3-a007-4b397f9bb4dd.docx)

---

## 📜 License
This project is developed as part of **UNSW COMP6452** coursework and is intended for academic demonstration purposes only.


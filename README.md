# 🛡️ ZK-CEASER: Privacy-Preserving STRK Transfers on Starknet

![ZK-CEASER Banner](https://img.shields.io/badge/ZK--CEASER-Privacy%20Preserving-blue?style=for-the-badge&logo=ethereum)

**ZK-CEASER** is a complete privacy-preserving transfer system for STRK tokens on Starknet, combining **real Circle STARKs** with **M31 field arithmetic** using StarkWare's official **STWO prover**.

## 🌟 **Features**

- 🔐 **Real Zero-Knowledge Proofs**: Using STWO (StarkWare Two) official prover
- ⚡ **Circle STARKs**: Next-generation STARK technology
- 🔢 **M31 Field Arithmetic**: Mersenne-31 (2^31 - 1) field operations
- 🌐 **Full-Stack dApp**: React frontend + Node.js backend + Cairo contracts
- 🏦 **Auto-Sustainable**: Backend covers gas costs through collected fees
- 📱 **Production Ready**: 128-bit cryptographic security

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Contracts     │
│   (Next.js)     │────│   (Node.js)     │────│   (Cairo)       │
│                 │    │                 │    │                 │
│ • ZK Proof Gen  │    │ • TX1 Executor  │    │ • FeeCollectorV2│
│ • WASM/Rust     │    │ • Event Monitor │    │ • Paymaster     │
│ • STWO Real     │    │ • Auto-sustain  │    │ • GasCalculator │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### Prerequisites

- **Rust** (nightly-2025-07-14)
- **Node.js** 18+
- **Cairo** 2.11.4+
- **Scarb** 2.11.4+

### 1. Clone Repository

```bash
git clone https://github.com/Zyra-V23/zk-ceaser.git
cd zk-ceaser
```

### 2. Setup STWO Dependencies

```bash
# Clone STWO repositories
git submodule update --init --recursive

# Or manually:
cd external
git clone https://github.com/starkware-libs/stwo.git
git clone https://github.com/starkware-libs/stwo-cairo.git
```

### 3. Build ZK Backend

```bash
cd zk-ceaser-app/zkp-rust-backend
rustup override set nightly-2025-07-14
cargo build --features real-stwo
wasm-pack build --target web --features real-stwo
```

### 4. Setup Frontend

```bash
cd ../
npm install
cp zkp-rust-backend/pkg/zkp_ceaser_bg.wasm public/pkg/
cp zkp-rust-backend/pkg/zkp_ceaser.js public/pkg/
npm run dev
```

### 5. Setup Backend Executor

```bash
cd ../../backend
npm install
cp .env.example .env
# Configure your private keys and RPC URLs
node mixing-executor.js
```

### 6. Deploy Contracts (Optional)

```bash
cd ../ceaser-contracts-v2
scarb build
# Deploy using your preferred method
```

## 🔬 **Technical Deep Dive**

### **Zero-Knowledge Proofs**

ZK-CEASER uses **real STWO proofs** with:

- **Field**: M31 (Mersenne-31: 2^31 - 1)
- **Extension**: QM31 (Quartic extension of M31)
- **STARKs**: Circle STARKs with FRI
- **Hash**: Blake2s (256-bit)
- **Security**: 128-bit cryptographic security

### **Privacy Components**

1. **Pedersen Commitments**: Hide transfer amounts
2. **Range Proofs**: Prove amount validity without revealing value
3. **Nullifiers**: Prevent double-spending
4. **Merkle Proofs**: Anonymous set membership
5. **Metadata Encryption**: Hide receiver information

### **Smart Contracts**

- **FeeCollectorV2**: Core mixing logic with Paymaster integration
- **SmartAccountDeployer**: Deploys ephemeral accounts
- **GasCalculator**: Estimates and manages gas costs
- **Paymaster**: Covers gas using user funds

## 📊 **System Status**

| Component | Status | Technology |
|-----------|---------|------------|
| **ZK Proofs** | ✅ Production | STWO + M31 |
| **Frontend** | ✅ Production | Next.js 15 + WASM |
| **Backend** | ✅ Production | Node.js + StarkNet.js |
| **Contracts** | ✅ Deployed | Cairo 2.11.4 |
| **Security** | ✅ 128-bit | Circle STARKs |

## 🔧 **Configuration**

### Environment Variables

```bash
# Backend (.env)
PIPILONGO_PRIVATE_KEY=0x...
PIPILONGO_ADDRESS=0x...
FEE_COLLECTOR_ADDRESS=0x...
STRK_TOKEN_ADDRESS=0x...
STARKNET_RPC_URL=https://...
```

### Contract Addresses (Sepolia)

```typescript
// Frontend constants
export const MIXING_FEE_COLLECTOR = "0x075e79fdc066b628b691913b16dd642a9813055ee61d681be2696713a811cfa0";
export const STRK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const SMART_ACCOUNT_DEPLOYER = "0x02cc70bc0a28ef66467e96edb1d6c3508b20cd35f50f65d16d03b6763dad4aea";
```

## 🧪 **Testing**

### Unit Tests

```bash
cd zkp-rust-backend
cargo test --features real-stwo
```

### Integration Tests

```bash
cd ceaser-contracts-v2
scarb test
```

### Frontend Tests

```bash
cd zk-ceaser-app
npm test
```

## 📈 **Performance**

| Metric | Value |
|--------|--------|
| **Proof Generation** | ~2-5 seconds |
| **Proof Size** | ~8-16 KB |
| **Verification Time** | ~100-500ms |
| **Gas Cost (TX1)** | ~14-20M gas |
| **Supported Range** | 0.001 - 1000+ STRK |

## 🛣️ **Roadmap**

- [ ] **v2.0**: Full production migration (remove compatibility layer)
- [ ] **v2.1**: Batch proof generation
- [ ] **v2.2**: Mobile app support
- [ ] **v2.3**: Multi-token support
- [ ] **v3.0**: Mainnet deployment

## 🔐 **Security**

### Audits

- **Internal Review**: ✅ Completed
- **External Audit**: 🔄 Planned Q1 2025

### Security Features

- Real cryptographic proofs (not simulated)
- M31 field arithmetic validation
- Circle STARK verification
- Merkle tree inclusion proofs
- Nullifier uniqueness checks

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **StarkWare** for STWO prover and Circle STARKs
- **Starknet Foundation** for the ecosystem
- **OpenZeppelin** for Cairo contract libraries
- **Arkworks** for cryptographic primitives

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/Zyra-V23/zk-ceaser/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zyra-V23/zk-ceaser/discussions)
- **Documentation**: [Wiki](https://github.com/Zyra-V23/zk-ceaser/wiki)

---

<div align="center">

**Made with ❤️ for privacy on Starknet**

[![GitHub stars](https://img.shields.io/github/stars/Zyra-V23/zk-ceaser?style=social)](https://github.com/Zyra-V23/zk-ceaser/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Zyra-V23/zk-ceaser?style=social)](https://github.com/Zyra-V23/zk-ceaser/network/members)

</div>

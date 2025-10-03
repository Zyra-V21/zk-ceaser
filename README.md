# ZK-CEASER: Privacy-Preserving Zero-Knowledge Proof System

<div align="center">

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&duration=2000&pause=800&color=00ff41&background=00000000&center=true&vCenter=true&multiline=true&repeat=true&width=900&height=120&lines=Zero-Knowledge+Proofs+with+Circle+STARKs;M31+Field+Arithmetic+%2B+STWO+Prover;Anonymous+Sets+%2B+Merkle+Tree+Privacy)

</div>

[![License](https://img.shields.io/badge/License-ZK--CEASER%20Non--Commercial-red?style=for-the-badge)](./LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Zyra--V21-blue?style=for-the-badge&logo=github)](https://github.com/Zyra-V21/zk-ceaser)
[![STWO](https://img.shields.io/badge/STWO-Real%20Implementation-green?style=for-the-badge&logo=ethereum)](https://github.com/starkware-libs/stwo)
[![Rust](https://img.shields.io/badge/Rust-nightly--2025--07--14-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

**ZK-CEASER** is a complete zero-knowledge proof generation system that combines Circle STARKs with M31 field arithmetic, using StarkWare’s official STWO prover. This application is ready for real cr[...]

## Features

- **Zero-Knowledge Proofs**: Using STWO (StarkWare Two) official prover
- **Circle STARKs**: State-of-the-art STARK technology  
- **M31 Field Arithmetic**: Operations over the Mersenne-31 field (2^31 - 1)
- **Anonymous Sets**: Merkle trees of 1024 users for privacy
- **Modern Web Interface**: Next.js 15 + Rust WASM integration
- **Cryptography**: No mocks – real STWO implementation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ZK-CEASER System                     │
├─────────────────────────────────────────────────────────┤
│   Frontend (Next.js)      │     Backend (Rust WASM)     │
│                           │                             │
│ • React Components        │ • STWO Integration          │
│ • WASM Module Loading     │ • M31 Field Arithmetic      │
│ • Proof Verification      │ • Circle STARKs Generation  │
│ • Modern UI/UX            │ • Merkle Tree Proofs        │
│                           │ • Pedersen Commitments      │
└─────────────────────────────────────────────────────────┘
```

## Quick Start & Reproduction Guide

### Prerequisites

- **Rust nightly-2025-07-14** (required for STWO)
- **Node.js 18+** 
- **Git** to clone dependencies

### Step 1: Clone Repository

```bash
git clone https://github.com/Zyra-V21/zk-ceaser.git
cd zk-ceaser/zk-ceaser-app
```

### Step 2: Setup STWO Dependencies

```bash
# Create external directory and clone STWO repositories
mkdir -p external
cd external

# Clone STWO core (required for cryptography)
git clone https://github.com/starkware-libs/stwo.git
cd stwo
git checkout main
cd ..

# Clone STWO Cairo (optional, for extended features)
git clone https://github.com/starkware-libs/stwo-cairo.git
cd stwo-cairo  
git checkout main
cd ../..
```

### Step 3: Setup Rust Toolchain

```bash
# Install the specific nightly required by STWO
rustup install nightly-2025-07-14
rustup override set nightly-2025-07-14

# Check installation
rustc --version
# Should display: rustc 1.90.0-nightly
```

### Step 4: Build Rust WASM Backend

```bash
cd zkp-rust-backend

# Build for production with real STWO
cargo build --features real-stwo --release

# Generate WASM modules for the web
wasm-pack build --target web --features real-stwo

# Copy WASM files to frontend
cp pkg/zkp_ceaser_bg.wasm ../public/pkg/
cp pkg/zkp_ceaser.js ../public/pkg/

cd ..
```

### Step 5: Setup Frontend

```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### Step 6: Access Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the ZK-CEASER interface where you can:
- Generate zero-knowledge proofs
- Verify proof integrity  
- Download proof files
- Explore cryptographic components

## Technical Deep Dive

### Zero-Knowledge Proof Components

ZK-CEASER generates privacy proofs that contain:

1. **Pedersen Commitments**: Hide amounts using elliptic curves
2. **Range Proofs**: Prove validity of amounts (0.001–1000+) without revealing values
3. **Nullifiers**: Unique identifiers to prevent double spending
4. **Merkle Proofs**: Proof of membership in an anonymous set of 1024 users
5. **Encrypted Metadata**: Secure encoding of recipient information

### STWO Integration (Cryptography)

- **Field**: M31 (Mersenne-31: 2^31 - 1) – optimized for modern CPUs
- **Extension**: QM31 (quartic extension) – higher security  
- **STARKs**: Circle STARKs with FRI – new proof system
- **Hash**: Blake2s (256-bit) – high-performance cryptographic hashing
- **Security**: 128-bit cryptographic security

### Performance Metrics

| Component           | Performance   | Notes                      |
|---------------------|--------------|----------------------------|
| **Proof Generation**| 2-5 seconds  | STWO computation           |
| **Proof Size**      | 8-16 KB      | Optimized Circle STARKs    |
| **Verification**    | 100-500ms    | M31 field operations       |
| **Anonymous Set**   | 1024 users   | Merkle Tree depth 10       |
| **Memory Usage**    | ~50MB        | WASM + STWO runtime        |

## System Status

| Component          | Status      | Technology                  |
|--------------------|------------|-----------------------------|
| **ZK Proofs**      | Production | STWO + M31 + Circle STARKs  |
| **Frontend**       | Production | Next.js 15 + TypeScript     |
| **WASM Backend**   | Production | Rust + STWO                 |
| **Cryptography**   | 128-bit    | Implementation              |
| **Anonymous Sets** | 1024 Users | Merkle Trees                |

## Development & Debugging

### Common Issues & Solutions

| Issue                  | Solution                                                      |
|------------------------|--------------------------------------------------------------|
| **WASM not loading**   | Check `next.config.js` and that WASM files are in `public/pkg/` |
| **Rust compilation fails** | Check `rustup override set nightly-2025-07-14`         |
| **External repos missing** | Clone STWO dependencies in `external/`                   |
| **Proof verification fails** | Ensure you build with the STWO feature                 |

### Build Commands Reference

```bash
# Development build (faster)
cargo build --features mock-stwo
wasm-pack build --target web --features mock-stwo

# Production build (real cryptography)  
cargo build --features real-stwo --release
wasm-pack build --target web --features real-stwo

# Compilation check
cargo check --features real-stwo

# Run tests
cargo test --features real-stwo
```

## Testing & Validation

### Proof Generation Testing

```bash
# Zero-knowledge proof generation test
cd zkp-rust-backend
cargo test --features real-stwo

# WASM integration test
cd ../
npm run dev
# Go to http://localhost:3000 and generate a proof
```

### Verification Testing

Generated proofs should show:
- `verification_result: true` 
- Merkle proofs (not empty)
- Valid anonymous set size (1024)
- Valid STWO proof structure

### Example Generated Proof Structure

```json
{
  "metadata": {
    "verification_result": true,
    "anonymous_set_size": 1024,
    "tree_height": 10,
    "library_used": "STWO + arkworks-rs"
  },
  "zk_proof": {
    "amount_commitment": { "x": "0x...", "y": "0x..." },
    "range_proof": { "proof_data": [...], "circle_evaluations": [...] },
    "merkle_proof": [...],
    "merkle_root": "0x...",
    "nullifier": "0x...",
    "encrypted_metadata": "0x..."
  }
}
```

## Production Deployment

### Build for Production

```bash
# 1. Optimized WASM build
cd zkp-rust-backend
cargo build --features real-stwo --release
wasm-pack build --target web --features real-stwo --release

# 2. Optimized frontend build
cd ../
npm run build
npm start
```

### Deployment Checklist

- [ ] Rust nightly-2025-07-14 installed
- [ ] STWO dependencies cloned in `external/`
- [ ] STWO features enabled  
- [ ] WASM generated and copied
- [ ] Frontend builds without errors
- [ ] Proof generation works with `verification_result: true`

## **Security & Cryptography**

### Cryptographic Guarantees

- **STWO Implementation**: No mocks – real Circle STARKs
- **M31 Field Arithmetic**: Production-grade mathematical operations  
- **128-bit Security**: Industry security standard
- **Merkle Tree Proofs**: Membership verification in anonymous sets
- **Nullifier System**: Prevents double-spending attacks

### Security Audit Status

- **Internal Review**: Completed
- **Code Quality**: Ready for production
- **Cryptographic Implementation**: STWO integration verified
- **External Audit**: Available for security researchers

## **Contributing**

We welcome your contributions to improve ZK-CEASER!

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/zk-ceaser.git`
3. Follow the reproduction guide above
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and test thoroughly
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Areas for Contribution

- **Cryptography**: Improve STWO integration
- **Frontend**: Improve UI/UX  
- **Performance**: Optimize proof generation
- **Documentation**: Expand technical guides
- **Testing**: Add test coverage

## **License & Important Disclaimer**

This project is licensed under the **ZK-CEASER NON-COMMERCIAL LICENSE** – see the [LICENSE](LICENSE) file for details.

### Important Disclaimer

This software is developed for **research and development only**. **It has not been audited for production use**. Commercial use is restricted to ensure responsible deployment of cryptographic technologies.

We believe privacy-preserving technology should be accessible to all, and that responsible development is the foundation of meaningful adoption. While the cryptographic industry races toward deployment, we choose to prioritize education, transparency, and proper security validation first.

ZK-CEASER represents our commitment to advancing privacy as a fundamental right, not merely as a product. By sharing this research openly, we aim to foster a community of developers who understand both the potential and responsibility that comes with cryptographic implementations/privacy enhacements.

Unlike the common "deploy first, apologize later" approach seen in many Web3 projects, we advocate for a foundation of robust cryptographic principles, thorough testing, and community review before any production deployment. This approach may take longer, but creates the trust necessary for meaningful adoption of privacy technology.

### License Summary

- **Non-commercial use**: Personal, educational, research, and open-source contributions
- **Commercial use**: Reserved exclusively for Ceaser (@ZyraV21)
- **Contributions**: Welcome under the same license terms
- **Commercial license**: Contact [@ZyraV21](https://twitter.com/ZyraV21) for inquiries

## **Acknowledgments**

- **[StarkWare](https://starkware.co/)** for the STWO prover and Circle STARKs technology  
- **[Arkworks](https://arkworks.rs/)** for fundamental cryptographic primitives  
- **[Rust Community](https://www.rust-lang.org/)** for the powerful systems language  
- **[Next.js Team](https://nextjs.org/)** for the excellent React framework  

## **Support & Community**

- **Issues**: [GitHub Issues](https://github.com/Zyra-V21/zk-ceaser/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zyra-V21/zk-ceaser/discussions)  
- **Backend Docs**: [Rust Backend README](zkp-rust-backend/README.md)
- **Twitter**: [@ZyraV21](https://twitter.com/ZyraV21)

---

<div align="center">

**Built with Cryptography for True Privacy**

[![GitHub stars](https://img.shields.io/github/stars/Zyra-V21/zk-ceaser?style=social)](https://github.com/Zyra-V21/zk-ceaser/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Zyra-V21/zk-ceaser?style=social)](https://github.com/Zyra-V21/zk-ceaser/network/members)
[![License](https://img.shields.io/badge/License-ZK--CEASER%20Non--Commercial-red?style=flat-square)](./LICENSE)

**Made with STWO + Circle STARKs + M31 Field Arithmetic**

_While Ceaser is a collaborative effort, the development aspects are led by a single privacy enthusiast and technology explorer whose primary goal is continuous learning and contributing to the advancement of privacy-preserving technologies._

</div>

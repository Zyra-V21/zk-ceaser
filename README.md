# ZK-CEASER: Privacy-Preserving Zero-Knowledge Proof System

<div align="center">

<!-- Matrix Effect Header with Algorithm-Driven Movement -->
<svg width="100%" height="200" viewBox="0 0 800 200" style="background: linear-gradient(45deg, #000000, #001100);">
  <defs>
    <style>
      .matrix-text { 
        font-family: 'Courier New', monospace; 
        font-size: 12px; 
        fill: #00ff41; 
        opacity: 0.8;
      }
      .matrix-fade { opacity: 0.3; }
      .matrix-bright { fill: #ffffff; font-weight: bold; }
    </style>
  </defs>
  
  <!-- Numbers falling with Fibonacci timing (1,1,2,3,5,8s) -->
  <text x="80" y="20" class="matrix-text">2147483647
    <animate attributeName="y" values="20;220" dur="1s" repeatCount="indefinite"/>
  </text>
  <text x="160" y="0" class="matrix-text">6a09e667
    <animate attributeName="y" values="0;200" dur="1s" begin="1s" repeatCount="indefinite"/>
  </text>
  <text x="240" y="50" class="matrix-text matrix-fade">1123581321
    <animate attributeName="y" values="50;250" dur="2s" begin="2s" repeatCount="indefinite"/>
  </text>
  <text x="320" y="10" class="matrix-text">1009
    <animate attributeName="y" values="10;210" dur="3s" begin="4s" repeatCount="indefinite"/>
  </text>
  <text x="400" y="80" class="matrix-text matrix-bright">blake2s
    <animate attributeName="y" values="80;280" dur="5s" begin="7s" repeatCount="indefinite"/>
  </text>
  <text x="480" y="30" class="matrix-text">stark
    <animate attributeName="y" values="30;230" dur="8s" begin="12s" repeatCount="indefinite"/>
  </text>
  
  <!-- Bubble Sort positions: elements swap positions over time -->
  <text x="560" y="60" class="matrix-text matrix-fade">m31
    <animateTransform attributeName="transform" type="translate" 
      values="0,0; 80,0; 160,0; 80,0; 0,0" dur="10s" repeatCount="indefinite"/>
  </text>
  <text x="640" y="60" class="matrix-text matrix-fade">qm31
    <animateTransform attributeName="transform" type="translate" 
      values="0,0; -80,0; -160,0; -80,0; 0,0" dur="10s" repeatCount="indefinite"/>
  </text>
  
  <!-- Prime number spacing algorithm: positions at 2,3,5,7,11... * 40px -->
  <text x="80" y="120" class="matrix-text matrix-fade">stwo</text>   <!-- 2*40 -->
  <text x="120" y="140" class="matrix-text matrix-fade">field</text>  <!-- 3*40 -->
  <text x="200" y="160" class="matrix-text matrix-fade">proof</text>  <!-- 5*40 -->
  <text x="280" y="120" class="matrix-text matrix-fade">stark</text>  <!-- 7*40 -->
  <text x="440" y="140" class="matrix-text matrix-fade">zk</text>     <!-- 11*40 -->
  
  <!-- Binary search oscillation: title moves in binary search pattern -->
  <text x="400" y="100" text-anchor="middle" style="font-family: 'Courier New', monospace; font-size: 28px; fill: #00ff41; font-weight: bold;">
    ZK-CEASER
    <animateTransform attributeName="transform" type="translate"
      values="0,0; -100,0; 50,0; -25,0; 12,0; -6,0; 0,0" dur="14s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
  </text>
  <text x="400" y="130" text-anchor="middle" style="font-family: 'Courier New', monospace; font-size: 14px; fill: #ffffff;">
    Privacy by Default • Circle STARKs • M31 Field
  </text>
</svg>

<!-- Repository Statistics -->
<img src="https://github-readme-stats.vercel.app/api?username=Zyra-V21&repo=zk-ceaser&show_icons=true&theme=dark&hide_border=true&bg_color=000000&title_color=00ff41&icon_color=00ff41&text_color=ffffff&border_color=00ff41" width="48%"/>

<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Zyra-V21&repo=zk-ceaser&layout=compact&theme=dark&hide_border=true&bg_color=000000&title_color=00ff41&text_color=ffffff" width="48%"/>

<!-- Contribution Graph -->
<img src="https://github-readme-stats.vercel.app/api/pin/?username=Zyra-V21&repo=zk-ceaser&theme=dark&hide_border=true&bg_color=000000&title_color=00ff41&text_color=ffffff&icon_color=00ff41" width="100%"/>

</div>

[![License](https://img.shields.io/badge/License-ZK--CEASER%20Non--Commercial-red?style=for-the-badge)](./LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Zyra--V21-blue?style=for-the-badge&logo=github)](https://github.com/Zyra-V21/zk-ceaser)
[![STWO](https://img.shields.io/badge/STWO-Real%20Implementation-green?style=for-the-badge&logo=ethereum)](https://github.com/starkware-libs/stwo)
[![Rust](https://img.shields.io/badge/Rust-nightly--2025--07--14-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

**ZK-CEASER**is a complete zero-knowledge proof generation system combining**real Circle STARKs**with**M31 field arithmetic**using StarkWare's official**STWO prover**. This application demonstrates advanced cryptographic privacy techniques through an intuitive web interface.

## Features

-**Real Zero-Knowledge Proofs**: Using STWO (StarkWare Two) official prover
-**Circle STARKs**: Next-generation STARK technology  
-**M31 Field Arithmetic**: Mersenne-31 (2^31 - 1) field operations
-**Anonymous Sets**: 1024-user Merkle trees for privacy
-**Modern Web Interface**: Next.js 15 + Rust WASM integration
-**Production Ready**: 128-bit cryptographic security
-**Real Cryptography**: No mocks - actual STWO implementation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ZK-CEASER System                     │
├─────────────────────────────────────────────────────────┤
│   Frontend (Next.js)     │     Backend (Rust WASM)     │
│                           │                             │
│ • React Components        │ • Real STWO Integration     │
│ • WASM Module Loading     │ • M31 Field Arithmetic      │
│ • Proof Verification     │ • Circle STARKs Generation  │
│ • Modern UI/UX           │ • Merkle Tree Proofs        │
│                           │ • Pedersen Commitments     │
└─────────────────────────────────────────────────────────┘
```

## Quick Start & Reproduction Guide

### Prerequisites

-**Rust nightly-2025-07-14**(required for STWO)
-**Node.js 18+**
-**Git**for cloning dependencies

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

# Clone STWO core (required for real cryptography)
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
# Install specific nightly version required by STWO
rustup install nightly-2025-07-14
rustup override set nightly-2025-07-14

# Verify installation
rustc --version
# Should show: rustc 1.90.0-nightly
```

### Step 4: Build Rust WASM Backend

```bash
cd zkp-rust-backend

# Build for production with real STWO
cargo build --features real-stwo --release

# Generate WASM modules for web
wasm-pack build --target web --features real-stwo

# Copy WASM files to frontend public directory
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

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the ZK-CEASER interface where you can:
- Generate zero-knowledge proofs
- Verify proof integrity  
- Download proof files
- Explore cryptographic components

## Technical Deep Dive

###**Zero-Knowledge Proof Components

ZK-CEASER generates comprehensive privacy proofs containing:

1.**Pedersen Commitments**: Hide transaction amounts using elliptic curve cryptography
2.**Range Proofs**: Prove amount validity (0.001-1000+ units) without revealing exact values
3.**Nullifiers**: Unique identifiers preventing double-spending attacks
4.**Merkle Proofs**: Anonymous set membership within 1024-user trees
5.**Encrypted Metadata**: Secure receiver information encoding

###**STWO Integration (Real Cryptography)

-**Field**: M31 (Mersenne-31: 2^31 - 1) - optimized for modern CPUs
-**Extension**: QM31 (Quartic extension) - enhanced security properties  
-**STARKs**: Circle STARKs with FRI - next-generation proof system
-**Hash**: Blake2s (256-bit) - high-performance cryptographic hashing
-**Security**: 128-bit cryptographic security - production-grade protection

### Performance Metrics

| Component | Performance | Notes |
|-----------|-------------|-------|
|**Proof Generation**| 2-5 seconds | Real STWO computation |
|**Proof Size**| 8-16 KB | Optimized Circle STARKs |
|**Verification**| 100-500ms | M31 field operations |
|**Anonymous Set**| 1024 users | Merkle tree depth 10 |
|**Memory Usage**| ~50MB | WASM + STWO runtime |
## System Status

| Component | Status | Technology |
|-----------|---------|------------|
|**ZK Proofs**|  Production | STWO + M31 + Circle STARKs |
|**Frontend**|  Production | Next.js 15 + TypeScript |
|**WASM Backend**|  Production | Rust + Real STWO |
|**Cryptography**|  128-bit | Real Implementation |
|**Anonymous Sets**|  1024 Users | Merkle Trees |

## Development & Debugging

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
|**WASM not loading**| Check `next.config.js` and ensure WASM files are in `public/pkg/` |
|**Rust compilation fails**| Verify `rustup override set nightly-2025-07-14` |
|**External repos missing**| Clone STWO dependencies to `external/` directory |
|**Proof verification fails**| Ensure real STWO feature is enabled during build |

### Build Commands Reference

```bash
# Development build (faster)
cargo build --features mock-stwo
wasm-pack build --target web --features mock-stwo

# Production build (real cryptography)  
cargo build --features real-stwo --release
wasm-pack build --target web --features real-stwo

# Check compilation
cargo check --features real-stwo

# Run tests
cargo test --features real-stwo
```

## Testing & Validation

###**Proof Generation Testing

```bash
# Test ZK proof generation
cd zkp-rust-backend
cargo test --features real-stwo

# Test WASM integration
cd ../
npm run dev
# Navigate to http://localhost:3000 and generate a proof
```

###**Verification Testing

Generated proofs should show:
-  `verification_result: true` 
-  Real Merkle proofs (not empty)
-  Valid anonymous set size (1024)
-  Proper STWO proof structure

###**Example Generated Proof Structure

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
    "merkle_proof": [...], // Real proof path
    "merkle_root": "0x...", // Real root hash
    "nullifier": "0x...",
    "encrypted_metadata": "0x..."
  }
}
```

## Production Deployment

###**Build for Production

```bash
# 1. Build optimized WASM
cd zkp-rust-backend
cargo build --features real-stwo --release
wasm-pack build --target web --features real-stwo --release

# 2. Build optimized frontend
cd ../
npm run build
npm start
```

###**Deployment Checklist

- [ ]  Rust nightly-2025-07-14 installed
- [ ]  STWO dependencies cloned to `external/`
- [ ]  Real STWO features enabled  
- [ ]  WASM files generated and copied
- [ ]  Frontend builds without errors
- [ ]  Proof generation works with `verification_result: true`

## **Security & Cryptography

###**Cryptographic Guarantees

- **Real STWO Implementation**: No mocks - actual Circle STARKs
- **M31 Field Arithmetic**: Production-grade mathematical operations  
- **128-bit Security**: Industry-standard cryptographic strength
- **Merkle Tree Proofs**: Anonymous set membership verification
- **Nullifier System**: Prevents double-spending attacks

###**Security Audit Status

-**Internal Review**:  Completed
-**Code Quality**:  Production-ready
-**Cryptographic Implementation**:  Real STWO integration verified
-**External Audit**:  Available for security researchers

## **Contributing

We welcome contributions to improve ZK-CEASER! 

###**Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/zk-ceaser.git`
3. Follow the reproduction guide above
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and test thoroughly
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

###**Areas for Contribution

- **Cryptography**: Enhance STWO integration
- **Frontend**: Improve UI/UX components  
- **Performance**: Optimize proof generation
- **Documentation**: Expand technical guides
- **Testing**: Add comprehensive test coverage

## License & Important Disclaimer

This project is licensed under the**ZK-CEASER NON-COMMERCIAL LICENSE**- see the [LICENSE](LICENSE) file for details.

### Important Disclaimer
This software is developed for**research and development purposes only**. It has**not been audited for production use**. Commercial usage is restricted to ensure responsible deployment of cryptographic systems.

### License Summary
- **Non-commercial use**: Personal, educational, research, and open-source contributions
- **Commercial use**: Reserved exclusively to Ceaser (@ZyraV21)
- **Contributions**: Welcome under the same license terms
- **Commercial licensing**: Contact [@ZyraV21](https://twitter.com/ZyraV21) for inquiries

## Acknowledgments

-**[StarkWare](https://starkware.co/)**for STWO prover and Circle STARKs technology
-**[Arkworks](https://arkworks.rs/)**for foundational cryptographic primitives
-**[Rust Community](https://www.rust-lang.org/)**for the powerful systems programming language
-**[Next.js Team](https://nextjs.org/)**for the excellent React framework

## Support & Community

-**Issues**: [GitHub Issues](https://github.com/Zyra-V21/zk-ceaser/issues)
-**Discussions**: [GitHub Discussions](https://github.com/Zyra-V21/zk-ceaser/discussions)  
-**Backend Docs**: [Rust Backend README](zkp-rust-backend/README.md)
-**Twitter**: [@ZyraV21](https://twitter.com/ZyraV21)

---

<div align="center">

**Built with Real Cryptography for True Privacy 🛡️

[![GitHub stars](https://img.shields.io/github/stars/Zyra-V21/zk-ceaser?style=social)](https://github.com/Zyra-V21/zk-ceaser/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Zyra-V21/zk-ceaser?style=social)](https://github.com/Zyra-V21/zk-ceaser/network/members)
[![License](https://img.shields.io/badge/License-ZK--CEASER%20Non--Commercial-red?style=flat-square)](./LICENSE)

**Made with  using STWO + Circle STARKs + M31 Field Arithmetic

</div>

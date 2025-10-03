#  ZK-CEASER Rust Backend

This is the **cryptographic core** of ZK-CEASER, implementing real zero-knowledge proof generation using StarkWare's **STWO prover** with **Circle STARKs** and **M31 field arithmetic**.

##  **Architecture Overview**

```
┌─────────────────────────────────────────────────────┐
│                ZKP Rust Backend                     │
├─────────────────────────────────────────────────────┤
│   STWO Prover    │   Merkle Trees               │
│  • Circle STARKs   │  • Anonymous Sets              │
│  • M31 Fields      │  • 1024-user capacity          │
│  • Real Proofs     │  • Hash-based proofs           │
├─────────────────────────────────────────────────────┤
│   Cryptography   │   WASM Interface             │
│  • Pedersen        │  • Web Assembly output         │
│  • Range Proofs    │  • JavaScript bindings        │
│  • Nullifiers     │  • Browser compatibility       │
└─────────────────────────────────────────────────────┘
```

##  **Key Features**

- ** Real STWO Integration**: Actual Circle STARKs, not mocks
- ** M31 Field Arithmetic**: Mersenne-31 (2^31 - 1) optimized operations
- ** Merkle Tree Proofs**: Anonymous set membership for 1024 users
- ** Pedersen Commitments**: Amount hiding with elliptic curve cryptography
- ** Range Proofs**: Prove validity without revealing exact values
- ** WASM Output**: Runs in browsers via WebAssembly

##  **Build Configuration**

### **Feature Flags**

| Feature | Description | Use Case |
|---------|-------------|----------|
| `real-stwo` |  Real STWO prover | Production, actual proofs |
| `mock-stwo` | 🎭 Mock implementation | Development, fast testing |

### **Build Commands**

```bash
# Development (faster compilation)
cargo build --features mock-stwo

# Production (real cryptography)
cargo build --features real-stwo --release

# WASM for web (production)
wasm-pack build --target web --features real-stwo

# WASM for development
wasm-pack build --target web --features mock-stwo
```

##  **Code Structure**

```
zkp-rust-backend/
├── src/
│   ├── lib.rs              # Main WASM interface
│   ├── merkle_tree.rs      # Anonymous set implementation
│   ├── commitment.rs       # Pedersen commitments
│   └── stwo_integration.rs # Circle STARK proofs
├── patches/                # WASM size optimizations
├── Cargo.toml             # Dependencies & features
└── README.md              # This file
```

### **Core Modules**

#### ** `lib.rs` - WASM Interface**
- Exports `generate_ceaser_zk_proof()` to JavaScript
- Handles input validation and error management
- Coordinates all cryptographic components

#### ** `merkle_tree.rs` - Anonymous Sets**
- Implements 1024-user Merkle trees (depth 10)
- Generates membership proofs
- Uses Blake2s for efficient hashing

#### ** `commitment.rs` - Privacy Layer**
- Pedersen commitments for amount hiding
- Range proof generation (0.001-1000+ units)
- Nullifier creation for double-spend prevention

#### ** `stwo_integration.rs` - STARK Proofs**
- Real Circle STARK implementation
- M31 field arithmetic operations
- FRI-based proof generation

##  **STWO Integration Details**

### **Mathematical Foundation**
- **Base Field**: M31 = 2^31 - 1 (Mersenne prime)
- **Extension**: QM31 (4-degree extension for enhanced security)
- **STARK Type**: Circle STARKs (next-generation efficiency)
- **Hash Function**: Blake2s (256-bit, optimized for performance)

### **Security Properties**
- **128-bit Security**: Cryptographically secure for production
- **Soundness**: Computational soundness under standard assumptions
- **Zero-Knowledge**: Perfect zero-knowledge property
- **Succinctness**: Logarithmic proof size and verification time

##  **WASM Generation**

### **Output Files**
```bash
pkg/
├── zkp_ceaser.js          # JavaScript bindings
├── zkp_ceaser_bg.wasm     # WebAssembly binary
├── zkp_ceaser.d.ts        # TypeScript definitions
└── package.json           # NPM package metadata
```

### **Integration with Frontend**
```javascript
// Load WASM module
import init, { generate_ceaser_zk_proof } from './pkg/zkp_ceaser.js';

// Initialize WASM
await init('./pkg/zkp_ceaser_bg.wasm');

// Generate proof
const proof = generate_ceaser_zk_proof(
  "1000000000000000000", // amount in wei
  "0x1234...",           // nonce
  "0xabcd...",           // user secret
  "0x5678...",           // receiver address
  null                   // optional metadata
);
```

##  **Debugging & Troubleshooting**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| **🚫 Compilation fails** | Ensure `rustup override set nightly-2025-07-14` |
| **📦 WASM not generated** | Check `wasm-pack` is installed and up to date |
| ** STWO errors** | Verify external STWO dependency is properly cloned |
| ** JavaScript binding fails** | Ensure WASM files are copied to `public/pkg/` |

### **Debug Commands**

```bash
# Check Rust toolchain
rustc --version

# Verify dependencies
cargo check --features real-stwo

# Test specific module
cargo test merkle_tree --features real-stwo

# WASM build with verbose output
wasm-pack build --target web --features real-stwo --dev
```

### **Performance Profiling**

```bash
# Profile STWO proof generation
cargo build --features real-stwo --release
cargo run --features real-stwo --release --example benchmark

# Measure WASM size
ls -la pkg/zkp_ceaser_bg.wasm

# Check memory usage
cargo run --features real-stwo --example memory_profile
```

##  **Testing**

### **Unit Tests**
```bash
# Test all modules
cargo test --features real-stwo

# Test specific component
cargo test merkle_tree --features real-stwo
cargo test commitment --features real-stwo
cargo test stwo_integration --features real-stwo
```

### **Integration Tests**
```bash
# Test WASM generation
wasm-pack test --node --features real-stwo

# Test JavaScript bindings
cd ../
npm test
```

##  **Performance Metrics**

| Operation | Time | Notes |
|-----------|------|--------|
| ** Proof Generation** | 2-5s | Real STWO computation |
| ** Merkle Proof** | <1ms | Tree depth 10 |
| ** Commitment** | <1ms | Elliptic curve ops |
| **📦 WASM Loading** | ~100ms | First load only |
| **💾 Memory Usage** | ~50MB | Peak during proof gen |

##  **Development Workflow**

1. ** Setup Environment**
   ```bash
   rustup install nightly-2025-07-14
   rustup override set nightly-2025-07-14
   ```

2. ** Build Development Version**
   ```bash
   cargo build --features mock-stwo
   ```

3. **🧪 Run Tests**
   ```bash
   cargo test --features mock-stwo
   ```

4. ** Generate WASM**
   ```bash
   wasm-pack build --target web --features mock-stwo
   ```

5. **🚀 Production Build**
   ```bash
   cargo build --features real-stwo --release
   wasm-pack build --target web --features real-stwo
   ```

## 🔗 **Dependencies**

### **Core Dependencies**
- **`stwo`**: StarkWare's Circle STARK prover
- **`arkworks-rs`**: Elliptic curve cryptography
- **`blake2`**: Hash function implementation
- **`wasm-bindgen`**: JavaScript/WASM bindings
- **`serde`**: Serialization framework

### **External Requirements**
- **STWO Repository**: Must be cloned to `../../external/stwo/`
- **Rust Nightly**: Specific version `nightly-2025-07-14`
- **wasm-pack**: Latest version for WASM generation

##  **Contributing to Backend**

1. ** Code Review**: Focus on cryptographic correctness
2. **🧪 Testing**: Add tests for new cryptographic functions
3. **📚 Documentation**: Document mathematical foundations
4. **🔒 Security**: Follow secure coding practices
5. ** Performance**: Optimize hot paths in proof generation

---

**⚠️ Important**: This backend implements real cryptographic operations. Any changes should be thoroughly tested and reviewed for security implications.

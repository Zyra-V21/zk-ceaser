# 🚀 ZK-CEASER Deployment Guide

## **Quick Deploy Checklist**

- [ ] **Rust nightly-2025-07-14** installed
- [ ] **Node.js 18+** installed
- [ ] **STWO repositories** cloned to `/external`
- [ ] **Environment variables** configured
- [ ] **WASM modules** built
- [ ] **Contracts** deployed (or using existing)

## **📋 Environment Setup**

### **1. Rust Toolchain**

```bash
# Install specific nightly version
rustup install nightly-2025-07-14
rustup override set nightly-2025-07-14

# Verify installation
rustc --version
# Should show: rustc 1.90.0-nightly (2025-07-14)
```

### **2. Clone STWO Dependencies**

```bash
mkdir -p external
cd external

# Clone STWO core
git clone https://github.com/starkware-libs/stwo.git
cd stwo
git checkout main  # or specific commit
cd ..

# Clone STWO Cairo
git clone https://github.com/starkware-libs/stwo-cairo.git
cd stwo-cairo
git checkout main  # or specific commit
cd ../..
```

### **3. Build ZK Backend**

```bash
cd zk-ceaser-app/zkp-rust-backend

# Build for production
cargo build --features real-stwo --release

# Generate WASM
wasm-pack build --target web --features real-stwo

# Copy to frontend
cp pkg/zkp_ceaser_bg.wasm ../public/pkg/
cp pkg/zkp_ceaser.js ../public/pkg/
```

## **🌐 Frontend Deployment**

### **Local Development**

```bash
cd zk-ceaser-app
npm install
npm run dev
```

### **Production Build**

```bash
cd zk-ceaser-app
npm install
npm run build
npm start
```

### **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd zk-ceaser-app
vercel --prod
```

**Vercel Configuration** (`vercel.json`):

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## **⚙️ Backend Deployment**

### **Environment Configuration**

Create `.env` file:

```bash
# Backend configuration
PIPILONGO_PRIVATE_KEY=0x...
PIPILONGO_ADDRESS=0x5793e9a894be3af2bc4f13c12221d1b79b1fe4d31cf99836181d6e186c1bf3a
FEE_COLLECTOR_ADDRESS=0x075e79fdc066b628b691913b16dd642a9813055ee61d681be2696713a811cfa0
STRK_TOKEN_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
GAS_CALCULATOR_ADDRESS=0x06801484abbd4d72928d1625ca864666fec5daaf0a9715b86416bc7bdab21744
SMART_ACCOUNT_DEPLOYER_ADDRESS=0x02cc70bc0a28ef66467e96edb1d6c3508b20cd35f50f65d16d03b6763dad4aea

# RPC Configuration
STARKNET_RPC_URL=https://starknet-sepolia.g.alchemy.com/v2/YOUR_API_KEY
STARKNET_RPC_URL_BACKUP=https://starknet-sepolia.blastapi.io/YOUR_API_KEY/rpc/v0_7

# Execution Parameters
POLL_INTERVAL=30000
MAX_FEE=0x2625A00
DEFAULT_DESTINATION=0x02d4c0a53f31F0f359B5f439728A05273c23f0fA6FE2405A691DFd09FAfAFa49
```

### **Local Backend**

```bash
cd backend
npm install
node mixing-executor.js
```

### **Production Backend (PM2)**

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start mixing-executor.js --name "zk-ceaser-backend"

# Monitor
pm2 logs zk-ceaser-backend
pm2 status
```

### **Docker Deployment**

**Dockerfile** (backend):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "mixing-executor.js"]
```

**Docker Compose**:

```yaml
version: '3.8'

services:
  zk-ceaser-backend:
    build: ./backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    ports:
      - "3001:3000"
    volumes:
      - ./backend/logs:/app/logs

  zk-ceaser-frontend:
    build: ./zk-ceaser-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - zk-ceaser-backend
```

## **📜 Smart Contract Deployment**

### **Using Scarb**

```bash
cd ceaser-contracts-v2
scarb build

# Deploy with starkli or other tools
starkli declare target/dev/ceaser_contracts_v2_FeeCollectorV2.contract_class.json
starkli deploy <class_hash> <constructor_args>
```

### **Constructor Arguments**

```bash
# FeeCollectorV2 constructor
<owner_address>                    # Contract owner
<fee_collector_address>           # Fee collector wallet
<platform_fee_percentage>        # Fee percentage (100 = 1%)
<auto_deploy_mode>               # false for manual mode
```

### **Post-Deployment Setup**

```bash
# Authorize contracts
sncast invoke --contract-address <gas_calculator> --function authorize_caller --calldata <fee_collector>
sncast invoke --contract-address <deployer> --function set_fee_collector --calldata <fee_collector>
```

## **🔧 Configuration Management**

### **Frontend Constants**

Update `zk-ceaser-app/src/lib/constants.ts`:

```typescript
export const MIXING_FEE_COLLECTOR = "0x075e79fdc066b628b691913b16dd642a9813055ee61d681be2696713a811cfa0";
export const STRK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const SMART_ACCOUNT_DEPLOYER = "0x02cc70bc0a28ef66467e96edb1d6c3508b20cd35f50f65d16d03b6763dad4aea";
export const GAS_CALCULATOR = "0x06801484abbd4d72928d1625ca864666fec5daaf0a9715b86416bc7bdab21744";
```

## **🔍 Health Checks**

### **System Validation**

```bash
# Test WASM loading
cd zk-ceaser-app
node -e "import('./public/pkg/zkp_ceaser.js').then(m => console.log('✅ WASM loads'))"

# Test backend connectivity
curl http://localhost:3001/health

# Test contract interaction
sncast call --contract-address <fee_collector> --function get_auto_deploy_mode
```

### **Performance Monitoring**

```bash
# Backend logs
pm2 logs zk-ceaser-backend --lines 100

# Frontend metrics
# Check browser console for WASM performance logs

# Contract gas usage
# Monitor transaction costs on Starkscan
```

## **🚨 Troubleshooting**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| **WASM not loading** | Check `next.config.js` WASM configuration |
| **Rust compilation fails** | Verify nightly-2025-07-14 toolchain |
| **Backend TX1 fails** | Check private key and gas limits |
| **Frontend connection issues** | Verify RPC URLs and contract addresses |

### **Debug Commands**

```bash
# Check Rust version
rustc --version

# Verify STWO compilation
cd zk-ceaser-app/zkp-rust-backend
cargo check --features real-stwo

# Test contract calls
sncast call --contract-address <contract> --function <function>

# Check backend logs
tail -f backend/logs/mixing-executor.log
```

## **📊 Monitoring**

### **Key Metrics**

- **TX0 Success Rate**: User operations created
- **TX1 Execution Time**: Backend processing speed
- **Gas Costs**: Average gas consumption
- **Fee Collection**: Platform sustainability
- **Proof Generation**: WASM performance

### **Alerting**

Set up alerts for:
- Backend downtime
- High gas costs
- Failed transactions
- WASM errors
- RPC connectivity issues

---

**🎯 Ready for Production**: This deployment guide ensures a complete, secure, and monitored ZK-CEASER system.

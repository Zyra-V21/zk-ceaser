// CEASER Frontend Constants
// Direcciones de contratos en Sepolia (según documentación CEASER)

export const CONTRACTS = {
  // STRK Token en Sepolia
  STRK_TOKEN: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  
  // Contratos CEASER V2 (ROBUST VALIDATIONS 2025)
  MIXING_FEE_COLLECTOR: '0x0089613106d681030ae543099c115196d76864bac9de81d1d30b9a7f63bc7da4',
  SMART_ACCOUNT_DEPLOYER: '0x070a489dab0f866ce4d4cad9c306d3e573440f321a137b004bf38a4409663750',
  GAS_CALCULATOR: '0x029a4cfa90f9e4da031c184f3b90a8dde782f1ff13d98ca319533916287f663a'
} as const

// Wallets soportadas por StarknetKit
export const SUPPORTED_WALLETS = [
  { id: 'argentX', name: 'Argent X', icon: '/icons/argentx.svg' },
  { id: 'braavos', name: 'Braavos', icon: '/icons/braavos.svg' },
  { id: 'okxwallet', name: 'OKX Wallet', icon: '/icons/okx.svg' }
] as const

// Configuración de red
export const NETWORK_CONFIG = {
  chainId: 'SN_SEPOLIA',
  rpcUrl: 'https://starknet-sepolia.public.blastapi.io'
} as const

// Configuración de mixing
export const MIXING_CONFIG = {
  MIN_TARGET_ACCOUNTS: 2,
  MAX_TARGET_ACCOUNTS: 8,
  PLATFORM_FEE_PERCENTAGE: 1, // 1%
  MIN_AMOUNT: '0.001' // Mínimo 0.001 STRK
} as const

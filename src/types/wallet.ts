// Wallet Types para CEASER Frontend

export interface WalletState {
  isConnected: boolean
  address: string | null
  account: unknown | null
  chainId: string | null
  balance: string
  isConnecting: boolean
}

export interface WalletContextType {
  wallet: WalletState
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  reconnectWallet: () => Promise<void>
}

export interface SupportedWallet {
  id: string
  name: string
  icon: string
}

export interface ConnectionState {
  address: string
  chainId: string
  lastConnected: number
}

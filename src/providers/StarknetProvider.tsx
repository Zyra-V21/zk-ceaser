'use client'

import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core'
import { sepolia } from '@starknet-react/chains'
import { ReactNode } from 'react'
import { InjectedConnector } from 'starknetkit/injected'

export const StarknetProvider = ({ children }: { children: ReactNode }) => {
  // Configurar conectores usando StarknetKit
  const connectors = [
    new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
    new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
    new InjectedConnector({ options: { id: "okxwallet", name: "OKX Wallet" } })
  ]

  // Use specific RPC provider with v0_8 API
  const provider = jsonRpcProvider({
    rpc: () => ({
      nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YEktXqVy5RL-z1r7Z6Fyh'
    })
  })

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={provider}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  )
}

// Re-exportar hooks de starknet-react
export { 
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useReadContract,
  useSendTransaction,
  useNetwork
} from '@starknet-react/core'
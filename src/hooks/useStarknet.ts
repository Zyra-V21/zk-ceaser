import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'

export const useStarknet = () => {
  const { address, account, isConnected, chainId } = useAccount()
  const { connect, connectors, status } = useConnect()
  const { disconnect } = useDisconnect()

  const connectWallet = async () => {
    try {
      // Usar el primer conector disponible (Argent X por defecto)
      const connector = connectors[0]
      if (connector) {
        await connect({ connector })
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      console.log('✅ Wallet disconnected')
    } catch (error) {
      console.error('❌ Disconnect failed:', error)
    }
  }

  // Mantener compatibilidad con el código existente
  const wallet = {
    isConnected: isConnected || false,
    address: address || null,
    account: account || null,
    chainId: chainId ? chainId.toString() : null,
    balance: '0', // Se actualizará con useBalance por separado
    isConnecting: status === 'pending'
  }

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    reconnectWallet: connectWallet // Simplificado
  }
}

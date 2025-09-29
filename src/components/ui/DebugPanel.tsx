'use client'

import { useState } from 'react'
import { useStarknet } from '@/hooks/useStarknet'

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { wallet } = useStarknet()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-mono z-50"
      >
        DEBUG
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50 border border-red-500">
      <div className="flex justify-between items-center mb-3">
        <span className="text-red-400 font-bold">🐛 DEBUG PANEL</span>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-red-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <div>
          <span className="text-yellow-400">Wallet Status:</span>
          <div className="pl-2">
            <div>Connected: {wallet.isConnected ? '✅' : '❌'}</div>
            <div>Address: {wallet.address || 'null'}</div>
            <div>ChainId: {wallet.chainId || 'null'}</div>
          </div>
        </div>

        <div>
          <span className="text-yellow-400">Balance Info:</span>
          <div className="pl-2">
            <div>Balance: Check MixingForm component</div>
          </div>
        </div>

        <div>
          <span className="text-yellow-400">Environment:</span>
          <div className="pl-2">
            <div>RPC URL: {process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'default'}</div>
            <div>STRK Token: {process.env.NEXT_PUBLIC_STRK_TOKEN_ADDRESS || 'default'}</div>
          </div>
        </div>

        <div>
          <span className="text-yellow-400">Debug Actions:</span>
          <div className="pl-2 space-y-1">
            <button 
              onClick={() => {
                console.log('=== CEASER DEBUG ===')
                console.log('Wallet:', wallet)
                console.log('Environment:', {
                  rpc: process.env.NEXT_PUBLIC_STARKNET_RPC_URL,
                  token: process.env.NEXT_PUBLIC_STRK_TOKEN_ADDRESS
                })
              }}
              className="bg-green-600 px-2 py-1 rounded text-white hover:bg-green-700 block"
            >
              📋 Log to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

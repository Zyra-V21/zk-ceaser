'use client'

import { useStarknet } from '@/hooks/useStarknet'
import { useState } from 'react'

export const WalletButton = () => {
  const { wallet, connectWallet, disconnectWallet } = useStarknet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleConnect = async () => {
    await connectWallet()
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    setIsDropdownOpen(false)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (wallet.isConnecting) {
    return (
      <button 
        className="flex items-center justify-center bg-[#5AF4FF] text-black px-8 py-3 rounded-lg font-semibold text-sm uppercase min-w-[188px]"
        disabled
      >
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
        Connecting...
      </button>
    )
  }

  if (!wallet.isConnected) {
    return (
      <button 
        onClick={handleConnect}
        className="bg-[#5AF4FF] text-black px-8 py-3 rounded-lg font-semibold text-sm uppercase hover:bg-[#4BE4EE] transition-colors min-w-[188px]"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-[#5AF4FF] text-black px-8 py-3 rounded-lg font-semibold text-sm uppercase hover:bg-[#4BE4EE] transition-colors min-w-[188px] flex items-center justify-between"
      >
        {formatAddress(wallet.address!)}
        <svg 
          className={`w-4 h-4 ml-2 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-700 z-50">
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Connected Address</p>
              <p className="text-sm text-white font-mono mt-1 break-all">{wallet.address}</p>
            </div>
            
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wider">STRK Balance</p>
              <p className="text-sm text-white mt-1">{wallet.balance} STRK</p>
            </div>
            
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Network</p>
              <p className="text-sm text-white mt-1">Starknet Sepolia</p>
            </div>
            
            <button 
              onClick={handleDisconnect}
              className="w-full p-4 text-left text-red-400 hover:bg-red-400/10 transition-colors rounded-b-lg"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect Wallet
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

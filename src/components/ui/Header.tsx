'use client'

import { WalletButton } from '@/components/wallet/WalletButton'

export const Header = () => {
  return (
    <header className="w-full bg-transparent">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center p-5">
          {/* Logo y Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer">
              <svg width="180" height="24" viewBox="0 0 180 24" fill="none">
                <text x="0" y="18" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white">
                  CEASER
                </text>
              </svg>
            </div>
            
            {/* Navigation Menu - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-7">
              <div className="text-white font-semibold text-lg cursor-pointer hover:text-[#5AF4FF] transition-colors">
                
              </div>
              <div className="text-white/50 font-semibold text-lg cursor-pointer hover:text-white transition-colors">
                Monitor
              </div>
              <div className="text-white/50 font-semibold text-lg cursor-pointer hover:text-white transition-colors">
                Stats
              </div>
            </nav>
          </div>

          {/* Wallet Section - Hidden on mobile */}
          <div className="hidden md:block">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 border border-[#5AF4FF] rounded-full">
              <svg width="20" height="20" fill="#5AF4FF" viewBox="0 0 24 24">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

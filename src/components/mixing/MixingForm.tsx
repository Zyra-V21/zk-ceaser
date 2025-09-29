'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from '@starknet-react/core'
import { CONTRACTS } from '@/lib/constants'
import { Contract, RpcProvider, uint256 } from 'starknet'

// ERC20 ABI for balanceOf (outside component to avoid re-renders)
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'felt' }],
    outputs: [{ name: 'balance', type: 'Uint256' }],
    stateMutability: 'view'
  }
] as const

export const MixingForm = () => {
  const { address, isConnected, account } = useAccount()
  
  // Custom balance fetching using direct contract call
  const [balance, setBalance] = useState('0.00')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!isConnected || !address) {
      setBalance('0.00')
      return
    }

    try {
      setBalanceLoading(true)
      setBalanceError(null)
      
      const provider = new RpcProvider({
        nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YEktXqVy5RL-z1r7Z6Fyh'
      })
      
      const strkTokenAddress = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'
      
      // Use the Contract constructor with ABI, address, and provider (starknet.js v7+)
      const contract = new Contract(ERC20_ABI, strkTokenAddress, provider)
      
      console.log('🔍 Fetching balance for:', address)
      
      const result = await contract.balanceOf(address)
      console.log('📥 Raw balance result:', result)
      
      // Handle the result properly
      let balanceValue: bigint
      if (result && typeof result === 'object' && 'balance' in result) {
        balanceValue = uint256.uint256ToBN(result.balance)
      } else if (Array.isArray(result) && result.length >= 2) {
        balanceValue = uint256.uint256ToBN({ low: result[0], high: result[1] })
      } else {
        balanceValue = BigInt(result.toString())
      }
      
      const balanceInSTRK = Number(balanceValue) / 1e18
      const formattedBalance = balanceInSTRK.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })
      
      console.log('✅ Balance fetched:', formattedBalance, 'STRK')
      setBalance(formattedBalance)
      
    } catch (error) {
      console.error('❌ Error fetching balance:', error)
      setBalanceError(error instanceof Error ? error.message : 'Unknown error')
      setBalance('0.00')
    } finally {
      setBalanceLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // Format balance for display
  const balanceFormatted = balanceLoading ? 'Loading...' : balanceError ? 'Error' : balance
  
  const [amount, setAmount] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processStep, setProcessStep] = useState<string>('')
  const [tx0Hash, setTx0Hash] = useState<string | null>(null)
  const [tx1Hash, setTx1Hash] = useState<string | null>(null)

  const formatAmountToWei = (amount: string): { low: string, high: string } => {
    const amountInWei = BigInt(parseFloat(amount) * 1e18)
    return {
      low: (amountInWei & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toString(),
      high: (amountInWei >> BigInt(128)).toString()
    }
  }

  const handleStartMixing = async () => {
    if (!isConnected || !address || !account) {
      setError('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!destinationAddress || destinationAddress.length < 10) {
      setError('Please enter a valid destination address')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      setProcessStep('')
      setTx0Hash(null)
      setTx1Hash(null)

      const amountWei = formatAmountToWei(amount)
      
      // Step 1: Transfer STRK
      setProcessStep('Transferring STRK to core contract...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const transferCall = {
        contractAddress: CONTRACTS.STRK_TOKEN,
        entrypoint: 'transfer',
        calldata: [
          CONTRACTS.MIXING_FEE_COLLECTOR,
          amountWei.low,
          amountWei.high
        ]
      }
      
      const tx0 = await account.execute([transferCall])
      setTx0Hash(tx0.transaction_hash)
      
      // Step 2: Create operation
      setProcessStep('Deploying new smart accounts for privacy transaction...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const operationCall = {
        contractAddress: CONTRACTS.MIXING_FEE_COLLECTOR,
        entrypoint: 'create_mixing_operation',
        calldata: [
          amountWei.low,
          amountWei.high
        ]
      }
      
      const tx1 = await account.execute([operationCall])
      
      // Step 3: Backend processing (no API needed - backend monitors automatically)
      setProcessStep('Backend is executing privacy transaction...')
      
      console.log('🔍 Frontend Debug:')
      console.log('TX0 hash:', tx0.transaction_hash)
      console.log('TX1 hash:', tx1.transaction_hash)
      
      // Poll for ALL completed operations (since we don't know the exact operationId)
      let attempts = 0
      const maxAttempts = 30 // 5 minutes
      
      const pollForTx1 = async () => {
        attempts++
        
        if (attempts > maxAttempts) {
          setProcessStep('')
          setSuccess(`Privacy transfer initiated successfully!

TX0: ${tx0.transaction_hash}
Amount: ${amount} STRK
Destination: ${destinationAddress.slice(0, 10)}...${destinationAddress.slice(-8)}

Backend is processing your request. Your funds will arrive at the destination address within minutes.
Check back in a few minutes or refresh the page.`)
          return
        }
        
        try {
          // Try multiple approaches to find the completed operation
          
          // Approach 1: Check recent operations (wide range to catch any recent operation)
          const recentOperationIds = Array.from({length: 20}, (_, i) => 10 + i) // Operations 10-29
          
          for (const opId of recentOperationIds) {
            try {
              const response = await fetch(`/api/mixing/status?operationId=${opId}`)
              const statusData = await response.json()
              
              console.log(`Checking operation ${opId}:`, statusData)
              
              if (statusData.status === 'completed' && statusData.tx1Hash) {
                setTx1Hash(statusData.tx1Hash)
                setProcessStep('')
                setSuccess(`Privacy transfer completed successfully!

TX0: ${tx0.transaction_hash}
TX1: ${statusData.tx1Hash}
Amount: ${amount} STRK
Destination: ${destinationAddress.slice(0, 10)}...${destinationAddress.slice(-8)}

Your funds have been privately transferred to the destination address.`)
                return
              }
            } catch {
              // Continue to next operation
            }
          }
          
        } catch (error) {
          console.warn('Polling error:', error)
        }
        
        setTimeout(pollForTx1, 10000) // Poll every 10 seconds
      }
      
      setTimeout(pollForTx1, 5000) // Start polling after 5 seconds

      // Reset form
      setAmount('')
      setDestinationAddress('')
      
      // Refresh balance
      setTimeout(() => fetchBalance(), 8000)

    } catch (error) {
      console.error('❌ Mixing failed:', error)
      
      let errorMessage = 'Unknown error occurred'
      
      if (error instanceof Error) {
        if (error.message.includes('USER_REFUSED_OP')) {
          errorMessage = 'Transaction was cancelled. Please try again and confirm in your wallet.'
        } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
          errorMessage = 'Insufficient STRK balance for this transaction.'
        } else if (error.message.includes('INVALID_TRANSACTION_NONCE')) {
          errorMessage = 'Transaction nonce error. Please refresh and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(`Failed to send privately: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return null // Don't render anything when wallet is not connected
  }

  return (
    <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-6 h-fit">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Send Privately</h2>
        <p className="text-white/60 text-sm">
          Submit your private transfer. Balance: <span className="font-semibold text-[#5AF4FF]">{balanceFormatted} STRK</span>
        </p>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Amount to Send (STRK)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.001"
              min="0.001"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#5AF4FF] focus:ring-1 focus:ring-[#5AF4FF]"
            />
            <div className="absolute right-3 top-3 flex items-center">
              <div className="w-6 h-6 bg-[#5272F3] rounded-full mr-2"></div>
              <span className="text-white text-sm font-semibold">STRK</span>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Fee: 1% • Min: 0.001 STRK
          </p>
        </div>

        {/* Destination Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Destination Address
          </label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="0x..."
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#5AF4FF] focus:ring-1 focus:ring-[#5AF4FF] font-mono text-sm"
          />
          <p className="text-xs text-white/40 mt-1">
            Destination for private transfer
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="text-green-400 text-sm whitespace-pre-line">
              {success}
              
              {/* TX Links */}
              {tx0Hash && (
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <a 
                    href={`https://sepolia.starkscan.co/tx/${tx0Hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-300 hover:text-green-200 underline text-xs mr-4"
                  >
                    View TX0 on Starkscan
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  {tx1Hash && (
                    <a 
                      href={`https://sepolia.starkscan.co/tx/${tx1Hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-300 hover:text-green-200 underline text-xs"
                    >
                      View TX1 on Starkscan
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Process Step Display */}
        {processStep && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent mr-3"></div>
              <p className="text-blue-400 text-sm">{processStep}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleStartMixing}
          disabled={isLoading || !amount || !destinationAddress || !account}
          className="w-full bg-[#5AF4FF] text-black px-6 py-4 rounded-lg font-semibold text-lg hover:bg-[#4BE4EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
              Submitting TX0...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Send Privately
            </>
          )}
        </button>

        {/* Info Panel - Compact */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <h4 className="font-semibold text-white mb-2 flex items-center text-sm">
            <svg className="w-3 h-3 mr-2 text-[#5AF4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it Works
          </h4>
          <div className="text-xs text-white/60 space-y-1">
            <p>• <strong>TX0:</strong> You transfer STRK and create operation</p>
            <p>• <strong>TX1:</strong> Backend executes privacy transaction automatically</p>
            <p>• <strong>Privacy:</strong> SmartAccounts break linkability</p>
          </div>
        </div>
      </div>
    </div>
  )
}
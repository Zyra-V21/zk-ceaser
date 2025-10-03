'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'
import { Contract, RpcProvider, uint256, CallData } from 'starknet'
import { CONTRACTS, ERC20_ABI, ZK_PRIVACY_MATRIX_ABI, RPC_CONFIG } from '@/lib/constants'
import { zkProofToCalldata, zkProofV4ToCalldata, validateZKProof, formatU256, type ZKProofJSON } from '@/lib/zkProofUtils'
import { loadZKPWasm } from '@/lib/wasmLoader'

export function ZKPrivacyForm() {
  const { address, isConnected, account } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Wallet state
  const [balance, setBalance] = useState('0.00')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [allowance, setAllowance] = useState<bigint>(BigInt(0))

  // Generate a random valid hex secret
  const generateRandomSecret = () => {
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const hexSecret = '0x' + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return hexSecret
  }

  // Form state
  const [receiverAddress, setReceiverAddress] = useState('0x02d4c0a53f31F0f359B5f439728A05273c23f0fA6FE2405A691DFd09FAfAFa49')
  const [userSecret, setUserSecret] = useState(generateRandomSecret())
  const [generatedProof, setGeneratedProof] = useState<any | null>(null) // Full proof JSON with metadata

  // Transaction state
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tx0Hash, setTx0Hash] = useState<string | null>(null)

  // WASM state
  const [wasmModule, setWasmModule] = useState<any>(null)

  // Load WASM module
  useEffect(() => {
    async function loadWasm() {
      try {
        console.log('🔄 Loading ZK proof generator...')
        const wasm = await loadZKPWasm()
        console.log('✅ WASM loaded, checking functions...')
        console.log('📋 Available functions:', Object.keys(wasm).filter(k => typeof wasm[k] === 'function'))
        
        // Test if the function exists
        if (typeof wasm.generate_ceaser_zk_proof !== 'function') {
          console.error('❌ generate_ceaser_zk_proof not found in WASM module!')
          console.log('Available keys:', Object.keys(wasm))
        } else {
          console.log('✅ generate_ceaser_zk_proof found')
        }
        
        setWasmModule(wasm)
        console.log('✅ ZK proof generator ready')
      } catch (err) {
        console.error('❌ Failed to load ZK proof generator:', err)
      }
    }
    loadWasm()
  }, [])

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!isConnected || !address) {
      setBalance('0.00')
      return
    }

    try {
      setBalanceLoading(true)
      const provider = new RpcProvider({ nodeUrl: RPC_CONFIG.SEPOLIA_RPC })
      const contract = new Contract(ERC20_ABI, CONTRACTS.STRK_TOKEN, provider)
      
      const result = await contract.balanceOf(address)
      
      let balanceValue: bigint
      if (result && typeof result === 'object' && 'balance' in result) {
        balanceValue = uint256.uint256ToBN(result.balance)
      } else if (Array.isArray(result) && result.length >= 2) {
        balanceValue = uint256.uint256ToBN({ low: result[0], high: result[1] })
      } else {
        balanceValue = BigInt(result.toString())
      }
      
      const balanceInSTRK = Number(balanceValue) / 1e18
      setBalance(balanceInSTRK.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }))
      
    } catch (error) {
      console.error('❌ Error fetching balance:', error)
      setBalance('0.00')
    } finally {
      setBalanceLoading(false)
    }
  }, [address, isConnected])

  // Fetch allowance
  const fetchAllowance = useCallback(async () => {
    if (!isConnected || !address) {
      setAllowance(BigInt(0))
      return
    }

    try {
      const provider = new RpcProvider({ nodeUrl: RPC_CONFIG.SEPOLIA_RPC })
      const contract = new Contract(ERC20_ABI, CONTRACTS.STRK_TOKEN, provider)
      
      const result = await contract.allowance(address, CONTRACTS.ZK_PRIVACY_MATRIX_V4)
      
      let allowanceValue: bigint
      if (result && typeof result === 'object' && 'remaining' in result) {
        allowanceValue = uint256.uint256ToBN(result.remaining)
      } else if (Array.isArray(result) && result.length >= 2) {
        allowanceValue = uint256.uint256ToBN({ low: result[0], high: result[1] })
      } else {
        allowanceValue = BigInt(result.toString())
      }
      
      setAllowance(allowanceValue)
      console.log('📊 Current allowance:', allowanceValue.toString())
      
    } catch (error) {
      console.error('❌ Error fetching allowance:', error)
      setAllowance(BigInt(0))
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchBalance()
    fetchAllowance()
  }, [fetchBalance, fetchAllowance])

  // Generate ZK Proof
  const handleGenerateProof = async () => {
    if (!wasmModule) {
      setError('ZK proof generator not loaded yet')
      return
    }

    if (!receiverAddress || receiverAddress.length < 10) {
      setError('Please enter a valid receiver address')
      return
    }

    if (!userSecret || userSecret.length < 10) {
      setError('Please enter a valid user secret (at least 10 characters)')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setCurrentStep('Generating ZK proof with STWO + Circle STARKs...')

      // Fixed amount: 1 STRK in wei
      const amountInWei = '1000000000000000000'
      
      // Generate ZK proof using WASM module
      // Parameters: amount (in wei), nonce (hex), secret, receiver
      const timestamp = Date.now()
      const nonceHex = '0x' + timestamp.toString(16).padStart(16, '0')
      
      console.log('🔍 WASM module:', wasmModule)
      console.log('🔍 Available functions:', Object.keys(wasmModule).filter(k => typeof wasmModule[k] === 'function'))
      console.log('🔍 Calling with params:', { amountInWei, nonceHex, userSecret: userSecret.slice(0, 10) + '...', receiverAddress: receiverAddress.slice(0, 10) + '...' })
      
      const proofJson = wasmModule.generate_ceaser_zk_proof(
        amountInWei,
        nonceHex,
        userSecret,
        receiverAddress
      )
      
      console.log('📝 Raw proof JSON:', proofJson)
      console.log('📝 Proof JSON type:', typeof proofJson)
      console.log('📝 Proof JSON length:', proofJson?.length)

      const rawProof = JSON.parse(proofJson)
      
      console.log('📄 Raw proof structure:', Object.keys(rawProof))
      console.log('📊 Has metadata?', !!rawProof.metadata)
      console.log('📊 Has zk_proof?', !!rawProof.zk_proof)
      
      // Determine proof structure format
      let zkProof: any
      let metadata: any
      
      if (rawProof.zk_proof && rawProof.metadata) {
        // Format 1: { zk_proof: {...}, metadata: {...} }
        zkProof = rawProof.zk_proof
        metadata = rawProof.metadata
        console.log('✅ Format 1 detected: zk_proof + metadata structure')
      } else if (rawProof.amount_commitment) {
        // Format 2: Direct proof structure (current WASM output)
        zkProof = rawProof
        // Extract amount from proof (1 STRK = 1000000000000000000 wei)
        metadata = {
          amount: "1.0", // Default to 1 STRK for now
          receiver: receiverAddress,
          timestamp: new Date().toISOString(),
          library_used: "STWO + arkworks-rs",
          proof_type: "CEASER Privacy-Preserving Transfer",
        }
        console.log('✅ Format 2 detected: Direct proof structure, created metadata')
      } else {
        throw new Error('Unknown proof structure format')
      }
      
      // Validate the proof
      if (!validateZKProof(zkProof)) {
        console.error('❌ Validation failed for proof:', zkProof)
        throw new Error('Invalid proof structure')
      }

      // Create full proof data with metadata
      const proofData = {
        zk_proof: zkProof,
        metadata: metadata
      }
      
      setGeneratedProof(proofData)
      setSuccess(`✅ ZK Proof generated! Amount: ${metadata.amount} STRK → ${metadata.receiver.slice(0, 10)}...`)
      console.log('✅ Generated proof validated and stored:', proofData)

    } catch (err) {
      console.error('❌ Error generating proof:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate proof')
    } finally {
      setIsLoading(false)
      setCurrentStep('')
    }
  }

  // Approve STRK allowance
  const handleApprove = async () => {
    if (!account || !isConnected) {
      setError('Please connect wallet first')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setCurrentStep('Approving STRK allowance for ZK Privacy Matrix...')

      // Approve 1000 STRK (max for safety)
      const approveAmount = formatU256('1000')

      const approveCall = {
        contractAddress: CONTRACTS.STRK_TOKEN,
        entrypoint: 'approve',
        calldata: CallData.compile([
          CONTRACTS.ZK_PRIVACY_MATRIX_V4,
          approveAmount.low.toString(),
          approveAmount.high.toString()
        ])
      }

      const tx = await account.execute([approveCall])
      console.log('📝 Approve TX:', tx.transaction_hash)

      setCurrentStep('Waiting for approval confirmation...')
      await account.waitForTransaction(tx.transaction_hash)

      setSuccess('✅ Allowance approved! You can now deposit.')
      await fetchAllowance()

    } catch (err) {
      console.error('❌ Error approving:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsLoading(false)
      setCurrentStep('')
    }
  }

  // Execute TX0: deposit_private
  const handleDeposit = async () => {
    if (!account || !isConnected) {
      setError('Please connect wallet first')
      return
    }

    if (!generatedProof) {
      setError('Please generate a ZK proof first')
      return
    }

    // Check allowance (use amount from proof metadata)
    const requiredAmount = BigInt(Math.floor(parseFloat(generatedProof.metadata.amount) * 1e18))
    console.log(`💰 Required allowance: ${requiredAmount} wei (${generatedProof.metadata.amount} STRK)`)
    console.log(`💰 Current allowance: ${allowance} wei`)
    
    if (allowance < requiredAmount) {
      setError(`Insufficient allowance. Please approve ${generatedProof.metadata.amount} STRK first.`)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      setTx0Hash(null)
      setCurrentStep('Converting ZK proof to V4 calldata...')

      // Use V4 calldata converter (includes amount and receiver from metadata)
      const calldata = zkProofV4ToCalldata(generatedProof)
      console.log('📊 V4 Calldata:', calldata)
      console.log('📊 V4 Calldata length:', calldata.length)

      setCurrentStep('Executing TX0: deposit_private with ZK Privacy Matrix V4...')

      const depositCall = {
        contractAddress: CONTRACTS.ZK_PRIVACY_MATRIX_V4,
        entrypoint: 'deposit_private',
        calldata: calldata
      }

      const tx = await account.execute([depositCall])
      setTx0Hash(tx.transaction_hash)
      console.log('🚀 TX0 Hash:', tx.transaction_hash)

      setCurrentStep('Waiting for TX0 confirmation...')
      await account.waitForTransaction(tx.transaction_hash)

      setSuccess(`✅ TX0 completed! Backend will automatically execute TX1.`)
      setCurrentStep('Waiting for backend to detect event and execute TX1...')
      
      // Refresh balance
      setTimeout(() => {
        fetchBalance()
        fetchAllowance()
      }, 3000)

    } catch (err) {
      console.error('❌ Error depositing:', err)
      setError(err instanceof Error ? err.message : 'Failed to deposit')
    } finally {
      setIsLoading(false)
    }
  }

  // Wallet connect UI
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Connect Wallet</h2>
              <p className="text-white/60 text-lg">
                Connect your Starknet wallet to use ZK Privacy Matrix
              </p>
            </div>
            
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-lg transition-all border border-white/10 hover:border-white/30 font-medium"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wallet Info */}
      <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/60 text-sm mb-1">Connected Wallet</p>
            <p className="text-white font-mono text-sm">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm mb-1">STRK Balance</p>
            <p className="text-white text-xl font-bold">
              {balanceLoading ? 'Loading...' : balance}
            </p>
          </div>
          <button
            onClick={() => disconnect()}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-all border border-red-500/30"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Step 1: Generate Proof */}
      <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Step 1: Generate ZK Proof (Off-Chain)
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Receiver Address (Will be encrypted)
            </label>
            <input
              type="text"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50"
              placeholder="0x..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white/80 text-sm">
                Your Secret (Auto-generated hex)
              </label>
              <button
                onClick={() => setUserSecret(generateRandomSecret())}
                className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate New
              </button>
            </div>
            <input
              type="text"
              value={userSecret}
              onChange={(e) => setUserSecret(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-400/50"
              placeholder="0x..."
              readOnly
            />
            <p className="text-white/40 text-xs mt-1">
              ⚠️ Save this secret to decrypt the receiver later
            </p>
          </div>

          <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4">
            <p className="text-cyan-400 text-sm">
              ℹ️ Fixed amount: <strong>1 STRK</strong> (for maximum privacy via anonymous sets)
            </p>
          </div>

          <button
            onClick={handleGenerateProof}
            disabled={isLoading || !wasmModule}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {!wasmModule ? 'Loading ZK Generator...' : 'Generate ZK Proof'}
          </button>

          {generatedProof && (
            <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
              <p className="text-green-400 font-semibold mb-2">✅ Proof Generated</p>
              <p className="text-white/60 text-xs font-mono break-all">
                Nullifier: {generatedProof.zk_proof.nullifier.slice(0, 20)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Approve */}
      {generatedProof && (
        <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Step 2: Approve STRK Allowance
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/60 text-sm mb-1">Current Allowance</p>
              <p className="text-white text-lg font-bold">
                {(Number(allowance) / 1e18).toFixed(2)} STRK
              </p>
            </div>

            {allowance < BigInt(1e18) ? (
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Approve STRK
              </button>
            ) : (
              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                <p className="text-green-400 font-semibold">✅ Allowance Approved</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Deposit */}
      {generatedProof && allowance >= BigInt(1e18) && (
        <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Step 3: Execute TX0 (Private Deposit)
          </h3>
          
          <div className="space-y-4">
            <div className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-4">
              <p className="text-purple-400 text-sm">
                🔐 Your deposit will be <strong>completely private</strong>. Amount and receiver are hidden via ZK-STARKs.
                <br />
                💎 Backend will automatically execute TX1 using Pipilongo as paymaster.
              </p>
            </div>

            <button
              onClick={handleDeposit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
            >
              Execute TX0: Deposit Private
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      {(isLoading || currentStep || error || success) && (
        <div className="bg-gradient-to-b from-[rgba(106,230,239,0.05)] to-[rgba(153,153,153,0.012)] backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
          {isLoading && currentStep && (
            <div className="flex items-center text-cyan-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400 mr-3"></div>
              <p>{currentStep}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
              <p className="text-green-400">{success}</p>
              {tx0Hash && (
                <a
                  href={`https://sepolia.starkscan.co/tx/${tx0Hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm underline mt-2 block"
                >
                  View TX0 on Starkscan →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


          )}

          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
              <p className="text-green-400">{success}</p>
              {tx0Hash && (
                <a
                  href={`https://sepolia.starkscan.co/tx/${tx0Hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm underline mt-2 block"
                >
                  View TX0 on Starkscan →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


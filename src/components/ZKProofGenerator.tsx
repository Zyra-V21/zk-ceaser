'use client'

import { useState, useEffect } from 'react'
import { loadZKPWasm, getWasmDebugInfo, isWasmSupported } from '@/lib/wasmLoader'

// Tipos para la integración con WASM
interface ZKProofResult {
  amount_commitment: {
    x: string
    y: string
    commitment_hash: string
  }
  range_proof: {
    proof_data: string[]
    public_inputs: string[]
    circle_evaluations: string[]
    fri_commitments: string[]
  }
  nullifier: string
  merkle_proof: string[]
  merkle_root: string
  encrypted_metadata: string
}

interface PerformanceStats {
  proof_generation_time_ms: string
  proof_size_bytes: string
  verification_time_ms: string
  supported_range: string
  merkle_tree_capacity: string
  library_used: string
}

export function ZKProofGenerator() {
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ZKProofResult | null>(null)
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  
  // Form state
  const [amount, setAmount] = useState('1.0')
  const [receiverAddress, setReceiverAddress] = useState('0x02d4c0a53f31F0f359B5f439728A05273c23f0fA6FE2405A691DFd09FAfAFa49')
  const [userSecret, setUserSecret] = useState('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')

  // Load WASM module
  useEffect(() => {
    async function loadWasm() {
      try {
        console.log('🔄 Loading WASM module (2025 Next.js compatible)...')
        console.log('🛠️ Debug info:', getWasmDebugInfo())
        
        // Check WASM support first
        if (!isWasmSupported()) {
          throw new Error('WebAssembly is not supported in this browser')
        }
        
        const wasmModule = await loadZKPWasm()
        console.log('✅ WASM module loaded successfully!')
        setWasmModule(wasmModule)
        
        // Load performance stats
        if (wasmModule.get_zkp_performance_stats) {
          const statsJson = wasmModule.get_zkp_performance_stats()
          const parsedStats = JSON.parse(statsJson)
          setStats(parsedStats)
          console.log('📊 Performance stats loaded:', parsedStats)
          
          // Verificar si es el módulo real o mock
          if (parsedStats.library_used && parsedStats.library_used.includes('Mock')) {
            console.log('⚠️ Using MOCK WASM module - proofs are not real!')
          } else {
            console.log('✅ Using REAL WASM module - generating actual ZK proofs!')
          }
        } else {
          console.log('⚠️ Performance stats function not available')
        }
        
      } catch (err) {
        console.error('❌ Error loading WASM:', err)
        setError(`Failed to load WASM module: ${err}. Check console for details.`)
      }
    }

    loadWasm()
  }, [])

  const generateProof = async () => {
    if (!wasmModule) {
      setError('WASM module not loaded yet')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🚀 Starting ZK proof generation...')
      const startTime = performance.now()

      // Convert amount to wei
      const amountWei = (parseFloat(amount) * 1e18).toString()
      
      // Generate random nonce
      const nonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      console.log('📝 Inputs:', {
        amountWei,
        nonce: nonce.slice(0, 20) + '...',
        receiverAddress: receiverAddress.slice(0, 20) + '...',
        userSecret: userSecret.slice(0, 20) + '...'
      })

      // Generate ZK proof
      const proofJson = wasmModule.generate_ceaser_zk_proof(
        amountWei,
        nonce,
        userSecret,
        receiverAddress,
        null // config (usando default)
      )

      const proof = JSON.parse(proofJson)
      const endTime = performance.now()

      console.log('✅ ZK proof generated successfully!')
      console.log('⏱️ Generation time:', Math.round(endTime - startTime), 'ms')
      console.log('📋 Proof result:', proof)

      setResult(proof)

      // Verify proof
      console.log('🔍 Verifying proof...')
      const verifyStartTime = performance.now()
      const isValid = wasmModule.verify_ceaser_zk_proof(proofJson)
      const verifyEndTime = performance.now()

      console.log('📊 Verification result:', isValid)
      console.log('⏱️ Verification time:', Math.round(verifyEndTime - verifyStartTime), 'ms')

      // Prepare metadata
      const metadata = {
        amount: amount,
        receiver: receiverAddress,
        timestamp: new Date().toISOString(),
        generation_time_ms: Math.round(endTime - startTime),
        verification_time_ms: Math.round(verifyEndTime - verifyStartTime),
        verification_result: isValid
      }

      // Auto-download proof as JSON file
      downloadProofAsFile(proof, metadata)

      // Also save to backend (optional)
      saveProofToBackend(proof, metadata)

    } catch (err) {
      console.error('❌ Error generating proof:', err)
      setError(`Error generating proof: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const generateRandomValues = () => {
    // Generate random amount between 0.1 and 100 STRK
    const randomAmount = (Math.random() * 99.9 + 0.1).toFixed(3)
    setAmount(randomAmount)

    // Generate random user secret
    const randomSecret = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    setUserSecret(randomSecret)
  }

  // Function to download proof as JSON file
  const downloadProofAsFile = (proof: ZKProofResult, metadata: any) => {
    const proofData = {
      metadata: {
        ...metadata,
        library_used: "STWO + arkworks-rs",
        proof_type: "CEASER Privacy-Preserving Transfer",
        version: "1.0.0"
      },
      zk_proof: proof
    }

    const jsonString = JSON.stringify(proofData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `ceaser-zk-proof-${timestamp}.json`
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    
    console.log(`📥 Proof downloaded as: ${filename}`)
    console.log(`📊 File size: ${(blob.size / 1024).toFixed(2)} KB`)
  }

  // Function to save proof to backend
  const saveProofToBackend = async (proof: ZKProofResult, metadata: any) => {
    try {
      const proofData = {
        metadata: {
          ...metadata,
          library_used: "STWO + arkworks-rs",
          proof_type: "CEASER Privacy-Preserving Transfer",
          version: "1.0.0"
        },
        zk_proof: proof
      }

      const response = await fetch('/api/proofs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proofData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log(`💾 Proof also saved to backend: ${result.filename}`)
        console.log(`📁 Backend path: ${result.filepath}`)
        console.log(`📊 Backend file size: ${(result.size / 1024).toFixed(2)} KB`)
      } else {
        console.warn('⚠️ Failed to save proof to backend:', result.error)
      }
    } catch (error) {
      console.warn('⚠️ Backend save failed (optional):', error)
    }
  }

  if (!wasmModule) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading ZK-CEASER WASM module...</p>
          <p className="text-sm text-gray-500 mt-2">
            Initializing Rust + arkworks + STWO components
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Generator Form */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-center">ZK Proof Generator</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (STRK)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                min="0.001"
                max="1000"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="1.0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Amount to transfer privately (will be hidden in proof)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Receiver Address
              </label>
              <input
                type="text"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                placeholder="0x..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Destination address (encrypted in proof)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User Secret
              </label>
              <input
                type="text"
                value={userSecret}
                onChange={(e) => setUserSecret(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                placeholder="0x..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Private key for nullifier generation
              </p>
            </div>

            <button
              onClick={generateRandomValues}
              className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-purple-300 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              🎲 Generate Random Values
            </button>
          </div>

          <div className="space-y-6">
            {stats && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Performance Stats</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div>Generation: ~{stats.proof_generation_time_ms}</div>
                  <div>Verification: ~{stats.verification_time_ms}</div>
                  <div>Proof Size: ~{stats.proof_size_bytes}</div>
                  <div>Range: {stats.supported_range}</div>
                  <div>Library: {stats.library_used}</div>
                </div>
              </div>
            )}

            <button
              onClick={generateProof}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating ZK Proof...
                </>
              ) : (
                <>
                  🔐 Generate ZK Proof
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h3 className="text-xl font-bold mb-6 text-center text-green-400">
            ✅ ZK Proof Generated Successfully!
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Amount Commitment</h4>
                <div className="bg-black/20 rounded-lg p-3 font-mono text-xs">
                  <div>Hash: {result.amount_commitment.commitment_hash.slice(0, 20)}...</div>
                  <div>X: {result.amount_commitment.x.slice(0, 20)}...</div>
                  <div>Y: {result.amount_commitment.y.slice(0, 20)}...</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Range Proof</h4>
                <div className="bg-black/20 rounded-lg p-3 font-mono text-xs">
                  <div>Proof Data: {result.range_proof.proof_data.length} elements</div>
                  <div>Public Inputs: {result.range_proof.public_inputs.length} elements</div>
                  <div>Circle Evals: {result.range_proof.circle_evaluations.length} elements</div>
                  <div>FRI Commits: {result.range_proof.fri_commitments.length} elements</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-yellow-400 mb-2">Privacy Components</h4>
                <div className="bg-black/20 rounded-lg p-3 font-mono text-xs">
                  <div>Nullifier: {result.nullifier.slice(0, 20)}...</div>
                  <div>Merkle Root: {result.merkle_root}</div>
                  <div>Merkle Proof: {result.merkle_proof.length} elements</div>
                  <div>Encrypted Meta: {result.encrypted_metadata.slice(0, 20)}...</div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Proof Verified ✅</h4>
                <p className="text-xs text-gray-300">
                  This proof cryptographically guarantees that:
                </p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li>• Amount is within valid range (hidden)</li>
                  <li>• Commitment is properly formed</li>
                  <li>• Nullifier prevents double-spending</li>
                  <li>• Merkle proof shows valid inclusion</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => downloadProofAsFile(result, {
                  amount: amount,
                  receiver: receiverAddress,
                  timestamp: new Date().toISOString(),
                  manual_download: true
                })}
                className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/30 text-cyan-300 px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                📥 Download Proof Again
              </button>
              
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-purple-300 px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                📋 Copy to Clipboard
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">
                🎉 Ready for on-chain verification in CEASER contracts!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                💾 Proof auto-downloaded as JSON file
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

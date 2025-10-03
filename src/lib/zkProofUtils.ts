/**
 * Utilities for converting ZK proof JSON to Cairo calldata format
 */

export interface ZKProofJSON {
  amount_commitment: {
    x: string
    y: string
    commitment_hash: string
  }
  range_proof: {
    proof_data: string[]
    public_inputs: string[]
    circle_evaluations?: string[]
    fri_commitments?: string[]
  }
  nullifier: string
  merkle_proof: string[]
  merkle_root: string
  encrypted_metadata: string
}

/**
 * Convert hex string to felt252 (Cairo format)
 * Ensures the value fits in felt252 (< 2^251 + 17*2^192 + 1)
 */
export function hexToFelt(hex: string): string {
  // Remove 0x prefix if exists
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  
  // Truncate to 62 hex chars (248 bits) to ensure it fits in felt252 (252 bits with margin)
  const truncated = cleanHex.slice(0, 62)
  
  return '0x' + truncated.padStart(1, '0')
}

/**
 * Split long hex string into multiple felts (max 252 bits each)
 * Cairo felt252 can hold up to 252 bits, which is ~76 hex characters
 */
export function splitToFelts(hexString: string): string[] {
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString
  const chunkSize = 60 // Safe size for felt252 (leaves margin)
  const chunks: string[] = []
  
  for (let i = 0; i < cleanHex.length; i += chunkSize) {
    const chunk = cleanHex.slice(i, i + chunkSize)
    chunks.push('0x' + chunk)
  }
  
  return chunks
}

/**
 * Convert ZK proof JSON to Cairo calldata format FOR V3
 * V3 uses a simplified ZKProof struct:
 * struct ZKProof {
 *   commitment_hash: felt252,
 *   nullifier: felt252,
 *   merkle_root: felt252,
 *   encrypted_receiver: felt252,
 * }
 */
export function zkProofToCalldata(proof: ZKProofJSON): string[] {
  const calldata: string[] = []
  
  // 1. commitment_hash (from amount_commitment.commitment_hash)
  calldata.push(hexToFelt(proof.amount_commitment.commitment_hash))
  
  // 2. nullifier
  calldata.push(hexToFelt(proof.nullifier))
  
  // 3. merkle_root
  calldata.push(hexToFelt(proof.merkle_root))
  
  // 4. encrypted_receiver (first felt from encrypted_metadata)
  // Take first 62 hex characters (safe for felt252 which is 252 bits ≈ 76 hex chars)
  const cleanMetadata = proof.encrypted_metadata.startsWith('0x') 
    ? proof.encrypted_metadata.slice(2) 
    : proof.encrypted_metadata
  
  // Take first chunk (up to 62 chars to be safe) and pad with 0x
  const firstChunk = cleanMetadata.slice(0, 62)
  const encryptedReceiver = '0x' + firstChunk.padStart(1, '0') // Ensure at least 0x0
  
  calldata.push(encryptedReceiver)
  
  return calldata
}

/**
 * Format u256 amount for Cairo (low, high)
 */
export function formatU256(amount: string): { low: bigint, high: bigint } {
  const amountWei = BigInt(parseFloat(amount) * 1e18)
  const low = amountWei & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
  const high = amountWei >> BigInt(128)
  return { low, high }
}

/**
 * Convert ZK proof JSON to Cairo calldata format FOR V4
 * V4 uses full ZKProofV4 struct with user-provided amount and receiver:
 * struct ZKProofV4 {
 *   commitment_hash: felt252,
 *   nullifier: felt252,
 *   merkle_root: felt252,
 *   encrypted_receiver: felt252,
 *   merkle_proof_path: Array<felt252>,
 *   merkle_leaf_index: u32,
 *   commitment_x: felt252,
 *   commitment_y: felt252,
 *   commitment_opening_hash: felt252,
 *   amount: u256,
 *   receiver: ContractAddress,
 * }
 */
export function zkProofV4ToCalldata(proofJson: any): string[] {
  const proof = proofJson.zk_proof
  const metadata = proofJson.metadata
  const calldata: string[] = []
  
  console.log('🔧 Converting proof to V4 calldata...')
  
  // 1. commitment_hash
  calldata.push(hexToFelt(proof.amount_commitment.commitment_hash))
  
  // 2. nullifier
  calldata.push(hexToFelt(proof.nullifier))
  
  // 3. merkle_root
  calldata.push(hexToFelt(proof.merkle_root))
  
  // 4. encrypted_receiver (first felt from encrypted_metadata)
  calldata.push(hexToFelt(proof.encrypted_metadata))
  
  // 5. merkle_proof_path (Array<felt252>)
  // Extract proof_path from merkle_proof object
  let proofPath: string[] = []
  if (typeof proof.merkle_proof === 'object' && 'proof_path' in proof.merkle_proof) {
    proofPath = proof.merkle_proof.proof_path
  } else if (Array.isArray(proof.merkle_proof)) {
    proofPath = proof.merkle_proof
  }
  
  console.log(`📊 Merkle proof path length: ${proofPath.length}`)
  calldata.push(proofPath.length.toString()) // Array length
  proofPath.forEach(p => calldata.push(hexToFelt(p)))
  
  // 6. merkle_leaf_index (u32)
  const leafIndex = proof.merkle_proof.leaf_index || 0
  console.log(`📊 Merkle leaf index: ${leafIndex}`)
  calldata.push(leafIndex.toString())
  
  // 7. commitment_x
  calldata.push(hexToFelt(proof.amount_commitment.x))
  
  // 8. commitment_y
  calldata.push(hexToFelt(proof.amount_commitment.y))
  
  // 9. commitment_opening_hash
  calldata.push(hexToFelt(proof.amount_commitment.commitment_hash))
  
  // 10. amount (u256: low, high) - FROM METADATA
  const amountWei = BigInt(Math.floor(parseFloat(metadata.amount) * 1e18))
  const low = amountWei & ((BigInt(1) << BigInt(128)) - BigInt(1))
  const high = amountWei >> BigInt(128)
  console.log(`💰 Amount: ${metadata.amount} STRK (${amountWei} wei)`)
  console.log(`💰 Amount u256: low=${low.toString(16)}, high=${high.toString(16)}`)
  calldata.push('0x' + low.toString(16))
  calldata.push('0x' + high.toString(16))
  
  // 11. receiver (ContractAddress) - FROM METADATA
  console.log(`📍 Receiver: ${metadata.receiver}`)
  calldata.push(hexToFelt(metadata.receiver))
  
  console.log(`✅ V4 Calldata length: ${calldata.length}`)
  
  return calldata
}

/**
 * Validate ZK proof structure
 */
export function validateZKProof(proof: any): proof is ZKProofJSON {
  if (!proof || typeof proof !== 'object') {
    console.error('❌ Proof validation failed: proof is null or not an object')
    return false
  }

  // Check amount_commitment
  if (!proof.amount_commitment || typeof proof.amount_commitment !== 'object') {
    console.error('❌ Proof validation failed: missing or invalid amount_commitment')
    return false
  }
  if (typeof proof.amount_commitment.x !== 'string' || 
      typeof proof.amount_commitment.y !== 'string' ||
      typeof proof.amount_commitment.commitment_hash !== 'string') {
    console.error('❌ Proof validation failed: invalid amount_commitment fields')
    return false
  }

  // Check range_proof
  if (!proof.range_proof || typeof proof.range_proof !== 'object') {
    console.error('❌ Proof validation failed: missing or invalid range_proof')
    return false
  }
  if (!Array.isArray(proof.range_proof.proof_data) || 
      !Array.isArray(proof.range_proof.public_inputs)) {
    console.error('❌ Proof validation failed: invalid range_proof arrays')
    return false
  }

  // Check nullifier
  if (typeof proof.nullifier !== 'string') {
    console.error('❌ Proof validation failed: invalid nullifier')
    return false
  }

  // Check merkle_proof (can be array or object)
  if (!proof.merkle_proof) {
    console.error('❌ Proof validation failed: missing merkle_proof')
    return false
  }

  // Check merkle_root
  if (typeof proof.merkle_root !== 'string') {
    console.error('❌ Proof validation failed: invalid merkle_root')
    return false
  }

  // Check encrypted_metadata
  if (typeof proof.encrypted_metadata !== 'string') {
    console.error('❌ Proof validation failed: invalid encrypted_metadata')
    return false
  }

  console.log('✅ Proof validation passed')
  return true
}


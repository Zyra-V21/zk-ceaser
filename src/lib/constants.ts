// Starknet Sepolia Contract Addresses
export const CONTRACTS = {
  // ZK Privacy Matrix V4 - With AUTO-REGISTER MERKLE ROOTS (UX Fixed!)
  ZK_PRIVACY_MATRIX_V4: '0x027f726c6917c75df9277fab3c3267ec47a056065a9a0e5d59c316d51f20e28e',
  
  // External Verifiers (Deployed) - MerkleVerifier owned by V4
  MERKLE_VERIFIER: '0x07719464ef67e1c3fe39974060b71ea4f22cb8d94b029f2bd5f49b2694729646',
  PEDERSEN_VERIFIER: '0x069c9d8ca7681122bed57d5451f060ee11407255d23a24b87d6707a9eca6b407',
  
  // STRK Token (Sepolia)
  STRK_TOKEN: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  
  // Paymaster (Pipilongo for TX1)
  PIPILONGO_ADDRESS: '0x5793e9a894be3af2bc4f13c12221d1b79b1fe4d31cf99836181d6e186c1bf3a',
  
  // CEASER Mixing (Legacy - for MixingForm)
  MIXING_FEE_COLLECTOR: '0x075e79fdc066b628b691913b16dd642a9813055ee61d681be2696713a811cfa0',
  
  // Legacy (Deprecated)
  ZK_PRIVACY_MATRIX_V3: '0x0153b0c25ee9bdf3ead00ca71511041449fdfcc165e3e0fc197d652ce68c5c54',
} as const

// RPC Configuration
export const RPC_CONFIG = {
  SEPOLIA_RPC: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YEktXqVy5RL-z1r7Z6Fyh',
  PUBLIC_RPC: 'https://starknet-sepolia.public.blastapi.io',
} as const

// ZK Privacy Matrix V3 ABI (simplified for frontend)
export const ZK_PRIVACY_MATRIX_ABI = [
  {
    name: 'deposit_private',
    type: 'function',
    inputs: [
      {
        name: 'zk_proof',
        type: 'ZKProof',
        components: [
          { name: 'amount_commitment_x', type: 'felt' },
          { name: 'amount_commitment_y', type: 'felt' },
          { name: 'amount_commitment_hash', type: 'felt' },
          { name: 'range_proof_data', type: 'Array<felt>' },
          { name: 'range_proof_public_inputs', type: 'Array<felt>' },
          { name: 'nullifier', type: 'felt' },
          { name: 'merkle_proof', type: 'Array<felt>' },
          { name: 'merkle_root', type: 'felt' },
          { name: 'encrypted_metadata', type: 'Array<felt>' }
        ]
      }
    ],
    outputs: [],
    stateMutability: 'external'
  },
  {
    name: 'withdraw_private',
    type: 'function',
    inputs: [
      {
        name: 'zk_proof',
        type: 'ZKProof',
        components: [
          { name: 'amount_commitment_x', type: 'felt' },
          { name: 'amount_commitment_y', type: 'felt' },
          { name: 'amount_commitment_hash', type: 'felt' },
          { name: 'range_proof_data', type: 'Array<felt>' },
          { name: 'range_proof_public_inputs', type: 'Array<felt>' },
          { name: 'nullifier', type: 'felt' },
          { name: 'merkle_proof', type: 'Array<felt>' },
          { name: 'merkle_root', type: 'felt' },
          { name: 'encrypted_metadata', type: 'Array<felt>' }
        ]
      }
    ],
    outputs: [],
    stateMutability: 'external'
  },
  {
    name: 'get_deposit_count',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'count', type: 'u32' }],
    stateMutability: 'view'
  }
] as const

// ERC20 ABI for STRK token interactions
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'felt' }],
    outputs: [{ name: 'balance', type: 'Uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'felt' },
      { name: 'amount', type: 'Uint256' }
    ],
    outputs: [{ name: 'success', type: 'felt' }],
    stateMutability: 'external'
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'felt' },
      { name: 'spender', type: 'felt' }
    ],
    outputs: [{ name: 'remaining', type: 'Uint256' }],
    stateMutability: 'view'
  }
] as const

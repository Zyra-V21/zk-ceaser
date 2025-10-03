'use client'

import { useState, useEffect } from 'react'
import { ZKPrivacyForm } from '@/components/ZKPrivacyForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ZK-CEASER Matrix V3
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            True Privacy-Preserving STRK Protocol with ZK-STARKs
          </p>
          <p className="text-sm text-gray-400">
            Amount & Receiver Hidden • STWO Proofs • Autonomous Execution
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-2xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Total Privacy</h3>
            <p className="text-gray-400 text-sm">
              Amount and receiver are completely hidden via ZK-STARKs
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Circle STARKs</h3>
            <p className="text-gray-400 text-sm">
              STWO prover with M31 field arithmetic for efficient proofs
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-2xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Auto Execution</h3>
            <p className="text-gray-400 text-sm">
              Backend automatically executes TX1 using Pipilongo paymaster
            </p>
          </div>
        </div>

        {/* ZK Privacy Form */}
        <ZKPrivacyForm />

        {/* Technical Details */}
        <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-center">Technical Architecture</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">ZK Components</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Pedersen Commitments:</strong> Hide transaction amounts</li>
                <li>• <strong>Range Proofs:</strong> Prove amount is within valid bounds</li>
                <li>• <strong>Merkle Proofs:</strong> Prove inclusion in anonymity set</li>
                <li>• <strong>Nullifiers:</strong> Prevent double-spending</li>
                <li>• <strong>Encryption:</strong> Hide receiver metadata</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Libraries Used</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>arkworks-rs 0.5.0:</strong> ZK-SNARK ecosystem</li>
                <li>• <strong>STWO:</strong> Circle STARKs prover</li>
                <li>• <strong>M31 Field:</strong> Efficient field arithmetic</li>
                <li>• <strong>Rust + WASM:</strong> High-performance computation</li>
                <li>• <strong>Next.js:</strong> Modern web interface</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Built with 🦀 Rust + ⚡ STWO + 🌟 Starknet</p>
          <p className="mt-2">
            This is a demo application. Do not use with real funds on mainnet.
          </p>
        </div>
      </div>
    </main>
  )
}
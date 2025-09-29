/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Configuración específica para WebAssembly en Next.js 15.x
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    }

    // Regla específica para archivos WASM
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // Resolver extensiones WASM
    config.resolve.extensions.push('.wasm')

    // Configuración específica para wasm-bindgen en 2025
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }

    // Optimizaciones para WASM en producción
    if (!dev) {
      config.optimization.moduleIds = 'deterministic'
    }

    return config
  },

  // Configuración experimental para Next.js 15.x
  experimental: {
    esmExternals: 'loose',
    webpackBuildWorker: true,
  },

  // Headers para WASM (Cross-Origin-Embedder-Policy)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
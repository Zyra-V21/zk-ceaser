/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Configuración mínima para WebAssembly en Next.js 15.x
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    }

    // Regla para archivos WASM
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // Fallbacks para resolver módulos faltantes
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }

    // Solo para el cliente, ignorar wbg
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        wbg: false,
      }
    }

    return config
  },

  // Configuración experimental mínima
  experimental: {
    webpackBuildWorker: true,
  },

  // Headers básicos para WASM
  async headers() {
    return [
      {
        source: '/pkg/:path*',
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
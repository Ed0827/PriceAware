/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Handle HTML files
    config.module.rules.push({
      test: /\.html$/,
      use: 'ignore-loader'
    })

    // Handle node-pre-gyp files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mapbox/node-pre-gyp': false
    }

    return config
  },
  // Disable server-side rendering for API routes that use DuckDB
  experimental: {
    serverComponentsExternalPackages: ['duckdb']
  }
}

module.exports = nextConfig 
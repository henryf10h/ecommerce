/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@app/core'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
};

export default nextConfig;

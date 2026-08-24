import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Trust X-Forwarded-For headers from proxies (for IP detection in license APIs)
  experimental: {},
};

export default nextConfig;

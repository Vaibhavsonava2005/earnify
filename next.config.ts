import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.earnify.site' }],
        destination: 'https://earnify.site/:path*',
        permanent: true, // 301 redirect — tells Google to always use earnify.site
      },
    ];
  },
};

export default withPWA(nextConfig);

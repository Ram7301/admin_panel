import type { NextConfig } from "next";
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://flagcdn.com;
    font-src 'self';
    object-src 'self';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    connect-src 'self' https://cdn.jsdelivr.net http://localhost:5138 
https://ivs-api.runasp.net;
`;

const nextConfig: NextConfig = {
  /* config options here */
    modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
  },
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      }
    ]
  },

    async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '')
          }
        ]
      }
    ];
  }
};

export default nextConfig;

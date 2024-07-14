/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages: ['@noble/curves', 'bs58'],
    async headers() {
      return [
        {
          source: '/actions.json',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  
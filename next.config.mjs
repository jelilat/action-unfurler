/** @type {import('next').NextConfig} */
const nextConfig = {
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
  
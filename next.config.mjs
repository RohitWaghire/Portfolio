/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [75, 95],
    localPatterns: [
      { pathname: '/**', search: '' },
      { pathname: '/**', search: '?v=3' }
    ]
  }
};

export default nextConfig;

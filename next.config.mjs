// // next.config.mjs (Corrected version)
// import nextPWA from 'next-pwa';

// const withPWA = nextPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   sw: 'service-worker.mjs',
//   disable: process.env.NODE_ENV === 'development',
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any other Next.js specific configurations here
  // For example:
  // reactStrictMode: true,
};

// EXPORT THE WRAPPED CONFIG
export default nextConfig;
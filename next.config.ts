import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
    additionalData: `@use "@/styles/variables.scss" as *;`,
  },
};

export default nextConfig;

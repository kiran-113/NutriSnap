import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.ignoreWarnings = [
        {
          module: /@opentelemetry\/sdk-trace-node/,
        },
      ];
    }
    return config;
  },
};

export default nextConfig;

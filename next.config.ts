import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Exporta la app a archivos estáticos (SPA)
  images: {
    unoptimized: true, // Desactiva la optimización de Next.js, Cloudinary se encargará de ello.
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

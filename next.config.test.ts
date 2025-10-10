import nextConfig from './next.config';
import type { NextConfig } from 'next';

describe('Next Config', () => {
  it('should export a valid NextConfig object', () => {
    expect(nextConfig).toBeDefined();
    expect(typeof nextConfig).toBe('object');
  });

  it('should have experimental ppr enabled', () => {
    expect(nextConfig).toHaveProperty('experimental.ppr');
    expect(nextConfig.experimental?.ppr).toBe(true);
  });

  it('should allow images from avatar.vercel.sh', () => {
    expect(nextConfig.images?.remotePatterns).toContainEqual({
      hostname: 'avatar.vercel.sh',
    });
  });

  it('should allow images from vercel-storage.com', () => {
    expect(nextConfig.images?.remotePatterns).toContainEqual({
      protocol: 'https',
      hostname: '**.public.blob.vercel-storage.com',
    });
  });
});

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  // Allow Turbopack to use system TLS certificates so it can reach Google Fonts
  // in CI environments that don't bundle their own CA store.
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/prestige-worldwide' : '',
  },
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/prestige-worldwide',
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  }),
};

export default nextConfig;

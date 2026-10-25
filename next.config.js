/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      // Headers de sécurité API
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // Servir les .mjs avec le bon Content-Type pour les ES modules
      {
        source: "/talkinghead/:path*.mjs",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          // Permettre à esm.sh d'être chargé depuis ces modules
          {
            key: "Content-Security-Policy",
            value: [
              "script-src 'self' 'unsafe-eval' https://esm.sh",
              "worker-src 'self' blob:",
              "connect-src 'self' https://esm.sh https://cdn.jsdelivr.net",
            ].join("; "),
          },
        ],
      },
    ];
  },

  webpack: function(config, options) {
    if (!options.isServer) {
      config.resolve.fallback = Object.assign({}, config.resolve.fallback, {
        fs: false,
        net: false,
        tls: false,
      });
    }
    return config;
  },
};

module.exports = nextConfig;

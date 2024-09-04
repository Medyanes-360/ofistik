const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ofistikprofileimages.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**", // Alt dizinler dahil tüm yollar
      },
    ],
  },
};

module.exports = nextConfig;

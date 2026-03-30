import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "**.supabase.co",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const parsedUrl = new URL(supabaseUrl);
    remotePatterns.unshift({
      protocol: parsedUrl.protocol === "http:" ? "http" : "https",
      hostname: parsedUrl.hostname,
    });
  } catch {
    // Ignore malformed env values so local development can still start.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;

import { config } from "dotenv"
import { resolve } from "path"
import type { NextConfig } from "next"

config({ path: resolve(__dirname, "../.env") })

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig

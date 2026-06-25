#!/usr/bin/env bash
# Build script for Render.com — run from repo root.
set -euo pipefail

echo "==> Installing root dependencies..."
bun install

echo "==> Installing web dependencies..."
cd web && bun install && cd ..

echo "==> Generating Prisma client..."
bun run db:generate

echo "==> Syncing database schema (Supabase)..."
bun run db:push

echo "==> Building Next.js..."
cd web && bun run build

echo "==> Build complete."

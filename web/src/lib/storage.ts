import path from "path"
import fs from "fs/promises"

/**
 * Upload abstraction — supports local filesystem and Supabase Storage.
 * Set STORAGE_PROVIDER=supabase in .env and configure SUPABASE_URL + SUPABASE_SERVICE_KEY
 * to switch to cloud storage. Defaults to local.
 */
export async function uploadFile(file: File, filePath: string): Promise<string> {
  const provider = process.env.STORAGE_PROVIDER ?? "local"

  if (provider === "supabase") {
    return uploadToSupabase(file, filePath)
  }

  return uploadLocal(file, filePath)
}

async function uploadLocal(file: File, filePath: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", path.dirname(filePath))
  await fs.mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const dest = path.join(process.cwd(), "public", "uploads", filePath)
  await fs.writeFile(dest, buffer)

  return `/uploads/${filePath}`
}

async function uploadToSupabase(file: File, filePath: string): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  const bucket = process.env.SUPABASE_BUCKET ?? "lookmenu"

  if (!supabaseUrl || !serviceKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for Supabase storage.")
  }

  const buffer = await file.arrayBuffer()

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: buffer,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase upload failed: ${body}`)
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`
}

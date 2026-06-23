import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { uploadFile } from "@/lib/storage"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const filePath = String(formData.get("path") ?? "").trim()

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF." }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 5 MB." }, { status: 400 })
  }

  if (!filePath) {
    return NextResponse.json({ error: "Caminho de destino não informado." }, { status: 400 })
  }

  try {
    const url = await uploadFile(file, filePath)
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Erro ao fazer upload do arquivo." }, { status: 500 })
  }
}

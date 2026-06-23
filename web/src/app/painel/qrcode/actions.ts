"use server"

import QRCode from "qrcode"

/**
 * Gera um QR Code como data URL PNG (base64) para a URL fornecida.
 * Executado exclusivamente no servidor.
 */
export async function gerarQRCodeAction(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    type: "image/png",
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  })
}

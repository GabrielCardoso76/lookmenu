"use client"

const GOOGLE_FONTS: Record<string, string> = {
  Poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  Nunito: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap",
  Raleway: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
  Oswald: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap",
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
  Lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
}

export function getFontFamily(fonte: string | null | undefined): string {
  if (!fonte || fonte === "Inter") return "'Inter', system-ui, sans-serif"
  return `'${fonte}', sans-serif`
}

export function FonteLink({ fonte }: { fonte: string | null | undefined }) {
  if (!fonte || fonte === "Inter" || !GOOGLE_FONTS[fonte]) return null
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link rel="stylesheet" href={GOOGLE_FONTS[fonte]} />
  )
}

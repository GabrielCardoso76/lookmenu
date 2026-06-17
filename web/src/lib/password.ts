import bcrypt from "bcryptjs"

const ROUNDS = 12

export async function hashPassword(senha: string): Promise<string> {
  return bcrypt.hash(senha, ROUNDS)
}

export async function verifyPassword(senha: string, senhaHash: string): Promise<boolean> {
  return bcrypt.compare(senha, senhaHash)
}

/**
 * Feature-gating por plano.
 * TODO (Fase 5): integrar com billing real — verificar plano ativo da loja.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function canUseCupons(_lojaId: string): Promise<boolean> {
  return true
}

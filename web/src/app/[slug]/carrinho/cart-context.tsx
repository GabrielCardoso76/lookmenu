"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type CartItem = {
  id: string
  nome: string
  preco: number
  quantidade: number
}

type CartContextValue = {
  items: CartItem[]
  add: (product: { id: string; nome: string; preco: number }) => void
  remove: (id: string) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

function storageKey(slug: string) {
  return `lookmenu_cart_${slug}`
}

export function CartProvider({ children, slug }: { children: React.ReactNode; slug: string }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(slug))
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [slug])

  const persist = useCallback(
    (next: CartItem[]) => {
      setItems(next)
      try {
        localStorage.setItem(storageKey(slug), JSON.stringify(next))
      } catch {}
    },
    [slug],
  )

  const add = useCallback(
    (product: { id: string; nome: string; preco: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id)
        const next = existing
          ? prev.map((i) => (i.id === product.id ? { ...i, quantidade: i.quantidade + 1 } : i))
          : [...prev, { ...product, quantidade: 1 }]
        try {
          localStorage.setItem(storageKey(slug), JSON.stringify(next))
        } catch {}
        return next
      })
    },
    [slug],
  )

  const remove = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id))
    },
    [items, persist],
  )

  const increment = useCallback(
    (id: string) => {
      persist(items.map((i) => (i.id === id ? { ...i, quantidade: i.quantidade + 1 } : i)))
    },
    [items, persist],
  )

  const decrement = useCallback(
    (id: string) => {
      const next = items
        .map((i) => (i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter((i) => i.quantidade > 0)
      persist(next)
    },
    [items, persist],
  )

  const clear = useCallback(() => {
    persist([])
  }, [persist])

  const total = items.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const count = items.reduce((s, i) => s + i.quantidade, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, increment, decrement, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}

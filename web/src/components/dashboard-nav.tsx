"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export type DashboardNavItem = {
  href: string
  label: string
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/painel") return pathname === "/painel"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: DashboardNavItem
  pathname: string
  onNavigate?: () => void
}) {
  const active = isNavActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "block rounded-r-md border-l-2 px-4 py-2.5 text-base font-medium transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-transparent text-gray-700 hover:bg-secondary hover:text-foreground",
      )}
    >
      {item.label}
    </Link>
  )
}

export function DashboardSidebar({ nav }: { nav: DashboardNavItem[] }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border">
      <nav className="sticky top-0 flex min-h-[calc(100vh-4rem)] flex-col gap-0.5 px-4 py-4">
        {nav.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  )
}

export function DashboardMobileNav({ nav }: { nav: DashboardNavItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden shrink-0" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 px-4 py-4">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

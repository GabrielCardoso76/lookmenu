import Link from "next/link"

import { logoutAction } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { SessionUser } from "@/lib/session"

type NavItem = {
  href: string
  label: string
}

type DashboardShellProps = {
  user: SessionUser
  title: string
  nav: NavItem[]
  children: React.ReactNode
}

export function DashboardShell({ user, title, nav, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              LookMenu
            </Link>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.nome}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Separator className="mb-6 md:hidden" />
          {children}
        </main>
      </div>
    </div>
  )
}

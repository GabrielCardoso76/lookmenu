import Link from "next/link"

import { logoutAction } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { DashboardMobileNav, DashboardSidebar, type DashboardNavItem } from "@/components/dashboard-nav"
import type { SessionUser } from "@/lib/session"

type DashboardShellProps = {
  user: SessionUser
  title: string
  nav: DashboardNavItem[]
  children: React.ReactNode
}

export function DashboardShell({ user, title, nav, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="w-full shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <DashboardMobileNav nav={nav} />
            <div className="min-w-0">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary">
                LookMenu
              </Link>
              <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:inline">{user.nome}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <DashboardSidebar nav={nav} />

        <main className="min-w-0 flex-1 px-6 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

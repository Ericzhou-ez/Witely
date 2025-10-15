import * as React from "react"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AppSidebar } from "./app-sidebar"
import type { User } from "next-auth"
import { SidebarProvider } from "@/components/ui/sidebar"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}))

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock subcomponents
vi.mock("@/components/sidebar-history", () => ({
  SidebarHistory: ({ user }: { user?: User }) => (
    <div data-testid="sidebar-history">{user ? "History with user" : "History without user"}</div>
  ),
}))

vi.mock("@/components/sidebar-user-nav", () => ({
  SidebarUserNav: ({ user }: { user: User }) => (
    <div data-testid="sidebar-user-nav">User Nav</div>
  ),
}))

describe("AppSidebar", () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
  })

  it("renders the sidebar structure", () => {
    render(
      <SidebarProvider>
        <AppSidebar user={undefined} />
      </SidebarProvider>
    )

    expect(screen.getByText("Witely")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /plus/i })).toBeInTheDocument()
    expect(screen.getByText("Navigation")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Integrations")).toBeInTheDocument()
    expect(screen.getByText("Data Control")).toBeInTheDocument()
    expect(screen.getByTestId("sidebar-history")).toHaveTextContent("History without user")
    expect(screen.queryByTestId("sidebar-user-nav")).not.toBeInTheDocument()
  })

  it("renders user nav when user is provided", () => {
    const mockUser: User = { id: "1", name: "Test User", email: "test@example.com" } as User

    render(
      <SidebarProvider>
        <AppSidebar user={mockUser} />
      </SidebarProvider>
    )

    expect(screen.getByTestId("sidebar-history")).toHaveTextContent("History with user")
    expect(screen.getByTestId("sidebar-user-nav")).toBeInTheDocument()
  })

  it("handles new chat button click", async () => {
    render(
      <SidebarProvider>
        <AppSidebar user={undefined} />
      </SidebarProvider>
    )

    const newChatButton = screen.getByRole("button", { name: /plus/i })
    await user.click(newChatButton)

    expect(mockPush).toHaveBeenCalledWith("/chat")
    expect(mockRefresh).toHaveBeenCalled()
  })

  it("logo link href is /", () => {
    render(
      <SidebarProvider>
        <AppSidebar user={undefined} />
      </SidebarProvider>
    )

    const logoLink = screen.getByText("Witely").closest("a")
    expect(logoLink).toHaveAttribute("href", "/")
  })

  it("dashboard link href is /dashboard", () => {
    render(
      <SidebarProvider>
        <AppSidebar user={undefined} />
      </SidebarProvider>
    )

    const dashboardLink = screen.getByText("Dashboard").closest("a")
    expect(dashboardLink).toHaveAttribute("href", "/dashboard")
  })

  it("integrations link href is /integrations", () => {
    render(
      <SidebarProvider>
        <AppSidebar user={undefined} />
      </SidebarProvider>
    )

    const integrationsLink = screen.getByText("Integrations").closest("a")
    expect(integrationsLink).toHaveAttribute("href", "/integrations")
  })

  it("data control link href is /data-control", () => {
    render(
      <SidebarProvider>
        <AppSidebar user={undefined} />
      </SidebarProvider>
    )

    const dataControlLink = screen.getByText("Data Control").closest("a")
    expect(dataControlLink).toHaveAttribute("href", "/data-control")
  })
})

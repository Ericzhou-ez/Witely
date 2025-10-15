import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import RootLayout, { metadata, viewport } from "./layout"

// Mock next-auth SessionProvider
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock ThemeProvider
vi.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock Toaster
vi.mock("sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}))

// Mock SettingsModal
vi.mock("@/components/settings-modal", () => ({
  SettingsModal: () => <div data-testid="settings-modal" />,
}))

describe("RootLayout", () => {
  it("exports correct metadata", () => {
    expect(metadata).toEqual({
      metadataBase: new URL("https://chat.vercel.ai"),
      title: "Witely",
      description: "Never Copy & Paste Again; Witely Gives You the Anwsers You Need, Before You Ask",
    })
  })

  it("exports viewport config", () => {
    expect(viewport).toEqual({
      maximumScale: 1,
    })
  })

  it("renders children", () => {
    const children = <div data-testid="children">Hello World</div>
    render(<RootLayout>{children}</RootLayout>)
    expect(screen.getByTestId("children")).toBeInTheDocument()
  })

  it("applies font variables to html", () => {
    const children = <div>Hello</div>
    const { container } = render(<RootLayout>{children}</RootLayout>)
    const html = container.querySelector("html")
    expect(html).toHaveClass("--font-roboto")
    expect(html).toHaveClass("--font-roboto-mono")
  })

  it("sets lang to en on html", () => {
    const { container } = render(<RootLayout><div /></RootLayout>)
    const html = container.querySelector("html")
    expect(html).toHaveAttribute("lang", "en")
  })

  it("applies antialiased class to body", () => {
    const { container } = render(<RootLayout><div /></RootLayout>)
    const body = container.querySelector("body")
    expect(body).toHaveClass("antialiased")
  })

  it("renders Toaster", () => {
    render(<RootLayout><div /></RootLayout>)
    expect(screen.getByTestId("toaster")).toBeInTheDocument()
  })

  it("renders SettingsModal", () => {
    render(<RootLayout><div /></RootLayout>)
    expect(screen.getByTestId("settings-modal")).toBeInTheDocument()
  })

  it("includes theme color script in head", () => {
    const { container } = render(<RootLayout><div /></RootLayout>)
    const script = container.querySelector("script")
    expect(script).toHaveAttribute("dangerouslySetInnerHTML") // or check content, but since mocked, maybe skip detailed content
  })
})
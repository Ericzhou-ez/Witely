import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Kbd, KbdGroup } from "./kbd"

describe("Kbd", () => {
  it("renders with children", () => {
    render(<Kbd>Esc</Kbd>)
    const kbd = screen.getByText("Esc")
    expect(kbd).toBeInTheDocument()
    expect(kbd).toHaveClass("inline-flex")
    expect(kbd.tagName).toBe("KBD")
  })

  it("applies custom className", () => {
    render(<Kbd className="custom-class">Space</Kbd>)
    const kbd = screen.getByText("Space")
    expect(kbd).toHaveClass("custom-class")
  })

  it("forwards props", () => {
    render(<Kbd id="test-id" data-testid="kbd-test">Tab</Kbd>)
    const kbd = screen.getByTestId("kbd-test")
    expect(kbd).toHaveAttribute("id", "test-id")
  })
})

describe("KbdGroup", () => {
  it("renders with children", () => {
    render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>
      </KbdGroup>
    )
    const group = screen.getByText("Ctrl")
    expect(group).toBeInTheDocument()
    expect(group.parentElement).toHaveClass("inline-flex")
    expect(group.tagName).toBe("KBD")
  })

  it("applies custom className", () => {
    render(<KbdGroup className="group-custom">Cmd + Z</KbdGroup>)
    const group = screen.getByText("Cmd")
    expect(group.parentElement).toHaveClass("group-custom")
  })

  it("forwards props", () => {
    render(<KbdGroup id="group-test" data-testid="group-test">Shift + Enter</KbdGroup>)
    const group = screen.getByTestId("group-test")
    expect(group).toHaveAttribute("id", "group-test")
  })
})

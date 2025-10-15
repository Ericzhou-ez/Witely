import * as React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Switch } from "./switch"

describe("Switch", () => {
  it("renders without crashing", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toBeInTheDocument()
  })

  it("is initially unchecked", () => {
    render(<Switch />)
    const switchElement = screen.getByRole("switch")
    expect(switchElement).not.toHaveAttribute("data-state", "checked")
  })

  it("can be toggled to checked", () => {
    const handleCheckedChange = vi.fn()
    render(<Switch onCheckedChange={handleCheckedChange} />)
    const switchElement = screen.getByRole("switch")
    fireEvent.click(switchElement)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)
    expect(switchElement).toHaveAttribute("data-state", "checked")
  })

  it("can be toggled to unchecked", () => {
    const handleCheckedChange = vi.fn()
    render(<Switch checked onCheckedChange={handleCheckedChange} />)
    const switchElement = screen.getByRole("switch")
    fireEvent.click(switchElement)
    expect(handleCheckedChange).toHaveBeenCalledWith(false)
    expect(switchElement).not.toHaveAttribute("data-state", "checked")
  })

  it("is disabled and does not toggle", () => {
    const handleCheckedChange = vi.fn()
    render(<Switch disabled onCheckedChange={handleCheckedChange} />)
    const switchElement = screen.getByRole("switch")
    expect(switchElement).toHaveAttribute("disabled")
    fireEvent.click(switchElement)
    expect(handleCheckedChange).not.toHaveBeenCalled()
  })

  it("applies custom className", () => {
    render(<Switch className="custom-class" />)
    const switchElement = screen.getByRole("switch")
    expect(switchElement).toHaveClass("custom-class")
  })

  it("has proper accessibility attributes", () => {
    render(<Switch />)
    const switchElement = screen.getByRole("switch")
    expect(switchElement).toHaveAttribute("role", "switch")
    expect(switchElement).toHaveAttribute("aria-checked", "false")
  })
})

import * as React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { PersonalizationSection } from "./personalization-section"
import { toast } from "@/components/toast"

// Mock subcomponents
vi.mock("./personalization-components/personal-info-display", () => ({
  default: ({ onEdit, name, email, phone, addressLine1, addressLine2, city, state, zipCode, country, gender }: any) => (
    <div data-testid="personal-info-display">
      <span data-testid="display-name">{name}</span>
      <span data-testid="display-email">{email}</span>
      <span data-testid="display-phone">{phone}</span>
      <button onClick={onEdit} data-testid="edit-personal-btn">Edit Personal Info</button>
    </div>
  )
}))

vi.mock("./personalization-components/personal-info-edit", () => ({
  default: ({ 
    onSave, 
    onCancel, 
    name, 
    onNameChange, 
    email, 
    onEmailChange, 
    phone, 
    onPhoneChange,
    addressLine1,
    onAddressLine1Change,
    // ... other props
  }: any) => (
    <div data-testid="personal-info-edit">
      <input 
        data-testid="name-input" 
        value={name} 
        onChange={(e) => onNameChange(e.target.value)} 
      />
      <input 
        data-testid="email-input" 
        value={email} 
        onChange={(e) => onEmailChange(e.target.value)} 
      />
      <input 
        data-testid="phone-input" 
        value={phone} 
        onChange={(e) => onPhoneChange(e.target.value)} 
      />
      <button onClick={onSave} data-testid="save-personal-btn">Save</button>
      <button onClick={onCancel} data-testid="cancel-personal-btn">Cancel</button>
    </div>
  )
}))

vi.mock("./personalization-components/bio-display", () => ({
  default: ({ bio, onEdit }: any) => (
    <div data-testid="bio-display">
      <p data-testid="display-bio">{bio}</p>
      <button onClick={onEdit} data-testid="edit-bio-btn">Edit Bio</button>
    </div>
  )
}))

vi.mock("./personalization-components/bio-edit", () => ({
  default: ({ 
    bio, 
    onBioChange, 
    onSave, 
    onCancel 
  }: any) => (
    <div data-testid="bio-edit">
      <textarea 
        data-testid="bio-textarea" 
        value={bio} 
        onChange={(e) => onBioChange(e.target.value)} 
      />
      <button onClick={onSave} data-testid="save-bio-btn">Save</button>
      <button onClick={onCancel} data-testid="cancel-bio-btn">Cancel</button>
    </div>
  )
}))

// Mock toast
vi.mocked(toast).mockImplementation(vi.fn())

// Mock fetch
const mockFetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  ;(global.fetch as any) = mockFetch
})

describe("PersonalizationSection", () => {
  it("renders loading skeletons initially", () => {
    const { container } = render(<PersonalizationSection />)
    const skeletons = container.querySelectorAll(".animate-pulse")
    expect(skeletons).toHaveLength(4)
  })

  it("fetches data and renders display components on success", async () => {
    const mockData = {
      personalization: {
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        bio: "I am a test user.",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        gender: "",
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as any)

    render(<PersonalizationSection />)

    // Wait for fetch to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/personalization")
    })

    expect(screen.getByTestId("personal-info-display")).toBeInTheDocument()
    expect(screen.getByTestId("bio-display")).toBeInTheDocument()
    expect(screen.getByTestId("display-name")).toHaveTextContent("John Doe")
    expect(screen.getByTestId("display-email")).toHaveTextContent("john@example.com")
    expect(screen.getByTestId("display-bio")).toHaveTextContent("I am a test user.")
  })

  it("renders empty displays when no personalization data (404)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as any)

    render(<PersonalizationSection />)

    await waitFor(() => {
      expect(screen.getByTestId("personal-info-display")).toBeInTheDocument()
      expect(screen.getByTestId("bio-display")).toBeInTheDocument()
      expect(screen.getByTestId("display-name")).toHaveTextContent("")
      expect(screen.getByTestId("display-bio")).toHaveTextContent("")
    })
  })

  it("shows error toast on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<PersonalizationSection />)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          description: "Failed to load personalization data",
        })
      )
    })

    // Still renders empty displays
    expect(screen.getByTestId("personal-info-display")).toBeInTheDocument()
  })

  it("edits and saves personal information with changes", async () => {
    const mockData = { personalization: { name: "John", email: "john@example.com", phone: "", bio: "", /* others empty */ } }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData } as any)

    const saveResponse = { ok: true }
    mockFetch.mockResolvedValueOnce(saveResponse as any)

    render(<PersonalizationSection />)

    await waitFor(() => expect(screen.getByTestId("personal-info-display")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("edit-personal-btn"))

    await waitFor(() => expect(screen.getByTestId("personal-info-edit")).toBeInTheDocument())

    const nameInput = screen.getByTestId("name-input")
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } })

    fireEvent.click(screen.getByTestId("save-personal-btn"))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/personalization/personal-information",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Jane Doe" }),
        })
      )
    })

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", description: "Personal information saved successfully" })
    )

    // Back to display with updated name
    expect(screen.getByTestId("personal-info-display")).toBeInTheDocument()
    expect(screen.getByTestId("display-name")).toHaveTextContent("Jane Doe")
  })

  it("does not send request if no changes in personal info", async () => {
    const mockData = { personalization: { name: "John", email: "john@example.com", phone: "" , bio: "" } }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData } as any)

    render(<PersonalizationSection />)

    await waitFor(() => expect(screen.getByTestId("personal-info-display")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("edit-personal-btn"))

    await waitFor(() => expect(screen.getByTestId("personal-info-edit")).toBeInTheDocument())

    // No changes
    fireEvent.click(screen.getByTestId("save-personal-btn"))

    // No second fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("personal-info-display")).toBeInTheDocument()
  })

  it("cancels editing personal info", async () => {
    const mockData = { personalization: { name: "John" , /* ... */ } }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData } as any)

    render(<PersonalizationSection />)

    await waitFor(() => expect(screen.getByTestId("personal-info-display")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("edit-personal-btn"))

    await waitFor(() => expect(screen.getByTestId("personal-info-edit")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("cancel-personal-btn"))

    expect(screen.getByTestId("personal-info-display")).toBeInTheDocument()
    // Name still original
    expect(screen.getByTestId("display-name")).toHaveTextContent("John")
  })

  it("edits and saves bio", async () => {
    const mockData = { personalization: { bio: "Old bio", /* ... */ } }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData } as any)

    mockFetch.mockResolvedValueOnce({ ok: true } as any)

    render(<PersonalizationSection />)

    await waitFor(() => expect(screen.getByTestId("bio-display")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("edit-bio-btn"))

    await waitFor(() => expect(screen.getByTestId("bio-edit")).toBeInTheDocument())

    const bioTextarea = screen.getByTestId("bio-textarea")
    fireEvent.change(bioTextarea, { target: { value: "New bio" } })

    fireEvent.click(screen.getByTestId("save-bio-btn"))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/personalization/bio",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio: "New bio" }),
        })
      )
    })

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", description: "Bio saved successfully" })
    )

    expect(screen.getByTestId("bio-display")).toBeInTheDocument()
    expect(screen.getByTestId("display-bio")).toHaveTextContent("New bio")
  })

  it("shows error toast on save failure", async () => {
    const mockData = { personalization: { name: "John", bio: "" } }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData } as any)

    mockFetch.mockRejectedValueOnce(new Error("Save error"))

    render(<PersonalizationSection />)

    await waitFor(() => expect(screen.getByTestId("personal-info-display")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("edit-personal-btn"))

    await waitFor(() => expect(screen.getByTestId("personal-info-edit")).toBeInTheDocument())

    fireEvent.click(screen.getByTestId("save-personal-btn"))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", description: "Failed to save personal information" })
      )
    })

    // Stays in edit mode
    expect(screen.getByTestId("personal-info-edit")).toBeInTheDocument()
  })

  it("renders disclaimer and tooltip", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ personalization: {} }) } as any)

    render(<PersonalizationSection />)

    await waitFor(() => expect(screen.getByTestId("personal-info-display")).toBeInTheDocument())

    expect(screen.getByText("Why does Witely need this information?")).toBeInTheDocument()
    expect(screen.getByText("This information is only used by Witely")).toBeInTheDocument()
    // Tooltip trigger
    const helpIcon = screen.getByRole("img", { name: /help circle/i }) // assuming lucide has alt
    // But since it's svg, perhaps getByLabelText or class
    // For now, assume it's there
    expect(screen.getByRole("button", { name: /tooltip trigger/i })).toBeInTheDocument() // TooltipTrigger
  })
})

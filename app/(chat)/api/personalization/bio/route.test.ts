import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import type { NextRequest } from 'next/server'
import * as authModule from '@/app/(auth)/auth'
import * as dbQueries from '@/lib/db/queries'

const mockAuth = vi.spyOn(authModule, 'auth')
const mockGetUser = vi.spyOn(dbQueries, 'getUser')
const mockUpdateBio = vi.spyOn(dbQueries, 'updateBioByUserId')

describe('POST /api/personalization/bio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if unauthorized', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const request = new Request('http://localhost/api/personalization/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'test' })
    })

    const response = await POST(request as NextRequest)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('should return 404 if user not found', async () => {
    mockAuth.mockResolvedValueOnce({ user: { email: 'test@example.com' } })
    mockGetUser.mockResolvedValueOnce([])

    const request = new Request('http://localhost/api/personalization/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'test' })
    })

    const response = await POST(request as NextRequest)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'User not found' })
  })

  it('should return 500 if bio validation fails', async () => {
    mockAuth.mockResolvedValueOnce({ user: { email: 'test@example.com' } })
    mockGetUser.mockResolvedValueOnce([{ id: '1' }])

    const request = new Request('http://localhost/api/personalization/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'a'.repeat(501) }) // too long
    })

    const response = await POST(request as NextRequest)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to post user bio' })
  })

  it('should update bio successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    mockAuth.mockResolvedValueOnce({ user: mockUser })
    mockGetUser.mockResolvedValueOnce([mockUser])
    mockUpdateBio.mockResolvedValueOnce(undefined)

    const request = new Request('http://localhost/api/personalization/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'My bio' })
    })

    const response = await POST(request as NextRequest)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(mockUpdateBio).toHaveBeenCalledWith({ userId: '1', bio: 'My bio' })
  })

  it('should return 500 if update fails', async () => {
    mockAuth.mockResolvedValueOnce({ user: { email: 'test@example.com' } })
    mockGetUser.mockResolvedValueOnce([{ id: '1' }])
    const error = new Error('DB error')
    mockUpdateBio.mockRejectedValueOnce(error)

    const request = new Request('http://localhost/api/personalization/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'test' })
    })

    const response = await POST(request as NextRequest)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to post user bio' })
  })
})

import { describe, it, expect } from 'vitest'

import { settingsSections } from './settings-data'

describe('settings-data', () => {
  it('should have 7 sections', () => {
    expect(settingsSections.length).toBe(7)
  })

  it('should have general section', () => {
    const general = settingsSections.find(s => s.id === 'general')
    expect(general).toBeDefined()
    expect(general?.label).toBe('General')
  })

  it('should have notifications section', () => {
    const notifications = settingsSections.find(s => s.id === 'notifications')
    expect(notifications).toBeDefined()
    expect(notifications?.label).toBe('Notifications')
  })

  it('should have personalization section', () => {
    const personalization = settingsSections.find(s => s.id === 'personalization')
    expect(personalization).toBeDefined()
    expect(personalization?.label).toBe('Personalization')
  })

  it('should have integrations section', () => {
    const integrations = settingsSections.find(s => s.id === 'integrations')
    expect(integrations).toBeDefined()
    expect(integrations?.label).toBe('Integrations')
    expect(integrations?.isExternal).toBe(true)
    expect(integrations?.externalPath).toBe('/integrations')
  })

  it('should have data-control section', () => {
    const dataControl = settingsSections.find(s => s.id === 'data-control')
    expect(dataControl).toBeDefined()
    expect(dataControl?.label).toBe('Data controls')
    expect(dataControl?.isExternal).toBe(true)
    expect(dataControl?.externalPath).toBe('/data-control')
  })

  it('should have security section', () => {
    const security = settingsSections.find(s => s.id === 'security')
    expect(security).toBeDefined()
    expect(security?.label).toBe('Security')
  })

  it('should have account section', () => {
    const account = settingsSections.find(s => s.id === 'account')
    expect(account).toBeDefined()
    expect(account?.label).toBe('Account')
  })
})

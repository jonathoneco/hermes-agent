import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { $activeGatewayProfile } from '@/store/profile'
import { $connection } from '@/store/session'

import fixture from '../../shared/fixtures/local-theme.json'
import { parseLocalTheme } from '../../shared/local-theme'

import { __resetBackendSkinSync, ingestBackendSkin } from './backend-sync'
import { ThemeProvider, useTheme } from './context'
import {
  $localFollowing,
  $localTheme,
  dropLocalFollowing,
  migrateLocalFollowing,
  setLocalFollowing
} from './local-theme'
import { persistAccent } from './persist-accent'
import { requestMode } from './request'

let appearance: ReturnType<typeof useTheme>

function Probe() {
  appearance = useTheme()

  return null
}

const css = (key: string) => window.document.documentElement.style.getPropertyValue(key)

const publish = (background = '#272e33', mode: 'dark' | 'light' | 'system' = 'dark') => {
  const dark = { ...fixture.theme.darkColors, background }
  $localTheme.set({ kind: 'ready', document: parseLocalTheme({ ...fixture, mode,
    theme: { ...fixture.theme,
      colors: mode === 'dark' ? dark : fixture.theme.colors,
      darkColors: mode === 'light' ? fixture.theme.colors : dark,
      terminal: mode === 'dark' ? fixture.theme.darkTerminal : fixture.theme.terminal,
      darkTerminal: mode === 'light' ? fixture.theme.terminal : fixture.theme.darkTerminal }
  }) })
}

beforeEach(() => {
  window.localStorage.clear()
  $localFollowing.set({})
  $localTheme.set({ kind: 'absent' })
  $activeGatewayProfile.set('default')
  $connection.set({ baseUrl: '', isFullscreen: false, nativeOverlayWidth: 0,
    windowButtonPosition: null, token: '', wsUrl: '', logs: [] })
  __resetBackendSkinSync()
})
afterEach(cleanup)

it('previews same-name updates and restores the manual appearance on absent or invalid input', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  )
  act(() => appearance.setTheme('mono'))
  const baseline = css('--theme-background-seed')
  act(() => {
    appearance.setFollowingLocal(true)
    publish()
  })
  expect(css('--theme-background-seed')).toBe('#272e33')
  expect(css('--theme-primary')).toBe('#a7c080')
  expect(appearance.mode).toBe('dark')
  expect(appearance.theme.darkTerminal?.red).toBe('#e67e80')
  act(() => publish('#112233'))
  expect(css('--theme-background-seed')).toBe('#112233')
  act(() => $localTheme.set({ kind: 'invalid', message: 'Invalid original bytes' }))
  expect(css('--theme-background-seed')).toBe(baseline)
  expect(appearance.localThemeError).toBe('Invalid original bytes')
  act(() => $localTheme.set({ kind: 'absent' }))
  expect(css('--theme-background-seed')).toBe(baseline)
})

it('a manual choice stops following; backend events keep the explicit follow choice', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  )
  act(() => {
    appearance.setFollowingLocal(true)
    publish()
  })
  act(() =>
    ingestBackendSkin(
      { name: 'remote', colors: { background: '#000000', ui_text: '#ffffff', ui_accent: '#ff8000' } },
      { apply: true }
    )
  )
  expect(css('--theme-background-seed')).toBe('#272e33')
  expect(appearance.followingLocal).toBe(true)
  act(() => appearance.setTheme('mono'))
  expect(appearance.followingLocal).toBe(false)
  act(() => publish('#112233'))
  expect(css('--theme-background-seed')).not.toBe('#112233')
  act(() => appearance.setFollowingLocal(true))
  act(() => appearance.setMode('light'))
  expect(appearance.followingLocal).toBe(false)
  expect(appearance.mode).toBe('light')
})

it('an in-app preview clears back to the followed theme; profiles retain separate follow choices', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  )
  act(() => {
    appearance.setFollowingLocal(true)
    publish()
  })
  act(() => appearance.previewTheme('mono', 'light'))
  expect(css('--theme-background-seed')).not.toBe('#272e33')
  act(() => appearance.clearThemePreview())
  expect(css('--theme-background-seed')).toBe('#272e33')
  act(() => $activeGatewayProfile.set('other'))
  expect(appearance.followingLocal).toBe(false)
  act(() => $activeGatewayProfile.set('default'))
  expect(css('--theme-background-seed')).toBe('#272e33')
})

it('migrates and drops profile follow preferences without assigning other profiles', () => {
  setLocalFollowing('before', true)
  migrateLocalFollowing('before', 'after')
  expect($localFollowing.get()).toEqual({ after: 'on' })
  dropLocalFollowing('after')
  expect($localFollowing.get()).toEqual({})
})

it('paints both native members of an adaptive pair and honors fixed light appearance', () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  )
  act(() => {
    appearance.setFollowingLocal(true)
    publish('#272e33', 'light')
  })
  expect(css('--theme-background-seed')).toBe('#fdf6e3')
  expect(appearance.renderedMode).toBe('light')
  expect(appearance.theme.terminal?.red).toBe('#f85552')
})

it('manual accent and imperative mode changes stop following and retain the displayed base palette', () => {
  render(<ThemeProvider><Probe /></ThemeProvider>)
  act(() => { appearance.setFollowingLocal(true); publish() })
  act(() => persistAccent('#ff0000'))
  expect(appearance.followingLocal).toBe(false)
  expect(css('--theme-background-seed')).toBe('#272e33')
  expect(css('--theme-primary')).toBe('#ff6a59')
  act(() => appearance.setFollowingLocal(true))
  act(() => requestMode('light'))
  expect(appearance.followingLocal).toBe(false)
  expect(appearance.mode).toBe('light')
})

import { atom } from 'nanostores'

import { persistStringRecord, storedStringRecord } from '@/lib/storage'

import type { LocalThemeState } from '../../shared/local-theme'

export const LOCAL_FOLLOW_KEY = 'hermes-desktop-profile-local-theme-v1'
export const $localTheme = atom<LocalThemeState>(
  typeof window === 'undefined' ? { kind: 'absent' } : (window.hermesDesktop?.localTheme?.get() ?? { kind: 'absent' })
)
export const $localFollowing = atom(storedStringRecord(LOCAL_FOLLOW_KEY))

export function setLocalFollowing(profile: string, enabled: boolean) {
  const next = { ...$localFollowing.get(), [profile]: enabled ? 'on' : 'off' }
  persistStringRecord(LOCAL_FOLLOW_KEY, next)
  $localFollowing.set(next)
}

export function dropLocalFollowing(profile: string) {
  const next = { ...$localFollowing.get() }
  delete next[profile]
  persistStringRecord(LOCAL_FOLLOW_KEY, next)
  $localFollowing.set(next)
}

export function migrateLocalFollowing(from: string, to: string) {
  const next = { ...$localFollowing.get() }

  if (next[from] === undefined) {
    return
  }

  next[to] = next[from]
  delete next[from]
  persistStringRecord(LOCAL_FOLLOW_KEY, next)
  $localFollowing.set(next)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key === null || event.key === LOCAL_FOLLOW_KEY) {
      $localFollowing.set(storedStringRecord(LOCAL_FOLLOW_KEY))
    }
  })
}

export function resolveLocalAppearance(state: LocalThemeState, following: boolean, systemDark: boolean) {
  if (!following || state.kind !== 'ready') {
    return null
  }

  const { mode, theme } = state.document
  const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode

  return {
    mode,
    resolvedMode,
    theme: { ...theme, colors: resolvedMode === 'dark' ? theme.darkColors : theme.colors }
  }
}

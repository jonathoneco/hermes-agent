import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, expect, it, vi } from 'vitest'

import fixture from '../shared/fixtures/local-theme.json'
import { parseLocalTheme } from '../shared/local-theme'

import { openLocalThemeSource } from './local-theme'

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) {
    cleanup()
  }
})

function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'local-theme-'))
  cleanups.push(() => fs.rmSync(directory, { recursive: true, force: true }))
  const file = path.join(directory, 'hermes-desktop/local-theme.json')
  const source = openLocalThemeSource(file)
  cleanups.push(source.dispose)

  const publish = (value: unknown) => {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file + '.pending', JSON.stringify(value))
    fs.renameSync(file + '.pending', file)
  }

  return { file, source, publish }
}

it('accepts the complete dotfiles native palette without synthesizing its inputs', () => {
  const result = parseLocalTheme(fixture)
  expect(result.mode).toBe('system')
  expect(result.theme.colors.background).toBe('#fdf6e3')
  expect(result.theme.colors.primary).toBe('#93b259')
  expect(result.theme.darkColors.background).toBe('#272e33')
  expect(result.theme.darkColors.primary).toBe('#a7c080')
  expect(result.theme.terminal.red).toBe('#f85552')
  expect(result.theme.darkTerminal.red).toBe('#e67e80')
})

it('detects directory creation and repeated atomic replacements with the same theme name', async () => {
  const { source, publish } = setup()
  expect(source.current).toEqual({ kind: 'absent' })
  publish(fixture)
  await vi.waitFor(() => expect(source.current.kind).toBe('ready'))
  publish({ ...fixture, theme: { ...fixture.theme, colors: { ...fixture.theme.colors, background: '#112233' } } })
  await vi.waitFor(() => {
    expect(source.current.kind).toBe('ready')

    if (source.current.kind === 'ready') {
      expect(source.current.document.theme.colors.background).toBe('#112233')
    }
  })
})

it('restoring invalid baseline bytes clears the valid preview instead of retaining it', async () => {
  const { source, publish, file } = setup()
  publish({ broken: true })
  await vi.waitFor(() => expect(source.current.kind).toBe('invalid'))
  publish(fixture)
  await vi.waitFor(() => expect(source.current.kind).toBe('ready'))
  fs.writeFileSync(file, ' original invalid bytes\n')
  await vi.waitFor(() => expect(source.current.kind).toBe('invalid'))
  fs.unlinkSync(file)
  await vi.waitFor(() => expect(source.current).toEqual({ kind: 'absent' }))
})

it.each([
  { ...fixture, theme: { ...fixture.theme, customCSS: 'body { display:none }' } },
  { ...fixture, theme: { ...fixture.theme, typography: { fontUrl: 'https://example.com' } } },
  { ...fixture, theme: { ...fixture.theme, darkTerminal: {} } },
  { ...fixture, theme: { ...fixture.theme, colors: { ...fixture.theme.colors, primary: 'url(secret)' } } },
  { ...fixture, version: 2 }
])('rejects capabilities and incomplete or invalid palettes', value => {
  expect(() => parseLocalTheme(value)).toThrow()
})

it('stops publishing after disposal', async () => {
  const { source, publish } = setup()
  const changed = vi.fn()
  source.subscribe(changed)
  publish(fixture)
  await vi.waitFor(() => expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({
    kind: 'ready', document: expect.objectContaining({ version: 1, mode: 'system' })
  })))
  source.dispose()
  publish({ ...fixture, mode: 'dark' })
  await new Promise(resolve => setTimeout(resolve, 100))
  expect(changed).toHaveBeenCalledTimes(1)
  expect(source.current).toMatchObject({ kind: 'ready', document: { mode: 'system' } })
})

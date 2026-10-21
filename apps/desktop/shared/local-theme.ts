import type { DesktopTerminalPalette, DesktopTheme, DesktopThemeColors } from '../src/themes/types'

export interface LocalThemeDocument {
  version: 1
  mode: 'light' | 'dark' | 'system'
  theme: DesktopTheme & {
    darkColors: DesktopThemeColors
    terminal: Required<DesktopTerminalPalette>
    darkTerminal: Required<DesktopTerminalPalette>
  }
}

export type LocalThemeState =
  { kind: 'absent' } | { kind: 'invalid'; message: string } | { kind: 'ready'; document: LocalThemeDocument }

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected an object')
  }

  return value as Record<string, unknown>
}

function keys(value: unknown, allowed: readonly string[]) {
  const record = object(value)

  if (Object.keys(record).some(key => !allowed.includes(key))) {
    throw new Error('Unknown local theme field')
  }

  return record
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.length || value.length > 256) {
    throw new Error('Invalid theme text')
  }

  return value
}

const color = (value: unknown): string => {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error('Expected a six-digit RGB color')
  }

  return value
}

function colors(value: unknown): Required<DesktopThemeColors> {
  const fields = [
    'background',
    'foreground',
    'card',
    'cardForeground',
    'muted',
    'mutedForeground',
    'popover',
    'popoverForeground',
    'primary',
    'primaryForeground',
    'secondary',
    'secondaryForeground',
    'accent',
    'accentForeground',
    'border',
    'input',
    'ring',
    'midground',
    'midgroundForeground',
    'composerRing',
    'destructive',
    'destructiveForeground',
    'sidebarBackground',
    'sidebarBorder',
    'userBubble',
    'userBubbleBorder'
  ] as const satisfies readonly (keyof DesktopThemeColors)[]

  const record = keys(value, fields)

  return Object.fromEntries(fields.map(key => [key, color(record[key])])) as Required<DesktopThemeColors>
}

function terminal(value: unknown): Required<DesktopTerminalPalette> {
  const fields = [
    'foreground',
    'cursor',
    'selectionBackground',
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite'
  ] as const satisfies readonly (keyof DesktopTerminalPalette)[]

  const record = keys(value, fields)

  return Object.fromEntries(fields.map(key => [key, color(record[key])])) as Required<DesktopTerminalPalette>
}

export function parseLocalTheme(value: unknown): LocalThemeDocument {
  const record = keys(value, ['version', 'mode', 'theme'])

  if (record.version !== 1) {
    throw new Error('Unsupported local theme version')
  }

  const theme = keys(record.theme, ['name', 'label', 'description', 'colors', 'darkColors', 'terminal', 'darkTerminal'])

  if (record.mode !== 'light' && record.mode !== 'dark' && record.mode !== 'system') {
    throw new Error('Invalid mode')
  }

  return {
    version: 1,
    mode: record.mode,
    theme: {
      name: text(theme.name),
      label: text(theme.label),
      description: text(theme.description),
      colors: colors(theme.colors),
      darkColors: colors(theme.darkColors),
      terminal: terminal(theme.terminal),
      darkTerminal: terminal(theme.darkTerminal)
    }
  }
}

import fs from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

import fixture from '../shared/fixtures/local-theme.json' with { type: 'json' }

import { buildAppEnv, createSandbox, launchDesktop } from './fixtures'

test('local palette paints offline, follows atomic preview updates, and restores manual on invalid baseline', async () => {
  const sandbox = createSandbox('local-theme')
  const config = path.join(sandbox.root, '.config')
  const file = path.join(config, 'hermes-desktop/local-theme.json')
  fs.mkdirSync(path.dirname(file), { recursive: true })

  const publish = (background: string) => {
    fs.writeFileSync(file + '.pending', JSON.stringify({ ...fixture, mode: 'dark',
      theme: { ...fixture.theme, darkColors: { ...fixture.theme.darkColors, background } } }))
    fs.renameSync(file + '.pending', file)
  }

  publish('#272e33')

  const { app, page } = await launchDesktop(buildAppEnv(sandbox, {
    XDG_CONFIG_HOME: config,
    HERMES_DESKTOP_BOOT_FAKE_ERROR: 'Offline theme check'
  }))

  try {
    await page.waitForFunction(() => window.document.documentElement.style.getPropertyValue('--theme-background-seed'))
    await page.evaluate(() => {
      window.localStorage.setItem('hermes-desktop-profile-local-theme-v1', JSON.stringify({ default: 'on' }))
    })
    await page.reload()
    const background = () => page.evaluate(() => window.document.documentElement.style.getPropertyValue('--theme-background-seed'))
    await expect.poll(background).toBe('#272e33')
    publish('#331122')
    await expect.poll(background).toBe('#331122')
    fs.writeFileSync(file + '.pending', ' original invalid bytes\n')
    fs.renameSync(file + '.pending', file)
    await expect.poll(background).not.toBe('#331122')
    publish('#272e33')
    await expect.poll(background).toBe('#272e33')
    fs.writeFileSync(file + '.pending', JSON.stringify(fixture))
    fs.renameSync(file + '.pending', file)
    await page.emulateMedia({ colorScheme: 'light' })
    await expect.poll(background).toBe('#fdf6e3')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect.poll(background).toBe('#272e33')
    await page.screenshot({ path: test.info().outputPath('local-theme.png') })
    fs.unlinkSync(file)
    await expect.poll(background).not.toBe('#272e33')
  } finally {
    await app.close()
    sandbox.cleanup()
  }
})

import { SegmentedControl } from '@/components/ui/segmented-control'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { useTheme } from '@/themes/context'

import { MODE_OPTIONS } from './constants'
import { ToggleRow } from './primitives'

export function LocalThemeFollowSetting() {
  const { t } = useI18n()
  const { followingLocal, setFollowingLocal, localThemeStatus, localThemeError } = useTheme()
  const a = t.settings.appearance

  return <ToggleRow checked={followingLocal} description={localThemeError ?? (localThemeStatus === 'absent' ? a.localThemeMissing : a.followLocalThemeDesc)}
    label={a.followLocalTheme}
    onChange={setFollowingLocal} />
}

export function AppearanceThemeModeControl() {
  const { t } = useI18n()
  const { mode, setMode } = useTheme()
  const options = MODE_OPTIONS.map(({ id, icon }) => ({ icon, id, label: t.settings.modeOptions[id].label }))

  return <SegmentedControl onChange={id => {
    triggerHaptic('crisp')
    setMode(id)
  }} options={options} value={mode} />
}

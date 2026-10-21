export type AppearanceThemeCopy = {
  themeTitle: string
  themeDesc: string
  themeProfileNote: (profile: string) => string
  followLocalTheme: string
  followLocalThemeDesc: string
  localThemeMissing: string
}

export const appearanceThemeCopy = {
  'en': {
    themeTitle: 'Theme',
    themeDesc: 'Desktop palettes only. The selected mode is applied on top.',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `Saved for the ${profile} profile — each profile keeps its own theme.`,
  },
  'de': {
    themeTitle: 'Theme',
    themeDesc: 'Nur Desktop-Paletten. Der gewählte Modus wird oben drauf angewendet.',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `Für das Profil ${profile} gespeichert — jedes Profil behält sein eigenes Theme.`,
  },
  'es': {
    themeTitle: 'Tema',
    themeDesc: 'Paletas solo para escritorio. Se aplican sobre el modo seleccionado.',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `Guardado para el perfil ${profile}; cada perfil conserva su propio tema.`,
  },
  'fr': {
    themeTitle: 'Thème',
    themeDesc: "Palettes desktop uniquement. Le mode sélectionné s'applique par-dessus.",
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `Enregistré pour le profil ${profile} — chaque profil conserve son propre thème.`,
  },
  'ja': {
    themeTitle: 'テーマ',
    themeDesc: 'デスクトップ専用のパレットです。選択したモードの上に適用されます。',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile =>
      `「${profile}」プロファイルに保存されます。プロファイルごとに個別のテーマを保持します。`,
  },
  'ru': {
    themeTitle: 'Тема',
    themeDesc: 'Только палитры для приложения. Выбранный режим применяется поверх.',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `Сохранено для профиля ${profile} — у каждого профиля своя тема.`,
  },
  'zh': {
    themeTitle: '主题',
    themeDesc: '仅桌面端调色板。所选模式叠加其上。',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `已为「${profile}」配置文件保存——每个配置文件保留各自的主题。`,
  },
  'ar': {
    themeTitle: 'الثيم',
    themeDesc: 'اختر ثيم سطح المكتب.',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `سيطبق هذا الثيم على الملف الشخصي ${profile}.`,
  },
  'zh-hant': {
    themeTitle: '主題',
    themeDesc: '僅限桌面端的調色盤。所選模式會套用在其上。',
    followLocalTheme: 'Follow local theme',
    followLocalThemeDesc: 'Use the theme from the local picker for this profile. A manual theme or mode choice stops following.',
    localThemeMissing: 'No local theme is available. Your saved theme stays active.',
    themeProfileNote: profile => `已為「${profile}」設定檔儲存——每個設定檔保留各自的主題。`,
  },
} satisfies Record<string, AppearanceThemeCopy>

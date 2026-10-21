import { dropLocalFollowing, migrateLocalFollowing } from '@/themes/local-theme'

import { dropStatusDrawersForProfile, migrateStatusDrawersForProfile } from './composer-status-drawer'
import { migratePreviewTabsForProfile } from './preview'
import { dropPreviewArtifactsForProfile, migratePreviewArtifactsForProfile } from './preview-status'

export function dropPresentationForProfile(profile: string, route?: Parameters<typeof dropPreviewArtifactsForProfile>[1]) {
  if (!route?.connectionId?.trim() || route.connectionId.trim() === 'local') {
    dropLocalFollowing(profile)
  }

  dropPreviewArtifactsForProfile(profile, route)
  dropStatusDrawersForProfile(profile, route)
}

export function migratePresentationForProfile(from: string, to: string) {
  migrateLocalFollowing(from, to)
  migratePreviewArtifactsForProfile(from, to)
  migrateStatusDrawersForProfile(from, to)
  migratePreviewTabsForProfile(from, to)
}


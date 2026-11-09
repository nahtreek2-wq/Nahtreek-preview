// NAHTREEK multi-app configuration.
// The same monorepo ships three apps (client, engineer, service provider).
// They share @nahtreek/design-system and @nahtreek/types; each app sets its
// variant here so role-specific logic (auth role, home tabs, actions) can
// branch without duplicating the codebase.
export type AppVariant = 'client' | 'engineer' | 'provider';

export const APP_VARIANT: AppVariant = 'client';

export const APP_ROLE = 'CLIENT' as const;

export const APP_NAME =
  APP_VARIANT === 'client'
    ? 'NAHTREEK Client'
    : APP_VARIANT === 'engineer'
      ? 'NAHTREEK Engineer'
      : 'NAHTREEK Services';

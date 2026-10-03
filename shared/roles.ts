export const USER_ROLES = [
  'super_admin',
  'admin',
  'moderator',
  'editor',
  'member',
  'guest',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const PERMISSIONS = {
  admin: ['read', 'write', 'moderate'] as const,
  moderator: ['read', 'moderate'] as const,
  editor: ['read', 'write'] as const,
  member: ['read'] as const,
  guest: [] as const,
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS][number];

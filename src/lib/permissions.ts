/**
 * Centralized Permission Engine (RBAC)
 * Peace & Hope SDA Platform
 */

export type UserRole =
  | 'super_admin'
  | 'church_admin'
  | 'pastor'
  | 'elder'
  | 'department_leader'
  | 'teacher'
  | 'member'
  | 'guest';

export type PermissionAction =
  | 'send_message'
  | 'edit_message'
  | 'delete_own_message'
  | 'delete_any_message'
  | 'pin_message'
  | 'create_room'
  | 'manage_room'
  | 'invite_member'
  | 'remove_member'
  | 'start_meeting'
  | 'record_meeting'
  | 'publish_sermon'
  | 'start_livestream'
  | 'end_livestream'
  | 'push_overlay'
  | 'make_announcement'
  | 'manage_prayer'
  | 'moderate_chat'
  | 'broadcast_channel_post';

const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 100,
  church_admin: 90,
  pastor: 80,
  elder: 70,
  department_leader: 60,
  teacher: 50,
  member: 20,
  guest: 0,
};

export interface UserPermissionContext {
  id?: string;
  role?: UserRole | string;
  isSuperAdmin?: boolean;
}

export function normalizeRole(roleString?: string | null): UserRole {
  if (!roleString) return 'guest';
  const clean = roleString.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (clean.includes('super')) return 'super_admin';
  if (clean.includes('admin')) return 'church_admin';
  if (clean.includes('pastor')) return 'pastor';
  if (clean.includes('elder')) return 'elder';
  if (clean.includes('leader') || clean.includes('director')) return 'department_leader';
  if (clean.includes('teacher') || clean.includes('instructor')) return 'teacher';
  if (clean.includes('member')) return 'member';
  return 'guest';
}

export function hasRoleAtLeast(userRole: UserRole | string | undefined, requiredRole: UserRole): boolean {
  const norm = normalizeRole(userRole);
  return ROLE_RANK[norm] >= ROLE_RANK[requiredRole];
}

/**
 * can(user, action, resource)
 * Evaluates whether the user has permission to perform an action on a target resource.
 */
export function can(
  user: UserPermissionContext | null | undefined,
  action: PermissionAction,
  resource?: { ownerId?: string; roomType?: string; isPrivate?: boolean }
): boolean {
  if (!user) {
    // Unauthenticated guest can only perform read actions
    return false;
  }

  const role = normalizeRole(user.role);

  // Super admin can do everything
  if (role === 'super_admin' || user.isSuperAdmin) {
    return true;
  }

  switch (action) {
    case 'broadcast_channel_post':
      // Only pastoral and administrative roles can post in broadcast channels
      return hasRoleAtLeast(role, 'elder');

    case 'start_livestream':
    case 'end_livestream':
    case 'push_overlay':
      return hasRoleAtLeast(role, 'pastor');

    case 'publish_sermon':
      return hasRoleAtLeast(role, 'pastor');

    case 'make_announcement':
      return hasRoleAtLeast(role, 'department_leader');

    case 'manage_prayer':
      return hasRoleAtLeast(role, 'elder');

    case 'moderate_chat':
    case 'delete_any_message':
      return hasRoleAtLeast(role, 'elder');

    case 'create_room':
      return hasRoleAtLeast(role, 'member');

    case 'manage_room':
      if (resource?.ownerId && resource.ownerId === user.id) return true;
      return hasRoleAtLeast(role, 'elder');

    case 'pin_message':
      return hasRoleAtLeast(role, 'department_leader');

    case 'record_meeting':
      return hasRoleAtLeast(role, 'elder');

    case 'start_meeting':
      return hasRoleAtLeast(role, 'member');

    case 'send_message':
      if (resource?.roomType === 'broadcast') {
        return hasRoleAtLeast(role, 'elder');
      }
      return hasRoleAtLeast(role, 'member');

    case 'edit_message':
    case 'delete_own_message':
      if (resource?.ownerId && resource.ownerId === user.id) return true;
      return hasRoleAtLeast(role, 'elder');

    case 'invite_member':
      return hasRoleAtLeast(role, 'member');

    case 'remove_member':
      return hasRoleAtLeast(role, 'elder');

    default:
      return false;
  }
}

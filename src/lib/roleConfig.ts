/**
 * Shared role configuration used across Onboarding and Admin Management.
 *
 * - SYSTEM_ROLES: all roles the backend recognises
 * - ADMIN_ROLES: roles that grant administrative access
 * - ASSIGNABLE_ROLES: which roles a given role may assign
 * - rolesByType: industry-specific job titles per organisation type
 */

export type OrganizationType =
  | 'church'
  | 'corporate'
  | 'school'
  | 'hospital'
  | 'government'
  | 'nonprofit'
  | 'other';

export const SYSTEM_ROLES = ['super_admin', 'admin', 'manager', 'member', 'pending'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const ADMIN_ROLES: SystemRole[] = ['super_admin', 'admin', 'manager'];

/** Maps a role to the roles it is allowed to assign when inviting. */
export const ASSIGNABLE_ROLES: Record<string, SystemRole[]> = {
  super_admin: ['admin', 'manager'],
  admin: ['manager'],
};

/** Human-friendly labels for system roles */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  pending: 'Pending',
};

/** Industry-specific job titles shown during onboarding & admin invitation */
export const rolesByType: Record<OrganizationType, string[]> = {
  church: ['Parish Pastor', 'Associate Pastor', 'Church Admin', 'Secretary', 'Head Usher'],
  corporate: ['CEO', 'HR Manager', 'Department Head', 'Office Manager', 'Admin'],
  school: ['Principal', 'Vice Principal', 'Admin Officer', 'Head Teacher', 'Registrar'],
  hospital: ['Medical Director', 'HR Manager', 'Department Head', 'Admin Officer', 'Shift Supervisor'],
  government: ['Department Head', 'HR Director', 'Admin Officer', 'Unit Supervisor', 'Records Officer'],
  nonprofit: ['Executive Director', 'Program Manager', 'Volunteer Coordinator', 'Admin', 'Office Manager'],
  other: ['Administrator', 'Manager', 'Supervisor', 'Coordinator', 'Other'],
};

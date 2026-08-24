/**
 * Application-wide constants.
 * Single source of truth for enums, workflow rules, and configuration values.
 */

// ─── User Roles ────────────────────────────────────────
const ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
};

const ALL_ROLES = Object.values(ROLES);

// ─── Report Statuses ───────────────────────────────────
const REPORT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const ALL_STATUSES = Object.values(REPORT_STATUS);

/**
 * Valid status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
const STATUS_TRANSITIONS = {
  [REPORT_STATUS.PENDING]: [REPORT_STATUS.UNDER_REVIEW],
  [REPORT_STATUS.UNDER_REVIEW]: [REPORT_STATUS.ASSIGNED, REPORT_STATUS.CLOSED],
  [REPORT_STATUS.ASSIGNED]: [REPORT_STATUS.IN_PROGRESS, REPORT_STATUS.UNDER_REVIEW],
  [REPORT_STATUS.IN_PROGRESS]: [REPORT_STATUS.RESOLVED, REPORT_STATUS.UNDER_REVIEW],
  [REPORT_STATUS.RESOLVED]: [REPORT_STATUS.CLOSED, REPORT_STATUS.UNDER_REVIEW],
  [REPORT_STATUS.CLOSED]: [],
};

// ─── Report Priority ───────────────────────────────────
const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const ALL_PRIORITIES = Object.values(PRIORITY);

// ─── Report Categories (slugs — must match seeder) ─────
const CATEGORIES = [
  'pothole',
  'broken_streetlight',
  'water_leak',
  'garbage',
  'damaged_sidewalk',
  'sewage',
  'traffic_sign',
  'other',
];

// ─── Image Upload ──────────────────────────────────────
const IMAGE = {
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_IMAGES_PER_REPORT: 4,
};

// ─── Pagination ────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// ─── Resolution Feedback ───────────────────────────────
const RESOLUTION_FEEDBACK = {
  MIN_FEEDBACK_COUNT: 3,
  NEGATIVE_RATIO_THRESHOLD: 0.4,
};

// ─── Audit Log Actions ─────────────────────────────────
const AUDIT_ACTIONS = {
  // Auth
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_CHANGED: 'password_changed',
  ACCOUNT_DELETED: 'account_deleted',

  // Reports
  REPORT_CREATED: 'report_created',
  REPORT_UPDATED: 'report_updated',
  REPORT_DELETED: 'report_deleted',
  REPORT_STATUS_CHANGED: 'report_status_changed',
  REPORT_ASSIGNED: 'report_assigned',

  // Admin
  ROLE_CHANGED: 'role_changed',
  FORCED_LOGOUT: 'forced_logout',
};

// ─── Notification Types ────────────────────────────────
const NOTIFICATION_TYPES = {
  REPORT_CREATED: 'report_created',
  STATUS_CHANGE: 'status_change',
  REPORT_ASSIGNED: 'report_assigned',
  REPORT_RESOLVED: 'report_resolved',
  FEEDBACK_REQUEST: 'feedback_request',
};

module.exports = {
  ROLES,
  ALL_ROLES,
  REPORT_STATUS,
  ALL_STATUSES,
  STATUS_TRANSITIONS,
  PRIORITY,
  ALL_PRIORITIES,
  CATEGORIES,
  IMAGE,
  PAGINATION,
  RESOLUTION_FEEDBACK,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES,
};

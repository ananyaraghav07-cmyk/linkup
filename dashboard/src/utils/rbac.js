/**
 * LifeLink Twin - Role-Based Access Control (RBAC)
 * 
 * Doctor-only view.
 */

// Role definitions
export const ROLES = {
    DOCTOR: 'doctor'
};

// Menu items accessible by doctor
export const MEDICAL_MENU_ITEMS = [
    'dashboard',
    'vitals',
    'patient',
    'alerts',
    'history',
    'reports'
];

// Dashboard cards for doctor
export const MEDICAL_DASHBOARD_SECTIONS = [
    'multiPatient',
    'heartRate',
    'spo2',
    'temperature',
    'status',
    'predictiveHealth',
    'hospitalReadiness',
    'ambulanceTracker',
    'patientLog',
    'aiExplanation',
    'handoverReport',
    'emergencyEscalation',
    'digitalTwin'
];

/**
 * Check if user is doctor
 */
export const isMedicalRole = (role) => {
    return role === ROLES.DOCTOR;
};

/**
 * Get allowed menu items for a role
 */
export const getAllowedMenuItems = (role) => {
    return MEDICAL_MENU_ITEMS;
};

/**
 * Check if a specific menu item is allowed for a role
 */
export const isMenuItemAllowed = (role, menuItemId) => {
    // Dividers are always allowed
    if (menuItemId.startsWith('divider')) {
        return true;
    }

    const allowedItems = getAllowedMenuItems(role);
    return allowedItems.includes(menuItemId);
};

/**
 * Check if user can see medical/patient data
 */
export const canViewPatientData = (role) => {
    return isMedicalRole(role);
};

/**
 * Check if user can see technical/system data
 */
export const canViewSystemData = (role) => {
    return false;
};

/**
 * Get dashboard sections visible to role
 */
export const getVisibleDashboardSections = (role) => {
    return MEDICAL_DASHBOARD_SECTIONS;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
    switch (role) {
        case ROLES.DOCTOR:
            return 'Doctor';
        default:
            return 'Doctor';
    }
};

/**
 * Get role icon
 */
export const getRoleIcon = (role) => {
    switch (role) {
        case ROLES.DOCTOR:
            return '👨‍⚕️';
        default:
            return '👨‍⚕️';
    }
};

export default {
    ROLES,
    isMedicalRole,
    getAllowedMenuItems,
    isMenuItemAllowed,
    canViewPatientData,
    canViewSystemData,
    getVisibleDashboardSections,
    getRoleDisplayName,
    getRoleIcon
};

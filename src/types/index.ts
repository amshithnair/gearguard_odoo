export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'maintenance' | 'retired';
export type RequestStatus = 'new' | 'in_progress' | 'pending_parts' | 'completed' | 'canceled';
export type UserRole = 'admin' | 'technician' | 'viewer';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    avatar: string;
    role: UserRole;
    jobTitle?: string; // e.g. "Senior Mechanic"
}

export interface Team {
    id: string;
    name: string; // e.g. "Mechanics", "IT Support"
    description?: string;
    memberIds: string[]; // IDs of Users in this team
}

export interface Site {
    id: string;
    name: string;
    type: string; // e.g. "Textile Plant", "Assembly Plant"
    location: string;
}

export interface Area {
    id: string;
    siteId: string;
    name: string; // e.g. "Production Hall", "Weaving Shed"
}

export interface WorkCenter {
    id: string;
    areaId: string;
    name: string; // e.g. "Line 1", "CNC Station"
}

export interface TelemetryLog {
    id: string;
    equipmentId: string;
    parameter: string; // e.g. "Temperature", "Vibration"
    value: number;
    timestamp: string;
    isAnomaly: boolean;
}

export interface AutomationRule {
    id: string;
    equipmentId: string; // or 'all' or by category
    parameter: string; // "Temperature"
    condition: '>' | '<' | '==' | '>=' | '<=';
    threshold: number;
    triggerPriority: Priority;
    triggerTitle: string; // "Overheating Detected"
    triggerDescription: string; // "Telemetry > 80C. Auto-generated."
}

export interface EquipmentCategory {
    id: string;
    name: string;
    responsibleId?: string; // User ID
    company?: string;
}

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    category: string; // This might be the Category Name or ID. For simplicity let's keep it as string or map to ID
    categoryId?: string; // Linking to EquipmentCategory
    location: string;
    status: Status;
    healthScore: number;
    lastMaintenance: string | null;
    nextMaintenance: string | null;
    description: string;
    image?: string;
    model: string;
    manufacturer: string;
    // New Fields for Odoo-like tracking
    department?: string; // e.g. "Production"
    employeeId?: string; // Owner/Responsible - "Used By" / Employee
    technicianId?: string; // Technician
    teamId?: string;     // Maintenance Team
    purchaseDate?: string;
    warrantyExpiration?: string;
    scrapDate?: string | null;
    assignedDate?: string | null; // Assigned Date
    usedInLocation?: string; // Used in location
    workCenter?: string; // Work Center Name
    workCenterId?: string; // ISA-95 Link
    partnerId?: string; // Used By (Partner/Employee) - mapping to employeeId effectively

    // OEE Data
    oeeAvailability?: number; // 0-100
    oeePerformance?: number; // 0-100
    oeeQuality?: number; // 0-100
}

export interface MaintenanceRequest {
    id: string;
    equipmentId: string;
    requesterId: string;
    assigneeId?: string;
    title: string;
    description: string;
    priority: Priority;
    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
    scheduledDate?: string; // For calendar
    completionDate?: string;
    // New Fields
    type?: 'corrective' | 'preventive';
    duration?: number; // Hours spent
    teamId?: string; // Assigned Team
}

// Helper specific to Kanban that might be useful
export type KanbanColumn = {
    id: RequestStatus;
    title: string;
};

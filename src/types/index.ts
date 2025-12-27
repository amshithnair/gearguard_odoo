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

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    category: string;
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
    employeeId?: string; // Owner/Responsible
    teamId?: string;     // Default Maintenance Team
    purchaseDate?: string;
    warrantyExpiration?: string;
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

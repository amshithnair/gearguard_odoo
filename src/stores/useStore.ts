import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, MaintenanceRequest, User, RequestStatus, Team, EquipmentCategory, Site, Area, WorkCenter, TelemetryLog, AutomationRule } from '../types';
import { mockEquipment, mockRequests, mockUsers, mockTeams, mockCategories, mockSites, mockAreas, mockWorkCenters, mockRules } from '../lib/mockData';

interface AppState {
    teams: Team[];
    equipment: Equipment[];
    requests: MaintenanceRequest[];
    users: User[];
    categories: EquipmentCategory[];

    // IAM-95 / Demo State
    sites: Site[];
    areas: Area[];
    workCenters: WorkCenter[];
    rules: AutomationRule[];
    telemetryLogs: TelemetryLog[];
    activeSiteId: string; // 'all' or siteId

    currentUser: User | null;

    // Actions
    setActiveSite: (id: string) => void;
    addEquipment: (eq: Equipment) => void;
    updateEquipment: (id: string, updates: Partial<Equipment>) => void;
    deleteEquipment: (id: string) => void;

    addCategory: (cat: EquipmentCategory) => void;
    updateCategory: (id: string, updates: Partial<EquipmentCategory>) => void;
    deleteCategory: (id: string) => void;

    addRequest: (req: MaintenanceRequest) => void;
    updateRequest: (id: string, updates: Partial<MaintenanceRequest>) => void;
    deleteRequest: (id: string) => void;
    updateRequestStatus: (id: string, status: RequestStatus) => void;

    // Automation Logic
    processTelemetry: (equipmentId: string, parameter: string, value: number) => void;

    login: (email: string, password: string) => void; // throws Error on fail
    signup: (name: string, email: string, password: string) => void; // throws Error on fail
    logout: () => void;

    // Resetter for demo purposes
    resetStore: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            equipment: mockEquipment,
            requests: mockRequests,
            teams: mockTeams,
            users: mockUsers,
            categories: mockCategories,

            sites: mockSites,
            areas: mockAreas,
            workCenters: mockWorkCenters,
            rules: mockRules,
            telemetryLogs: [],
            activeSiteId: 'all',

            currentUser: null,

            setActiveSite: (id) => set({ activeSiteId: id }),

            addEquipment: (eq) => set((state) => ({ equipment: [...state.equipment, eq] })),
            updateEquipment: (id, updates) =>
                set((state) => ({
                    equipment: state.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
                })),
            deleteEquipment: (id) =>
                set((state) => ({
                    equipment: state.equipment.filter((e) => e.id !== id),
                })),

            addCategory: (cat) => set((state) => ({ categories: [...state.categories, cat] })),
            updateCategory: (id, updates) =>
                set((state) => ({
                    categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                })),
            deleteCategory: (id) =>
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                })),

            addRequest: (req) => set((state) => ({ requests: [...state.requests, req] })),
            updateRequest: (id, updates) =>
                set((state) => ({
                    requests: state.requests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
                })),
            deleteRequest: (id) =>
                set((state) => ({ requests: state.requests.filter((r) => r.id !== id) })),

            updateRequestStatus: (id, status) =>
                set((state) => ({
                    requests: state.requests.map((r) =>
                        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
                    ),
                })),

            processTelemetry: (equipmentId, parameter, value) => {
                const rules = get().rules.filter(r => r.equipmentId === equipmentId && r.parameter === parameter);
                let triggered = false;

                rules.forEach(rule => {
                    let violation = false;
                    switch (rule.condition) {
                        case '>': violation = value > rule.threshold; break;
                        case '<': violation = value < rule.threshold; break;
                        case '>=': violation = value >= rule.threshold; break;
                        case '<=': violation = value <= rule.threshold; break;
                        case '==': violation = value === rule.threshold; break;
                    }

                    if (violation) {
                        triggered = true;
                        // Auto-create Ticket
                        const newReq: MaintenanceRequest = {
                            id: `auto-${Date.now()}`,
                            equipmentId,
                            requesterId: 'system', // System generated
                            title: rule.triggerTitle,
                            description: `${rule.triggerDescription} [Reading: ${value}, Threshold: ${rule.threshold}]`,
                            priority: rule.triggerPriority,
                            status: 'new',
                            type: 'corrective',
                            teamId: 't4', // Assign to Mechanical Titans as per demo
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        get().addRequest(newReq);
                    }
                });

                // Log the entry
                const log: TelemetryLog = {
                    id: `log-${Date.now()}`,
                    equipmentId,
                    parameter,
                    value,
                    timestamp: new Date().toISOString(),
                    isAnomaly: triggered
                };

                set(state => ({ telemetryLogs: [log, ...state.telemetryLogs] }));
            },

            login: (email, password) => {
                const user = get().users.find((u) => u.email === email);
                if (!user) throw new Error('Account does not exist');
                if (user.password !== password) throw new Error('Invalid Password');

                set({ currentUser: user });
            },

            signup: (name, email, password) => {
                const existingUser = get().users.find((u) => u.email === email);
                if (existingUser) throw new Error('Email ID already exists');

                const newUser: User = {
                    id: `u${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    email,
                    password,
                    role: 'viewer',
                    avatar: `https://i.pravatar.cc/150?u=${email}`,
                };

                set((state) => ({
                    users: [...state.users, newUser],
                    currentUser: newUser
                }));
            },

            logout: () => set({ currentUser: null }),

            resetStore: () =>
                set({
                    equipment: mockEquipment,
                    requests: mockRequests,
                    teams: mockTeams,
                    users: mockUsers,
                    categories: mockCategories,
                    sites: mockSites,
                    areas: mockAreas,
                    workCenters: mockWorkCenters,
                    rules: mockRules,
                    telemetryLogs: [],
                    activeSiteId: 'all',
                    currentUser: null,
                }),
        }),
        {
            name: 'gearguard-storage',
        }
    )
);

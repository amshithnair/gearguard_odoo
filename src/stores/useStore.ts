import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, MaintenanceRequest, User, RequestStatus, Team } from '../types';
import { mockEquipment, mockRequests, mockUsers, mockTeams } from '../lib/mockData';

interface AppState {
    teams: Team[];
    equipment: Equipment[];
    requests: MaintenanceRequest[];
    users: User[];
    currentUser: User | null;

    // Actions
    addEquipment: (eq: Equipment) => void;
    updateEquipment: (id: string, updates: Partial<Equipment>) => void;
    deleteEquipment: (id: string) => void;

    addRequest: (req: MaintenanceRequest) => void;
    updateRequest: (id: string, updates: Partial<MaintenanceRequest>) => void;
    deleteRequest: (id: string) => void;
    updateRequestStatus: (id: string, status: RequestStatus) => void;

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
            currentUser: null, // Start logged out

            addEquipment: (eq) => set((state) => ({ equipment: [...state.equipment, eq] })),
            updateEquipment: (id, updates) =>
                set((state) => ({
                    equipment: state.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
                })),
            deleteEquipment: (id) =>
                set((state) => ({
                    equipment: state.equipment.filter((e) => e.id !== id),
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

            login: (email, password) => {
                const user = get().users.find((u) => u.email === email);
                if (!user) throw new Error('Account does not exist');
                if (user.password !== password) throw new Error('Invalid Password');

                set({ currentUser: user });
            },

            signup: (name, email, password) => {
                const existingUser = get().users.find((u) => u.email === email);
                if (existingUser) throw new Error('Email ID already exists');

                // Password validation logic handled in UI, but store acts as final gate if needed
                // For now, assume UI handles strict regex

                const newUser: User = {
                    id: `u${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    email,
                    password,
                    role: 'viewer', // Default role for new signups per prompt (portal user? assume viewer/basic)
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
                    currentUser: null,
                }),
        }),
        {
            name: 'gearguard-storage',
        }
    )
);

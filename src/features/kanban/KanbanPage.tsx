import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useDbQuery } from '../../hooks/use-db-query';
import { db } from '../../db/client'; // Need direct DB access for writes
import { KanbanColumn } from './components/KanbanColumn';
import { TicketCard } from './components/TicketCard';
import type { RequestStatus } from '../../types';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { NewRequestModal } from './components/NewRequestModal';
import { Plus } from 'lucide-react';

// Map PGlite "Stage" (Capitalized from Seed/Schema?) to UI Status IDs 
// Schema said: stage TEXT CHECK (stage IN ('New', 'In Progress', 'Repaired', 'Scrap'))
// UI uses: 'new', 'in_progress', 'pending_parts', 'completed', 'canceled'
// We need to map or align them. 
// For now, let's update columns to match DB Schema values (Case Sensitive in PGlite usually stores as specific string)
const columns: { id: string; title: string }[] = [
    { id: 'New', title: 'New Requests' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Blocked', title: 'Blocked / Pending' }, // Mapped from pending_parts?? Schema has 'Blocked'
    { id: 'Repaired', title: 'Completed / Repaired' },
    { id: 'Scrap', title: 'Scrap' },
];

export const KanbanPage = () => {
    // Live query for tickets
    const { data: requests } = useDbQuery('SELECT * FROM tickets ORDER BY updated_at DESC');

    // Convert DB keys (snake_case) to UI expected keys (camelCase) if components expect it?
    // Or update components. Let's map on the fly for safety if TicketCard is strict.
    // Assuming TicketCard expects "MaintenanceRequest" type.
    const mappedRequests = (requests || []).map((r: any) => ({
        ...r,
        status: r.stage, // Map DB 'stage' to UI 'status'
        equipmentId: r.equipment_id,
        createdAt: r.created_at,
        // ... mappings as needed by TicketCard. 
        // TicketCard likely uses `r.title`, `r.priority`, `r.description`.
        // DB keys: title, priority (Medium/High - Capitalized?), description.
        // UI Type: Priority (lowercase).
    }));

    const [activeId, setActiveId] = useState<string | null>(null);
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const newStage = over.id as string;

            if (columns.some(col => col.id === newStage)) {
                // Optimistic Update? For now just await DB
                await db.query(`UPDATE tickets SET stage = $1, updated_at = NOW() WHERE id = $2`, [newStage, active.id]);
            }
        }
        setActiveId(null);
    };

    const activeRequest = activeId ? mappedRequests.find((r: any) => r.id === activeId) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[calc(100vh-2rem)] p-8 overflow-hidden"
        >
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Maintenance Board</h1>
                    <p className="text-muted-foreground text-sm mt-1">Drag and drop tickets to manage workflow.</p>
                </div>
                <button
                    onClick={() => setIsNewRequestOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                    <Plus className="w-4 h-4" /> New Request
                </button>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4 h-full snap-x snap-mandatory lg:snap-none">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            requests={mappedRequests.filter((r: any) => r.status === col.id)}
                        />
                    ))}
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeRequest ? <TicketCard request={activeRequest} /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            <NewRequestModal isOpen={isNewRequestOpen} onClose={() => setIsNewRequestOpen(false)} />
        </motion.div>
    );
};

import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useStore } from '../../stores/useStore';
import { KanbanColumn } from './components/KanbanColumn';
import { TicketCard } from './components/TicketCard';
import type { RequestStatus } from '../../types';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { NewRequestModal } from './components/NewRequestModal';
import { Plus } from 'lucide-react';

const columns: { id: RequestStatus; title: string }[] = [
    { id: 'new', title: 'New Requests' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'pending_parts', title: 'Pending Parts' },
    { id: 'completed', title: 'Completed' },
    { id: 'canceled', title: 'Canceled' },
];

export const KanbanPage = () => {
    const { requests, updateRequestStatus } = useStore();
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // If dropping on a container (column), update status
            const newStatus = over.id as RequestStatus;

            // Check if over.id is a valid status column
            if (columns.some(col => col.id === newStatus)) {
                updateRequestStatus(active.id as string, newStatus);
            }
        }
        setActiveId(null);
    };

    const activeRequest = activeId ? requests.find(r => r.id === activeId) : null;

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
                            requests={requests.filter(r => r.status === col.id)}
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

import { useDroppable } from '@dnd-kit/core';
import type { MaintenanceRequest, RequestStatus } from '../../../types';
import { TicketCard } from './TicketCard';
import { clsx } from 'clsx';

interface KanbanColumnProps {
    id: RequestStatus;
    title: string;
    requests: MaintenanceRequest[];
}

export const KanbanColumn = ({ id, title, requests }: KanbanColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div className="flex-1 flex flex-col min-w-[300px] h-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground/80 font-display tracking-tight">{title}</h3>
                    <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground min-w-[20px] text-center border border-white/40">
                        {requests.length}
                    </span>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={clsx(
                    "flex-1 p-2 rounded-3xl transition-all duration-300",
                    isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : "bg-transparent" // Transparent default, glass effect on container if needed
                )}
            >
                {/* Scrollable area within column */}
                <div className="h-full overflow-y-auto pr-1 pb-2 space-y-1 custom-scrollbar">
                    {requests.map((req) => (
                        <TicketCard key={req.id} request={req} />
                    ))}
                    {requests.length === 0 && (
                        <div className="h-32 border-2 border-dashed border-muted rounded-2xl flex items-center justify-center text-xs text-muted-foreground/50">
                            Drop here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

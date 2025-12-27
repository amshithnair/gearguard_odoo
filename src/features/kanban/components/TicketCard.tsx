import type { MaintenanceRequest } from '../../../types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import { Clock, AlertOctagon, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from 'lucide-react';

interface TicketCardProps {
    request: MaintenanceRequest;
}

const priorityConfig = {
    low: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: ArrowDownCircle },
    medium: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ArrowRightCircle },
    high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: ArrowUpCircle },
    critical: { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: AlertOctagon },
};

export const TicketCard = ({ request }: TicketCardProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: request.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const priorityStyle = priorityConfig[request.priority];
    const PriorityIcon = priorityStyle.icon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "group relative p-4 mb-3 rounded-2xl bg-white border border-border shadow-sm transition-all duration-200 touch-none select-none outline-none",
                isDragging ? "shadow-2xl ring-2 ring-primary rotate-3 z-50 cursor-grabbing opacity-90 scale-105" : "hover:shadow-md hover:border-primary/50 cursor-grab"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", priorityStyle.color)}>
                    <PriorityIcon className="w-3 h-3" />
                    {request.priority}
                </div>
                {request.scheduledDate && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {new Date(request.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>

            <h4 className="font-semibold text-sm mb-1 text-foreground leading-snug group-hover:text-primary-700 transition-colors">{request.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{request.description}</p>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {/* Placeholder avatars for assignees */}
                    <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">A</div>
                </div>
                <div className="text-[10px] font-medium text-gray-400">
                    {request.id}
                </div>
            </div>
        </div>
    );
};

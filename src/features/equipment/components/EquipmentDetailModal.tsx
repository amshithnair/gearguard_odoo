import type { Equipment } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../stores/useStore';
import { formatDistanceToNow } from 'date-fns';
import { PenTool, Calendar, MapPin, Activity, ShieldCheck, Box, Wrench } from 'lucide-react';

interface EquipmentDetailModalProps {
    equipment: Equipment | null;
    onClose: () => void;
}

export const EquipmentDetailModal = ({ equipment, onClose }: EquipmentDetailModalProps) => {
    const { requests } = useStore();

    if (!equipment) return null;

    const history = requests
        .filter(r => r.equipmentId === equipment.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Modal isOpen={!!equipment} onClose={onClose} title={equipment.name}>
            {/* Smart Button Row */}
            <div className="flex justify-end mb-6">
                <button className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition-all group">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-100 transition-colors">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-slate-900">{history.length}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Maintenance</div>
                    </div>
                </button>
            </div>

            <div className="space-y-8">
                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs uppercase font-bold tracking-wider">
                            <Box className="w-3 h-3" /> Model
                        </div>
                        <p className="font-semibold text-foreground">{equipment.model}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-500/10">
                        <div className="flex items-center gap-2 text-blue-600/80 mb-1 text-xs uppercase font-bold tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> Status
                        </div>
                        <p className="font-semibold text-blue-700 dark:text-blue-300 capitalize">{equipment.status}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-500/10">
                        <div className="flex items-center gap-2 text-orange-600/80 mb-1 text-xs uppercase font-bold tracking-wider">
                            <Activity className="w-3 h-3" /> Current Health
                        </div>
                        <p className="font-semibold text-orange-700 dark:text-orange-300">Good</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 dark:bg-purple-900/10 dark:border-purple-500/10">
                        <div className="flex items-center gap-2 text-purple-600/80 mb-1 text-xs uppercase font-bold tracking-wider">
                            <MapPin className="w-3 h-3" /> Location
                        </div>
                        <p className="font-semibold text-purple-700 dark:text-purple-300 truncate">{equipment.location}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-primary-500" />
                            Specifications
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Manufacturer</span>
                                <span className="font-medium">{equipment.manufacturer}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Serial Number</span>
                                <span className="font-medium font-mono text-xs">{equipment.serialNumber}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Last Maintenance</span>
                                <span className="font-medium">{equipment.lastMaintenance || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Next Due</span>
                                <span className="font-medium text-orange-600">{equipment.nextMaintenance || 'N/A'}</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-muted-foreground block mb-1">Description</span>
                                <p className="text-foreground/80 leading-relaxed">{equipment.description}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            Maintenance History
                        </h3>
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                                No history recorded
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-muted pl-4 space-y-6 ml-2">
                                {history.map((req) => (
                                    <div key={req.id} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-primary-400 box-content"></div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{req.title}</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(req.createdAt))} ago</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

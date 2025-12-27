import { useEffect, useState } from 'react';
import { useStore } from '../../../stores/useStore';
import { Modal } from '../../../components/ui/Modal';
import type { MaintenanceRequest, Priority, InventoryItem } from '../../../types';
import { Users, Wrench, Calendar as CalendarIcon, Package, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { MOCK_INVENTORY } from '../../../lib/mockData';

// Mock "Smart" Knowledge Base with Recommended Parts
const COMMON_PROBLEMS = [
    { label: 'Hydraulic Leak', teamKeyword: 'Internal Maintenance', priority: 'high' as const, recommendedParts: ['inv1', 'inv3'] },
    { label: 'Circuit Board Failure', teamKeyword: 'Electronics', priority: 'medium' as const, recommendedParts: ['inv5'] },
    { label: 'Sensor Drift', teamKeyword: 'Electronics', priority: 'low' as const, recommendedParts: ['inv4'] },
    { label: 'Motor Overheating', teamKeyword: 'Mechanical Titans', priority: 'critical' as const, recommendedParts: ['inv2'] },
    { label: 'Software Glitch', teamKeyword: 'IT Support', priority: 'medium' as const, recommendedParts: [] },
    { label: 'Unusual Noise / Vibration', teamKeyword: 'Internal Maintenance', priority: 'high' as const, recommendedParts: ['inv2', 'inv1'] },
];

interface NewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewRequestModal = ({ isOpen, onClose }: NewRequestModalProps) => {
    const { equipment, teams, addRequest } = useStore();

    // Form State
    const [title, setTitle] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [type, setType] = useState<'corrective' | 'preventive'>('corrective');
    const [priority, setPriority] = useState<Priority>('medium');
    const [scheduledDate, setScheduledDate] = useState('');
    const [recommendedParts, setRecommendedParts] = useState<InventoryItem[]>([]);

    // Smart Assist Logic
    const handleProblemSelect = (problemLabel: string) => {
        setTitle(problemLabel);

        // Find best team match
        const problem = COMMON_PROBLEMS.find(p => p.label === problemLabel);
        if (problem) {
            setPriority(problem.priority);

            // Auto Select Team
            const targetTeam = teams.find(t => t.name.includes(problem.teamKeyword) || (t.description && t.description.includes(problem.teamKeyword)));
            if (targetTeam) {
                setTeamId(targetTeam.id);
            }

            // Auto Suggest Parts
            const parts = MOCK_INVENTORY.filter(i => problem.recommendedParts.includes(i.id));
            setRecommendedParts(parts);
        } else {
            setRecommendedParts([]);
        }
    };

    // Auto-fill Logic: Watch for Equipment Change
    useEffect(() => {
        if (equipmentId) {
            const selectedEq = equipment.find(e => e.id === equipmentId);
            if (selectedEq && selectedEq.teamId) {
                // Auto-select the team assigned to this equipment
                setTeamId(selectedEq.teamId);
            }
        }
    }, [equipmentId, equipment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newRequest: MaintenanceRequest = {
            id: `req-${Date.now()}`,
            title,
            equipmentId,
            requesterId: 'u1', // Mock current user
            teamId,
            type,
            priority,
            status: 'new',
            description: 'Created via Smart Form',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            scheduledDate: type === 'preventive' ? scheduledDate : undefined,
            // In a real app, we would save recommendedParts here too
        };

        addRequest(newRequest);
        onClose();
        // Reset form
        setTitle('');
        setEquipmentId('');
        setTeamId('');
        setType('corrective');
        setRecommendedParts([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Maintenance Request">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Request Type Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setType('corrective')}
                        className={clsx(
                            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                            type === 'corrective' ? "bg-white shadow-sm text-red-600" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Breakdown (Corrective)
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('preventive')}
                        className={clsx(
                            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                            type === 'preventive' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Routine (Preventive)
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Common Issue</label>
                        <div className="flex gap-2 mb-2 bg-blue-50/50 p-2 rounded-lg overflow-x-auto">
                            {COMMON_PROBLEMS.map(p => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => handleProblemSelect(p.label)}
                                    className="px-3 py-1 bg-white border border-blue-100 rounded-full text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-200 transition-colors whitespace-nowrap"
                                >
                                    + {p.label}
                                </button>
                            ))}
                        </div>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Describe the failure..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Equipment</label>
                            <div className="relative">
                                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    required
                                    value={equipmentId}
                                    onChange={(e) => setEquipmentId(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none appearance-none bg-white"
                                >
                                    <option value="">Select Asset</option>
                                    {equipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Team</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={teamId}
                                    onChange={(e) => setTeamId(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none appearance-none bg-white"
                                >
                                    <option value="">Auto-assigned...</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {type === 'preventive' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Smart Inventory Section */}
                    {recommendedParts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-purple-50 p-4 rounded-xl border border-purple-100"
                        >
                            <h4 className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-3">
                                <Package className="w-4 h-4" />
                                Recommended Parts (Smart Inventory)
                            </h4>
                            <div className="space-y-2">
                                {recommendedParts.map(part => {
                                    const isLowStock = part.stock <= part.minStock;
                                    return (
                                        <div key={part.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-purple-100 shadow-sm">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{part.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">SKU: {part.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={clsx("text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1", isLowStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700")}>
                                                    {isLowStock && <AlertTriangle className="w-3 h-3" />}
                                                    Stock: {part.stock} {part.unit}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">${part.cost} / unit</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={clsx(
                                        "flex-1 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all",
                                        priority === p
                                            ? p === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
                                                p === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Create Request</button>
                </div>
            </form>
        </Modal>
    );
};


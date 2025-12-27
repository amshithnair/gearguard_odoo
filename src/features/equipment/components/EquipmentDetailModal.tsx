import type { Equipment } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../stores/useStore';
import { formatDistanceToNow } from 'date-fns';
import { PenTool, Calendar, MapPin, Activity, ShieldCheck, Box, Wrench, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EquipmentDetailModalProps {
    equipment: Equipment | null;
    onClose: () => void;
}

export const EquipmentDetailModal = ({ equipment, onClose }: EquipmentDetailModalProps) => {
    const { requests } = useStore();
    const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'predictive'>('details');
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);

    // Mock Prediction Data
    const predictionData = [
        { day: 'Mon', health: 98 },
        { day: 'Tue', health: 97 },
        { day: 'Wed', health: 95 },
        { day: 'Thu', health: 92 },
        { day: 'Fri', health: 88 },
        { day: 'Sat', health: 85 },
        { day: 'Sun', health: 82 },
        { day: 'Next Mon', health: 75 }, // Suggested Failure
        { day: 'Next Tue', health: 65, predicted: true },
    ];

    const runAiDiagnosis = () => {
        setAiAnalyzing(true);
        setTimeout(() => {
            setAiAnalyzing(false);
            setAiResult("Based on recent telemetry (Vibration > 4.2mm/s), there is a 92% probability of Inner Bearing Race wear. Suggested Action: Replacement of SKF-6204 Bearing.");
        }, 2000);
    };

    if (!equipment) return null;

    const history = requests
        .filter(r => r.equipmentId === equipment.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Modal isOpen={!!equipment} onClose={onClose} title={equipment.name}>
            <div className="flex justify-between items-center mb-6">
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'details' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    > Overview </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", activeTab === 'ai' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    > <Sparkles className="w-4 h-4" /> AI Doctor </button>
                    <button
                        onClick={() => setActiveTab('predictive')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", activeTab === 'predictive' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    > <TrendingUp className="w-4 h-4" /> Predictive </button>
                </div>

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

            {/* Tab: Details */}
            {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                                <Box className="w-3 h-3" /> Model
                            </div>
                            <p className="font-semibold text-slate-900">{equipment.model}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600/80 mb-1 text-xs uppercase font-bold tracking-wider">
                                <ShieldCheck className="w-3 h-3" /> Status
                            </div>
                            <p className="font-semibold text-blue-700 capitalize">{equipment.status}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                            <div className="flex items-center gap-2 text-orange-600/80 mb-1 text-xs uppercase font-bold tracking-wider">
                                <Activity className="w-3 h-3" /> Current Health
                            </div>
                            <p className="font-semibold text-orange-700">Good</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-600/80 mb-1 text-xs uppercase font-bold tracking-wider">
                                <MapPin className="w-3 h-3" /> Location
                            </div>
                            <p className="font-semibold text-purple-700 truncate">{equipment.location}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 text-slate-900">
                                <PenTool className="w-5 h-5 text-blue-500" />
                                Specifications
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Manufacturer</span>
                                    <span className="font-medium text-slate-900">{equipment.manufacturer}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Serial Number</span>
                                    <span className="font-medium font-mono text-xs text-slate-700">{equipment.serialNumber}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Last Maintenance</span>
                                    <span className="font-medium text-slate-900">{equipment.lastMaintenance || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Next Due</span>
                                    <span className="font-medium text-orange-600">{equipment.nextMaintenance || 'N/A'}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="text-slate-500 block mb-1">Description</span>
                                    <p className="text-slate-700 leading-relaxed">{equipment.description}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 text-slate-900">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Maintenance History
                            </h3>
                            {history.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    No history recorded
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-slate-200 pl-4 space-y-6 ml-2">
                                    {history.map((req) => (
                                        <div key={req.id} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-blue-400 box-content"></div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-900">{req.title}</p>
                                                <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(req.createdAt))} ago</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-600">
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
            )}

            {/* Tab: AI Doctor */}
            {activeTab === 'ai' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-100 text-center">
                        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-indigo-900 mb-2">Dr. GearGuard Diagnostics</h3>
                        <p className="text-indigo-600/80 mb-6 max-w-md mx-auto">Analyze recent telemetry logs, audio notes, and maintenance history to detect potential failures.</p>

                        {!aiResult && (
                            <button
                                onClick={runAiDiagnosis}
                                disabled={aiAnalyzing}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                            >
                                {aiAnalyzing ? "Analyzing Patterns..." : "Start Diagnosis"}
                            </button>
                        )}

                        {aiResult && (
                            <div className="bg-white p-6 rounded-xl border border-indigo-100 text-left shadow-sm max-w-lg mx-auto relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                    Analysis Complete
                                </h4>
                                <p className="text-slate-600 leading-relaxed">{aiResult}</p>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Create Work Order &rarr;</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab: Predictive */}
            {activeTab === 'predictive' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Health Projection</h3>
                                <p className="text-sm text-slate-500">Estimated degradation based on usage hours.</p>
                            </div>
                            <div className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Predicted Failure: 3 Days
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={predictionData}>
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                                    <Tooltip />
                                    <ReferenceLine y={80} stroke="red" strokeDasharray="3 3" label="Critical Threshold" />
                                    <Line type="monotone" dataKey="health" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 shadow-md">
                                Schedule Preventive Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

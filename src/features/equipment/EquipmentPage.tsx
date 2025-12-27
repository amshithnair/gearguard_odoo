import { useStore } from '../../stores/useStore';
import { Search, Filter, Plus, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import type { Equipment } from '../../types';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { motion } from 'framer-motion';

export const EquipmentPage = () => {
    const { equipment } = useStore();
    const [search, setSearch] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const filteredEquipment = equipment.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.serialNumber.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'retired': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 max-w-[1600px] mx-auto"
        >
            <div className="flex justify-between items-end mb-8">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Equipment</h1>
                    <p className="text-muted-foreground mt-1">Manage assets and machinery.</p>
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 text-sm font-medium hover:bg-primary/90 transition-all font-display tracking-wide"
                >
                    <Plus className="w-4 h-4" />
                    Add Equipment
                </motion.button>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-card overflow-hidden">
                <div className="p-6 border-b border-white/20 flex gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/50 bg-white/50 hover:bg-white text-sm font-medium transition-colors shadow-sm text-muted-foreground hover:text-foreground">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/30 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Asset Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Next Maintenance</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {filteredEquipment.map((item, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={item.id}
                                    className="hover:bg-white/40 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-primary-600 shadow-sm border border-white/50">
                                                <Monitor className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.serialNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">{item.category}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("px-2.5 py-1 rounded-full text-xs font-semibold border capitalize", getStatusColor(item.status))}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground">
                                        {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedEquipment(item)}
                                            className="text-primary-600 hover:text-primary-800 font-medium hover:underline decoration-2 underline-offset-4"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EquipmentDetailModal
                equipment={selectedEquipment}
                onClose={() => setSelectedEquipment(null)}
            />
        </motion.div>
    );
};

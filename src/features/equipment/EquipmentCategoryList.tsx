import { useStore } from '../../stores/useStore';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export const EquipmentCategoryList = () => {
    const { categories, users } = useStore();
    const [search, setSearch] = useState('');

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const getUserName = (id?: string) => {
        if (!id) return '-';
        return users.find(u => u.id === id)?.name || id;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 max-w-[1600px] mx-auto"
        >
            <div className="flex justify-between items-end mb-8">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Equipment Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage equipment classification.</p>
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 text-sm font-medium hover:bg-primary/90 transition-all font-display tracking-wide"
                >
                    <Plus className="w-4 h-4" />
                    New
                </motion.button>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-card overflow-hidden">
                <div className="p-6 border-b border-white/20 flex gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/30 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-1/3">Name</th>
                                <th className="px-6 py-4 font-semibold w-1/3">Responsible</th>
                                <th className="px-6 py-4 font-semibold w-1/3">Company</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {filteredCategories.map((item, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={item.id}
                                    className="hover:bg-white/40 transition-colors group cursor-pointer"
                                    onClick={() => { }} // TODO: Edit Category
                                >
                                    <td className="px-6 py-4 font-semibold text-foreground">{item.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                                                {getUserName(item.responsibleId)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.company || '-'}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

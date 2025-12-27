import { useStore } from '../../../stores/useStore';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export const DashboardTable = () => {
    const { requests, users, equipment } = useStore();
    const navigate = useNavigate();

    const enrichedRequests = requests.slice(0, 5).map(req => {
        const requester = users.find(u => u.id === req.requesterId);
        const assignee = users.find(u => u.id === req.assigneeId);
        const equip = equipment.find(e => e.id === req.equipmentId);

        return {
            ...req,
            requesterName: requester?.name || 'Unknown',
            assigneeName: assignee?.name || 'Unassigned',
            category: equip?.category || 'General',
            company: 'My Company'
        };
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="py-4 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Subject</th>
                        <th className="py-4 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Employee</th>
                        <th className="py-4 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Technician</th>
                        <th className="py-4 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Category</th>
                        <th className="py-4 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Stage</th>
                        <th className="py-4 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Company</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {enrichedRequests.map((item, index) => (
                        <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={item.id}
                            onClick={() => navigate('/kanban')}
                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <td className="py-4 px-6 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</td>
                            <td className="py-4 px-6 text-slate-600 text-sm">{item.requesterName}</td>
                            <td className="py-4 px-6 text-slate-600 text-sm">
                                {item.assigneeName === 'Unassigned' ? (
                                    <span className="italic text-slate-400">Unassigned</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                            {item.assigneeName.slice(0, 1)}
                                        </span>
                                        {item.assigneeName}
                                    </div>
                                )}
                            </td>
                            <td className="py-4 px-6 text-slate-500 text-sm">{item.category}</td>
                            <td className="py-4 px-6">
                                <span className={clsx("px-2.5 py-1 rounded-full text-xs font-semibold capitalize border",
                                    item.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        item.status === 'in_progress' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                )}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 text-sm text-right">{item.company}</td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

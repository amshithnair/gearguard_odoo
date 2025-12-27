import { useStore } from '../../../stores/useStore';
import { formatDistanceToNow } from 'date-fns';
import type { RequestStatus } from '../../../types';
import { Clock, CheckCircle2, AlertTriangle, PenTool, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
        case 'new': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
        case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
        case 'pending_parts': return <PenTool className="w-4 h-4 text-purple-600" />;
        case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
        case 'canceled': return <XCircle className="w-4 h-4 text-slate-400" />;
    }
};

const getStatusBg = (status: RequestStatus) => {
    switch (status) {
        case 'new': return 'bg-orange-50 border-orange-100';
        case 'in_progress': return 'bg-blue-50 border-blue-100';
        case 'pending_parts': return 'bg-purple-50 border-purple-100';
        case 'completed': return 'bg-emerald-50 border-emerald-100';
        case 'canceled': return 'bg-slate-50 border-slate-100';
    }
};

export const RecentActivity = () => {
    const { requests } = useStore();
    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    return (
        <div className="h-full">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Recent Updates</h3>
            <div className="space-y-3">
                {sortedRequests.map((req, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={req.id}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100"
                    >
                        <div className={clsx("mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", getStatusBg(req.status))}>
                            {getStatusIcon(req.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-800 truncate group-hover:text-blue-600 transition-colors">{req.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

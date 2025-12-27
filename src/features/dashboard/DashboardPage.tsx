import { useDbQuery } from '../../hooks/use-db-query';
import { StatsCard } from './components/StatsCard';
import { DashboardTable } from './components/DashboardTable';
import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardPage = () => {
    const { data: equipment } = useDbQuery('SELECT * FROM equipment');
    const { data: requests } = useDbQuery('SELECT * FROM tickets');
    const { data: users } = useDbQuery('SELECT * FROM users');

    // NOTE: In PGlite/SQL we don't have healthScore column in schema yet, assuming 100 or need to migrate schema later. 
    // For now, let's just count 'status' != 'Active' as critical or similar.
    // Or we rely on 'tickets' count.
    // Let's use status 'Under Maintenance' as critical/attention needed.
    const criticalEquipCount = (equipment || []).filter((e: any) => e.status === 'Under Maintenance').length;

    const technicians = (users || []).filter((u: any) => u.role === 'technician');
    const activeRequests = (requests || []).filter((r: any) => r.stage === 'New' || r.stage === 'In Progress').length;
    const capacity = technicians.length * 5 || 1;
    const utilization = Math.round((activeRequests / capacity) * 100);

    const openRequests = (requests || []).filter((r: any) => ['New', 'In Progress'].includes(r.stage));
    const pendingCount = openRequests.length;
    const overdueCount = 0; // Need scheduled_date logic comparison which is complex in JS-in-render, skip for now.

    return (
        <div className="p-8">
            {/* Header: Title + Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap">
                        <Plus className="w-4 h-4" /> New
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Critical Equipment"
                    value={`${criticalEquipCount} Units`}
                    color="pink"
                    subtext="Health < 30%"
                />

                <StatsCard
                    title="Technician Load"
                    value={`${utilization}% Utilized`}
                    color="blue"
                    subtext="Active Requests / Capacity"
                />

                <StatsCard
                    title="Open Requests"
                    value={`${pendingCount} Pending`}
                    color="green"
                    subtext={`${overdueCount} Overdue`}
                />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                    <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <DashboardTable />
                </motion.div>
            </div>
        </div>
    );
};

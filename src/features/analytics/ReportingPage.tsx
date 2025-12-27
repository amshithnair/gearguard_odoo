import { BarChart3, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

export const ReportingPage = () => {
    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50/50">
            <h1 className="text-2xl font-bold font-display text-slate-900 mb-8 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Reporting & Analytics
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <KpiCard icon={CheckCircle2} label="Availability" value="98.5%" trend="+2.1%" good />
                <KpiCard icon={Clock} label="MTTR (Mean Time to Repair)" value="4.2h" trend="-15%" good />
                <KpiCard icon={TrendingUp} label="Maintenance Costs" value="$12,450" trend="+5%" bad />
                <KpiCard icon={TrendingDown} label="Downtime Hours" value="12h" trend="-30%" good />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fake Chart 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Equipment Failure Rate (Monthly)</h3>
                    <div className="h-64 flex items-end gap-4 px-4 overflow-hidden">
                        {[40, 65, 30, 85, 50, 25, 45, 60, 75, 50, 40, 20].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t-lg relative group transition-all">
                                <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg group-hover:bg-blue-600 transition-all"></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase tracking-wide">
                        <span>Jan</span><span>Dec</span>
                    </div>
                </div>

                {/* Fake Chart 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Technician Performance (Tasks Closed)</h3>
                    <div className="space-y-4">
                        <TechBar name="Sam Tech" count={42} max={50} />
                        <TechBar name="Jamie Tech" count={38} max={50} />
                        <TechBar name="Alex Manager" count={12} max={50} />
                        <TechBar name="External Vendor" count={5} max={50} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ icon: Icon, label, value, trend, good }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${good ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend}
            </span>
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
);

const TechBar = ({ name, count, max }: any) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">{name}</span>
            <span className="font-bold text-slate-900">{count} Tasks</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${(count / max) * 100}%` }} className="h-full bg-blue-500 rounded-full"></div>
        </div>
    </div>
);

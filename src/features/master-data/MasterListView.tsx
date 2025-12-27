import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { MOCK_INVENTORY, mockWorkCenters } from '../../lib/mockData';
import { Plus, Search, Users, Factory, Package, Wrench } from 'lucide-react';
import { clsx } from 'clsx';

export const MasterListView = ({ forceType }: { forceType?: string }) => {
    const params = useParams<{ type: string }>();
    const type = forceType || params.type;
    const { teams, equipment } = useStore();

    // Dynamic Data Source
    let title = 'Master Data';
    let columns: string[] = [];
    let rows: any[] = [];

    // Determine configuration
    if (type === 'teams') {
        title = 'Teams & Technicians';
        rows = teams;
        columns = ['Team Name', 'Description', 'Members'];
    } else if (type === 'equipment') {
        title = 'Equipment Registry';
        rows = equipment;
        columns = ['Name', 'Serial #', 'Status', 'Location'];
    } else if (type === 'work-centers') {
        title = 'Work Centers';
        rows = mockWorkCenters;
        columns = ['Name', 'Linked Area'];
    } else if (type === 'inventory') {
        title = 'Inventory (Spare Parts)';
        rows = MOCK_INVENTORY;
        columns = ['Part Name', 'Stock', 'Min Level', 'Cost'];
    }

    return (
        <div className="h-full flex flex-col bg-gray-50/50">
            {/* Header / Actions */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-3">
                        {type === 'teams' && <Users className="w-8 h-8 text-blue-600" />}
                        {type === 'equipment' && <Wrench className="w-8 h-8 text-blue-600" />}
                        {type === 'work-centers' && <Factory className="w-8 h-8 text-blue-600" />}
                        {type === 'inventory' && <Package className="w-8 h-8 text-blue-600" />}
                        {title}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-11">Manage your system master data</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search records..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <Link
                        to={`/master/${type}/new`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create New
                    </Link>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {columns.map(col => (
                                    <th key={col} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row: any) => (
                                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    {/* Teams */}
                                    {type === 'teams' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{row.description}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2">
                                                    {(row.memberIds || []).map((mid: string) => (
                                                        <div key={mid} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={mid}>
                                                            {mid.substring(0, 1).toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {(row.memberIds || []).length === 0 && <span className="text-slate-400 text-sm italic">No members</span>}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    {/* Equipment */}
                                    {type === 'equipment' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.serialNumber}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                    row.status === 'active' ? "bg-green-100 text-green-800" :
                                                        row.status === 'maintenance' ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-800"
                                                )}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{row.location}</td>
                                        </>
                                    )}
                                    {/* Work Centers */}
                                    {type === 'work-centers' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{row.areaId}</td>
                                        </>
                                    )}
                                    {/* Inventory */}
                                    {type === 'inventory' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx("font-bold", row.stock <= row.minStock ? "text-red-600" : "text-slate-700")}>
                                                    {row.stock} {row.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{row.minStock}</td>
                                            <td className="px-6 py-4 text-slate-600">${row.cost}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


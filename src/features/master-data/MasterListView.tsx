import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from '@electric-sql/pglite-react';
import { db } from '../../db/client';
import { Plus, Search, Users, Factory, Package, Wrench } from 'lucide-react';

export const MasterListView = () => {
    const { type } = useParams<{ type: string }>();

    // Dynamic Title & Query based on Type
    let title = 'Master Data';
    let query = '';
    let columns: string[] = [];

    // Determine configuration
    if (type === 'teams') {
        title = 'Teams & Technicians';
        query = 'SELECT id, name, description, slug FROM teams ORDER BY name ASC';
        columns = ['Team Name', 'Description', 'Channel Slug'];
    } else if (type === 'equipment') {
        title = 'Equipment';
        query = 'SELECT id, name, serial_number, status, location FROM equipment ORDER BY name ASC';
        columns = ['Name', 'Serial #', 'Status', 'Location'];
    } else if (type === 'work-centers') {
        title = 'Work Centers';
        query = 'SELECT id, name, code, cost_per_hour, capacity_efficiency FROM work_centers ORDER BY name ASC';
        columns = ['Name', 'Code', 'Cost/Hr', 'Efficiency'];
    } else if (type === 'inventory') {
        title = 'Inventory';
        // Mock query until spare_parts table created
        query = '';
        columns = ['Part Name', 'Stock', 'Min Level'];
    }

    const { rows } = useLiveQuery<any>(query || 'SELECT 1');

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
                            {rows?.map((row: any) => (
                                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    {/* Generic Rendering based on type */}
                                    {type === 'teams' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{row.description}</td>
                                            <td className="px-6 py-4">
                                                <code className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-mono">#{row.slug}</code>
                                            </td>
                                        </>
                                    )}
                                    {type === 'equipment' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.serial_number}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{row.location}</td>
                                        </>
                                    )}
                                    {type === 'work-centers' && (
                                        <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.code}</td>
                                            <td className="px-6 py-4 text-slate-600">${Number(row.cost_per_hour).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-slate-600">{row.capacity_efficiency}%</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {(!rows || rows.length === 0) && (
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

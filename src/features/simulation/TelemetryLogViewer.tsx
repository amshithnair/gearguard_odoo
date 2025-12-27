import React from 'react';
import { useDbQuery } from '../../hooks/use-db-query';
import { Activity } from 'lucide-react';

export const TelemetryLogViewer = () => {
    // Poll logs every 2 seconds or stick to live query
    const { data: logs } = useDbQuery(`
        SELECT l.*, e.name as equipment_name 
        FROM machine_telemetry_log l
        JOIN equipment e ON l.equipment_id = e.id
        ORDER BY l.reading_date_time DESC
        LIMIT 10
    `);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Live Telemetry Feed
                </h3>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">Live</span>
            </div>

            <div className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No telemetry data receieved yet.</div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log.id} className="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{log.equipment_name}</p>
                                <p className="text-xs text-gray-500">
                                    {log.parameter_type}: <span className="font-mono font-medium text-gray-700">{log.value}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400">{new Date(log.reading_date_time).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

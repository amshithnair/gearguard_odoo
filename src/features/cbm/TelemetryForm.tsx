import React, { useState } from 'react';
import { useDbQuery } from '../../hooks/use-db-query';
import { db } from '../../db/client';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export const TelemetryForm = () => {
    const [selectedEquip, setSelectedEquip] = useState('');
    const [parameter, setParameter] = useState('Temperature');
    const [value, setValue] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

    // Fetch equipments for dropdown
    const { data: equipment } = useDbQuery<{ id: string; name: string }>('SELECT id, name FROM equipment');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        if (!selectedEquip || !value) return;

        try {
            const numValue = parseFloat(value);

            // 1. Log Telemetry
            await db.query(`
                INSERT INTO machine_telemetry_log (id, equipment_id, parameter_type, value)
                VALUES ($1, $2, $3, $4)
            `, [crypto.randomUUID(), selectedEquip, parameter, numValue]);

            // 2. Check Triggers (The Pulse Logic)
            const { rows: triggers } = await db.query<{
                trigger_name: string;
                threshold_value: number;
                operation_type: string;
                associated_task_template: string;
            }>(`
                SELECT * FROM maintenance_triggers 
                WHERE equipment_id = $1 AND parameter_type = $2
            `, [selectedEquip, parameter]);

            let triggered = false;

            for (const trigger of triggers) {
                const isViolation =
                    (trigger.operation_type === 'Greater_Than' && numValue > trigger.threshold_value) ||
                    (trigger.operation_type === 'Less_Than' && numValue < trigger.threshold_value);

                if (isViolation) {
                    triggered = true;
                    // Auto-create Ticket
                    await db.query(`
                        INSERT INTO tickets (
                            id, title, description, equipment_id, request_type, stage, priority, created_by, duration_hours
                        ) VALUES ($1, $2, $3, $4, $5, 'New', 'Critical', 'u1', 0)
                    `, [
                        crypto.randomUUID(),
                        `AUTO-ALERT: ${trigger.trigger_name} (Value: ${numValue})`,
                        `System triggered maintenance. Rule: ${trigger.trigger_name}. Value ${numValue} exceeded limit ${trigger.threshold_value}. Action: ${trigger.associated_task_template}`,
                        selectedEquip,
                        'Condition_Based'
                    ]);
                }
            }

            if (triggered) {
                setFeedback({ type: 'error', msg: 'Anomaly Detected! Maintenance Request Auto-Generated.' });
            } else {
                setFeedback({ type: 'success', msg: 'Telemetry Logged. Status: Normal.' });
            }

        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', msg: 'Failed to submit telemetry.' });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-800">Use "The Pulse" (Simulation)</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Machine</label>
                    <select
                        className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={selectedEquip}
                        onChange={(e) => setSelectedEquip(e.target.value)}
                    >
                        <option value="">-- Choose Equipment --</option>
                        {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parameter</label>
                        <select
                            className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={parameter}
                            onChange={(e) => setParameter(e.target.value)}
                        >
                            <option value="Temperature">Temperature (°C)</option>
                            <option value="Running_Hours">Running Hours</option>
                            <option value="Vibration">Vibration (Hz)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                        <input
                            type="number"
                            className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. 85"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                    Simulate Reading
                </button>
            </form>

            {feedback && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                        feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50'
                    }`}>
                    {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 mt-0.5" /> : <CheckCircle className="w-5 h-5 mt-0.5" />}
                    <div>
                        <p className="font-medium text-sm">{feedback.type === 'error' ? 'Critical Alert' : 'System Normal'}</p>
                        <p className="text-xs opacity-90">{feedback.msg}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

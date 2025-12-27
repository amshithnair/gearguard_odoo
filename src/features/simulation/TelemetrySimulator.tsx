import { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { Play, Pause, RefreshCw, AlertTriangle, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const TelemetrySimulator = () => {
    const { equipment, rules, processTelemetry, telemetryLogs } = useStore();

    // Auto-Run State
    const [isRunning, setIsRunning] = useState(false);

    // Sliders State (Value per Equipment+Param)
    const [values, setValues] = useState<Record<string, number>>({});

    // Initialize triggers
    useEffect(() => {
        const initialPoints: Record<string, number> = {};
        // Find equipment with rules
        rules.forEach(r => {
            const key = `${r.equipmentId}-${r.parameter}`;
            if (!values[key]) {
                // Set initial safe value (assume threshold - 20)
                initialPoints[key] = r.threshold > 50 ? r.threshold - 20 : 0;
            }
        });
        setValues(prev => ({ ...prev, ...initialPoints }));
    }, [rules]);

    // Simulator Loop
    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => {
                // Randomly fluctuate values
                setValues(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(k => {
                        // +/- 5 variance
                        const flux = (Math.random() - 0.5) * 5;
                        next[k] = Math.max(0, Number((next[k] + flux).toFixed(1)));

                        // Push to store
                        const [eqId, param] = k.split('-');
                        processTelemetry(eqId, param, next[k]);
                    });
                    return next;
                });
            }, 2000); // Every 2 seconds
        }
        return () => clearInterval(interval);
    }, [isRunning, processTelemetry]);

    const handleSliderChange = (eqId: string, param: string, val: number) => {
        const key = `${eqId}-${param}`;
        setValues(prev => ({ ...prev, [key]: val }));

        // Push instant update
        processTelemetry(eqId, param, val);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-blue-600" />
                        IoT Telemetry Simulator
                    </h1>
                    <p className="text-slate-500 mt-2">Simulate sensor readings to trigger automated workflows.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg",
                            isRunning ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-600 text-white hover:bg-green-700"
                        )}
                    >
                        {isRunning ? <><Pause className="w-5 h-5" /> Stop Simulation</> : <><Play className="w-5 h-5" /> Start Stream</>}
                    </button>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm">
                        <RefreshCw className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-600 mb-4">Sensor Controls</h2>
                    {rules.map(rule => {
                        const eqName = equipment.find(e => e.id === rule.equipmentId)?.name || rule.equipmentId;
                        const key = `${rule.equipmentId}-${rule.parameter}`;
                        const currentVal = values[key] || 0;
                        const isCritical = rule.condition === '>' ? currentVal > rule.threshold : currentVal < rule.threshold;

                        return (
                            <div key={rule.id} className={clsx("p-6 rounded-2xl border transition-all shadow-sm", isCritical ? "bg-red-50 border-red-200 ring-2 ring-red-500/20" : "bg-white border-slate-200")}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{eqName}</h3>
                                        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                                            Sensor: {rule.parameter}
                                        </div>
                                    </div>
                                    <div className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase", isCritical ? "bg-red-500 text-white" : "bg-green-100 text-green-700")}>
                                        {isCritical ? 'CRITICAL' : 'NORMAL'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max={rule.threshold * 1.5}
                                        value={currentVal}
                                        onChange={(e) => handleSliderChange(rule.equipmentId, rule.parameter, Number(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-2xl font-bold font-mono w-20 text-right">{currentVal}</span>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                                    <span>Safe</span>
                                    <span className="text-red-500 flex items-center gap-1">
                                        THRESHOLD: {rule.threshold} {rule.condition}
                                        <AlertTriangle className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {rules.length === 0 && (
                        <div className="p-8 text-center border-dashed border-2 border-slate-200 rounded-2xl text-slate-400">
                            No automation rules found. Add triggers in DB/Seed to enable controls.
                        </div>
                    )}
                </div>

                {/* Real-time Log */}
                <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-sm h-[600px] flex flex-col shadow-2xl overflow-hidden">
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                        <Activity className="w-4 h-4 text-green-400" />
                        Incoming Data Stream
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {telemetryLogs.slice(0, 50).map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={clsx("p-2 border-l-2 pl-3", log.isAnomaly ? "border-red-500 bg-red-900/10 text-red-200" : "border-slate-700")}
                                >
                                    <span className="opacity-50 text-[10px] mr-3">{log.timestamp.split('T')[1].split('.')[0]}</span>
                                    <span className="font-bold text-white">{log.parameter}</span>
                                    <span className="mx-2 text-slate-500">=</span>
                                    <span className={log.isAnomaly ? "text-red-400 font-bold" : "text-blue-300"}>{log.value}</span>
                                    {log.isAnomaly && <span className="ml-2 text-[10px] bg-red-600 text-white px-1 rounded">TRIP</span>}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

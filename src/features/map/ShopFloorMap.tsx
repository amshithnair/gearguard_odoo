
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../stores/useStore';
import { useNavigate } from 'react-router-dom';

export const ShopFloorMap = () => {
    const { equipment } = useStore();
    const navigate = useNavigate();

    // Mock positions for demo equipment
    const positions: Record<string, { x: number, y: number }> = {
        'eq1': { x: 200, y: 150 }, // CNC X500
        'eq5': { x: 500, y: 250 }, // KUKA Robot
        'eq3': { x: 700, y: 100 }, // Generator
    };

    return (
        <div className="p-8 h-full bg-slate-50 overflow-hidden relative">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-blue-600" />
                Shop Floor Map (Live)
            </h1>

            <div className="relative w-full h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Floor Plan SVG Background */}
                <svg width="100%" height="100%" viewBox="0 0 1000 600" className="absolute inset-0 opacity-10 pointer-events-none">
                    <path d="M50 50 H950 V550 H50 Z" fill="none" stroke="black" strokeWidth="2" />
                    <path d="M300 50 V550" stroke="black" strokeWidth="1" strokeDasharray="5,5" />
                    <path d="M650 50 V550" stroke="black" strokeWidth="1" strokeDasharray="5,5" />
                    <text x="100" y="40" fontSize="20">Production Hall</text>
                    <text x="450" y="40" fontSize="20">Assembly</text>
                    <text x="800" y="40" fontSize="20">Utility</text>
                </svg>

                {/* Equipment Dots */}
                {Object.entries(positions).map(([id, pos]) => {
                    const eq = equipment.find(e => e.id === id);
                    if (!eq) return null;

                    const isNormal = eq.healthScore > 80;

                    return (
                        <motion.button
                            key={id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            style={{ left: pos.x, top: pos.y }}
                            onClick={() => navigate(`/equipment/${id}`)}
                            className={clsx(
                                "absolute w-4 h-4 rounded-full shadow-lg ring-4 ring-white transition-colors z-10",
                                isNormal ? "bg-green-500" : "bg-red-500 animate-pulse"
                            )}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-slate-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {eq.name} ({eq.healthScore}%)
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

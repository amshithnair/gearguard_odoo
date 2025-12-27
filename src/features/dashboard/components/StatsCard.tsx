import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    subtext?: React.ReactNode;
    color: 'pink' | 'blue' | 'green';
}

// Light Mode Styles:
// Clean white cards with top colored borders or colored backgrounds
const styleMap = {
    pink: {
        borderTop: 'border-t-4 border-pink-500',
        bg: 'bg-white',
        text: 'text-slate-800',
        subtext: 'text-pink-600'
    },
    blue: {
        borderTop: 'border-t-4 border-blue-500',
        bg: 'bg-white',
        text: 'text-slate-800',
        subtext: 'text-blue-600'
    },
    green: {
        borderTop: 'border-t-4 border-emerald-500',
        bg: 'bg-white',
        text: 'text-slate-800',
        subtext: 'text-emerald-600'
    }
};

export const StatsCard = ({ title, value, subtext, color }: StatsCardProps) => {
    const theme = styleMap[color];

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0,0,0,0.1)" }}
            className={clsx(
                "relative rounded-xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm border border-slate-100",
                theme.bg,
                theme.borderTop
            )}
        >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {title}
            </h3>

            <div className="mt-auto">
                <div className={clsx("text-3xl font-bold mb-1", theme.text)}>
                    {value}
                </div>
                {subtext && (
                    <div className={clsx("text-xs font-semibold bg-slate-50 w-fit px-2 py-1 rounded-md mt-2", theme.subtext)}>
                        {subtext}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

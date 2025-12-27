import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useStore } from '../../stores/useStore';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import './calendar-overrides.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export const CalendarPage = () => {
    const { requests } = useStore();

    const events = useMemo(() => {
        return requests
            .filter(r => r.scheduledDate)
            .map(r => ({
                id: r.id,
                title: r.title,
                start: new Date(r.scheduledDate!),
                end: new Date(new Date(r.scheduledDate!).getTime() + 60 * 60 * 1000), // 1 hour duration default
                resource: r
            }));
    }, [requests]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 h-[calc(100vh-2rem)] flex flex-col"
        >
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Schedule</h1>
                <p className="text-muted-foreground mt-1">Upcoming maintenance events.</p>
            </div>

            <div className="flex-1 rounded-3xl overflow-hidden shadow-card border border-white/40 bg-white/40 backdrop-blur-xl p-6">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    className="modern-calendar"
                />
            </div>
        </motion.div>
    );
};

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';
import toast from 'react-hot-toast';

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

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchLeaves = async (range) => {
        try {
            setLoading(true);
            let url = '/leaves';
            // Simple optimization: if range is provided, pass it. 
            // react-big-calendar provides range as array [start, end] for week/day, or object {start, end} for month.
            let qs = '';
            if (range) {
                let start, end;
                if (Array.isArray(range)) {
                    start = range[0];
                    end = range[range.length - 1];
                } else {
                    start = range.start;
                    end = range.end;
                }
                qs = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
                url += qs;
            }

            const res = await api.get(url);
            const leaves = res.data.data;

            const mappedEvents = leaves.map(leave => {
                // Fix timezone shift: Force local parsing by extracting YYYY-MM-DD
                const startStr = leave.startDate.substring(0, 10);
                const endStr = leave.endDate.substring(0, 10);

                const startDate = new Date(`${startStr}T00:00:00`);
                const endDate = new Date(`${endStr}T00:00:00`);
                // Big Calendar makes end date exclusive for all-day events, so we add 1 day
                endDate.setDate(endDate.getDate() + 1);

                return {
                    id: leave._id,
                    title: `${leave.employee?.name || 'Unknown'} - ${leave.type}`,
                    start: startDate,
                    end: endDate,
                    allDay: true,
                    resource: leave,
                };
            });

            setEvents(mappedEvents);
        } catch (error) {
            toast.error('Failed to fetch calendar data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch (current month roughly)
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        fetchLeaves({ start, end });
    }, []);

    const handleRangeChange = (range) => {
        fetchLeaves(range);
    };

    const eventStyleGetter = (event) => {
        const status = event.resource.status;
        let backgroundColor = '#3b82f6'; // default blue
        if (status === 'Approved') backgroundColor = '#10b981'; // emerald
        if (status === 'Pending') backgroundColor = '#f59e0b'; // amber
        if (status === 'Rejected') backgroundColor = '#ef4444'; // red

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.95,
                color: 'white',
                border: 'none',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '2px 4px'
            }
        };
    };

    // Custom Event Renderer for premium look
    const CustomEvent = ({ event }) => (
        <div className="flex items-center space-x-2 w-full truncate">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {event.resource.employee?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="truncate text-xs font-semibold">{event.title}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col max-h-[calc(100vh-100px)]">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Organization Calendar</h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-semibold text-lg">Visually track who is out of the office and when.</p>
            </div>

            <div className="flex-1 glass-card p-4 sm:p-6 min-h-0 relative flex flex-col overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 rounded-3xl">
                {/* Decorative background glow for the calendar container */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 h-full flex flex-col">
                    {loading && events.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            className="flex-1 w-full min-h-[500px]"
                            eventPropGetter={eventStyleGetter}
                            components={{
                                event: CustomEvent
                            }}
                            onSelectEvent={(event) => setSelectedEvent(event.resource)}
                            onRangeChange={handleRangeChange}
                            views={['month', 'week', 'agenda']}
                            popup
                        />
                    )}
                </div>
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
                    <div className="bg-white/90 backdrop-blur-3xl shadow-2xl rounded-[32px] border border-white/80 max-w-lg w-full overflow-hidden transform transition-all">
                        <div className={`px-6 py-5 border-b border-white/30 flex justify-between items-center ${selectedEvent.status === 'Approved' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                            selectedEvent.status === 'Pending' ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gradient-to-r from-red-50 to-rose-50'
                            }`}>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                Leave Details
                            </h3>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white rounded-full p-1 transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Employee</p>
                                <p className="mt-1 text-sm text-gray-900 font-semibold">{selectedEvent.employee?.name} ({selectedEvent.employee?.department || 'General'})</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Type</p>
                                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${selectedEvent.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        selectedEvent.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedEvent.status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">End Date</p>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedEvent.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Reason</p>
                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{selectedEvent.reason}</p>
                            </div>
                            {selectedEvent.managerComment && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Manager Comment</p>
                                    <p className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-md border border-blue-100">{selectedEvent.managerComment}</p>
                                </div>
                            )}
                            {selectedEvent.conflictOverrideReason && (
                                <div>
                                    <p className="text-sm font-medium text-red-600 flex items-center">
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Conflict Override Reason
                                    </p>
                                    <p className="mt-1 text-sm text-red-800 bg-red-50 p-3 rounded-md border border-red-200">{selectedEvent.conflictOverrideReason}</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-white/30 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="btn btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;

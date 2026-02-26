// Helper to calculate working days between two dates
// Excludes weekends and predefined public holidays
const calculateWorkingDays = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Normalize to midnight to avoid time issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const publicHolidays = [
        '2026-01-01', // New Year
        '2026-12-25', // Christmas
        // Add more static holidays here
    ];

    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateString = currentDate.toISOString().split('T')[0];

        // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = publicHolidays.includes(dateString);

        if (!isWeekend && !isHoliday) {
            count++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
};

module.exports = { calculateWorkingDays };

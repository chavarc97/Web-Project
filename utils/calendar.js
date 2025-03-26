// implement calendar functionalities to generate days, weeks, and months according to the actual calendar

const generateDays = (startDate, endDate) => {
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
}

const generateWeeks = (startDate, endDate) => {
    const weeks = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6); // End of the week is 6 days after the start
        
        if (weekEnd > endDate) {
            weekEnd.setTime(endDate.getTime());
        }
        
        weeks.push({ start: weekStart, end: weekEnd });
        currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
    }
    
    return weeks;
}
const generateMonths = (startDate, endDate) => {
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const monthStart = new Date(currentDate);
        const monthEnd = new Date(currentDate);
        monthEnd.setMonth(monthEnd.getMonth() + 1); // End of the month is the start of the next month
        monthEnd.setDate(0); // Set to the last day of the previous month
        
        if (monthEnd > endDate) {
            monthEnd.setTime(endDate.getTime());
        }
        
        months.push({ start: monthStart, end: monthEnd });
        currentDate.setMonth(currentDate.getMonth() + 1); // Move to the next month
    }
    
    return months;
}
const getCurrentDate = () => {
    return new Date();
}
const getCurrentWeek = () => {
    const currentDate = new Date();
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return { start: firstDayOfWeek, end: new Date(currentDate) };
}

const getCurrentMonth = () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return { start: firstDayOfMonth, end: lastDayOfMonth };
}

const getCurrentYear = () => {
    const currentDate = new Date();
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);
    return { start: firstDayOfYear, end: lastDayOfYear };
}

const getDayOfWeek = (date) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getDay()];
}
const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}
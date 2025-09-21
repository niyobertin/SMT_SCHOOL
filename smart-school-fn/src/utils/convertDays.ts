export const breakdownDays = (days: number) => {
    const years = Math.floor(days / 365);
    days %= 365;

    const months = Math.floor(days / 30);
    days %= 30;

    const weeks = Math.floor(days / 7);
    days %= 7;

    return { years, months, weeks, days };
}
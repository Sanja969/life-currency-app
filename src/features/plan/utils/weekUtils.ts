export function getWeekStart(
    date: Date = new Date(),
): string {
    const result = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );

    const day = result.getDay();

    const daysSinceMonday = (day + 6) % 7;

    result.setDate(
        result.getDate() - daysSinceMonday,
    );

    const year = result.getFullYear();

    const month = String(
        result.getMonth() + 1,
    ).padStart(2, "0");

    const dayOfMonth = String(
        result.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${dayOfMonth}`;
}

export function shiftWeek(
    weekStart: string,
    weeks: number,
): string {
    const [year, month, day] =
        weekStart.split("-").map(Number);

    const date = new Date(
        year,
        month - 1,
        day + weeks * 7,
    );

    return getWeekStart(date);
}
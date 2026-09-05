export function normalizeDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }
  
  export function isSameDay(
    first: Date | string,
    second: Date | string,
  ): boolean {
    const a = normalizeDate(first);
    const b = normalizeDate(second);
  
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  
  export function formatDateHeading(date: Date): string {
    const today = new Date();
  
    if (isSameDay(date, today)) {
      return "Today";
    }
  
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
  
    if (isSameDay(date, yesterday)) {
      return "Yesterday";
    }
  
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
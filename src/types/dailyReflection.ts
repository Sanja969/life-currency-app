export type DailyReflection = {
    id: number;
    reflectionDate: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

export type SaveDailyReflectionInput = {
    reflectionDate: string;
    content: string;
};
import { dailyReflectionRepository } from "@/repositories/DailyReflectionRepository";

import type {
  DailyReflection,
  SaveDailyReflectionInput,
} from "@/types/dailyReflection";

export function getLocalDateKey(
  date: Date = new Date(),
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export class DailyReflectionService {
  async getTodayReflection(): Promise<DailyReflection | null> {
    return dailyReflectionRepository.getByDate(
      getLocalDateKey(),
    );
  }

  async getReflectionByDate(
    date: Date,
  ): Promise<DailyReflection | null> {
    return dailyReflectionRepository.getByDate(
      getLocalDateKey(date),
    );
  }

  async saveReflection(
    input: SaveDailyReflectionInput,
  ): Promise<DailyReflection> {
    const content = input.content.trim();

    if (content.length === 0) {
      throw new Error(
        "Reflection cannot be empty.",
      );
    }

    if (content.length > 2000) {
      throw new Error(
        "Reflection cannot exceed 2000 characters.",
      );
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(input.reflectionDate)) {
      throw new Error(
        "Invalid reflection date.",
      );
    }

    const [year, month, day] = input.reflectionDate
      .split("-")
      .map(Number);

    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      throw new Error("Invalid reflection date.");
    }

    return dailyReflectionRepository.save({
      reflectionDate: input.reflectionDate,
      content,
    });
  }

  async saveTodayReflection(
    content: string,
  ): Promise<DailyReflection> {
    return this.saveReflection({
      reflectionDate: getLocalDateKey(),
      content,
    });
  }

  async getRecentReflections(
    limit: number = 30,
  ): Promise<DailyReflection[]> {
    return dailyReflectionRepository.getRecent(limit);
  }

  async deleteTodayReflection(): Promise<void> {
    return dailyReflectionRepository.deleteByDate(
      getLocalDateKey(),
    );
  }
}

export const dailyReflectionService =
  new DailyReflectionService();
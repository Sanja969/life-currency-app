import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { dailyReflectionService } from "@/services/DailyReflectionService";
import { getLocalDateKey } from "@/services/DailyReflectionService";

import type { DailyReflection } from "@/types/dailyReflection";

export function useDailyReflection() {
    const [reflection, setReflection] = useState<DailyReflection | null>(null);

    const [content, setContent] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [loadedDate, setLoadedDate] = useState(getLocalDateKey());

    const loadReflection = useCallback(async () => {
        const currentDate = getLocalDateKey();

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const savedReflection =
                await dailyReflectionService.getReflectionByDate(new Date());

            setReflection(savedReflection);
            setContent(savedReflection?.content ?? "");
            setLoadedDate(currentDate);
            setIsEditing(false);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to load reflection.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadReflection();
        }, [loadReflection]),
    );

    const saveReflection = useCallback(async () => {
        const trimmedContent = content.trim();

        if (!trimmedContent) {
            setErrorMessage("Write a few words before saving.");
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const savedReflection =
                await dailyReflectionService.saveTodayReflection(trimmedContent);

            setReflection(savedReflection);
            setContent(savedReflection.content);
            setLoadedDate(savedReflection.reflectionDate);
            setIsEditing(false);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to save reflection.",
            );
        } finally {
            setIsSaving(false);
        }
    }, [content]);

    const startEditing = useCallback(() => {
        setContent(reflection?.content ?? "");
        setErrorMessage(null);
        setIsEditing(true);
    }, [reflection]);

    const cancelEditing = useCallback(() => {
        setContent(reflection?.content ?? "");
        setErrorMessage(null);
        setIsEditing(false);
    }, [reflection]);

    return {
        reflection,
        content,
        loadedDate,

        isLoading,
        isSaving,
        isEditing,

        errorMessage,

        setContent,
        saveReflection,
        startEditing,
        cancelEditing,
    };
}
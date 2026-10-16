import { useEffect, useState } from "react";

import {
    activityService,
    type QuickAddSuggestion,
} from "@/services/ActivityService";

export function useQuickAddSuggestions(enabled: boolean) {
    const [suggestions, setSuggestions] = useState<QuickAddSuggestion[]>([]);

    useEffect(() => {
        if (!enabled) {
            setSuggestions([]);
            return;
        }

        let active = true;

        async function loadSuggestions() {
            try {
                const result = await activityService.getQuickAddSuggestions(5);

                if (active) {
                    setSuggestions(result);
                }
            } catch (error) {
                console.error("Unable to load Quick Add suggestions:", error);
            }
        }

        void loadSuggestions();

        return () => {
            active = false;
        };
    }, [enabled]);

    return suggestions;
}
import { ActivityClassification } from "@/types/activity";
import { COLORS } from "./colors";

export const CLASSIFICATION_THEME = {
    [ActivityClassification.Serves]: {
        label: "Growing",
        shortLabel: "GROWING",
        color: COLORS.growing,
        coreLight: "#E4DEFF",
        background: "#1D1934",
        detailBackground: "#171527",
        gradient: {
            start: "#1C192D",
            middle: "#14131F",
            end: "#101117",
        },

        ringStrong: "rgba(130,116,232,0.45)",
        ringSoft: "rgba(130,116,232,0.16)",

        description: "Builds my life",
        energyLabel: "INVESTED IN GROWTH",
        energyDescription:
            "Time dedicated to something that helps you grow.",
        particle: {
            core: "#EDE8FF",
            glow: "rgba(130,116,232,0.22)",
            ring: "rgba(165,153,255,0.75)",
            inner: "rgba(130,116,232,0.24)",
        },
    },

    [ActivityClassification.Restores]: {
        label: "Restoring",
        shortLabel: "RESTORING",
        color: COLORS.restoring,
        coreLight: "#E0FFF8",
        background: "#142B2A",
        detailBackground: "#142B2A",
        gradient: {
            start: "#142B2A",
            middle: "#121F20",
            end: "#101719",
        },

        ringStrong: "rgba(88,199,181,0.45)",
        ringSoft: "rgba(88,199,181,0.16)",

        description: "Restores energy",
        energyLabel: "TIME SPENT RESTORING",
        energyDescription:
            "Time dedicated to rest, recovery, and restoring your energy.",
        particle: {
            core: "#E0FFF8",
            glow: "rgba(88,199,181,0.22)",
            ring: "rgba(120,230,210,0.75)",
            inner: "rgba(88,199,181,0.24)",
        },
    },

    [ActivityClassification.DoesNotServe]: {
        label: "Life Leaks",
        shortLabel: "LIFE LEAK",
        color: COLORS.leak,
        coreLight: "#FFE0CA",
        background: "#2B1D18",
        detailBackground: "#241A16",
        gradient: {
            start: "#291B18",
            middle: "#1C1515",
            end: "#111114",
        },

        ringStrong: "rgba(216,132,85,0.45)",
        ringSoft: "rgba(216,132,85,0.16)",

        description: "Drains energy",
        energyLabel: "SPENT ON A LIFE LEAK",
        energyDescription:
            "Time spent on something you've marked as draining.",
        particle: {
            core: "#FFE9DA",
            glow: "rgba(216,132,85,0.22)",
            ring: "rgba(240,171,128,0.75)",
            inner: "rgba(216,132,85,0.24)",
        },
    },
} as const;
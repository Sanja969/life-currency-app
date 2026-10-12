export type DailyThought = {
    id: string;
    quote: string;
    author: string;
    source: string;
    category: "physics" | "philosophy" | "psychology" | "cinema";
    explanation: string;
    reflection: string;
};

export const DAILY_THOUGHTS: DailyThought[] = [
    {
        id: "einstein-time",
        quote:
            "The distinction between past, present and future is only a stubbornly persistent illusion.",
        author: "Albert Einstein",
        source: "Letter to the family of Michele Besso, 1955",
        category: "physics",
        explanation:
            "Einstein's theory of relativity challenges the idea of one universal present. " +
            "Observers can disagree about whether distant events happen simultaneously. " +
            "This does not mean that our experience of time is meaningless, but that time is more complex than everyday intuition suggests.",
        reflection:
            "If time is not as simple as it feels, what makes this particular moment meaningful to you?",
    },
    {
        id: "marcus-life",
        quote:
            "It is not death that a man should fear, but he should fear never beginning to live.",
        author: "Marcus Aurelius",
        source: "Meditations, Book XII, 1 — traditional English rendering",
        category: "philosophy",
        explanation:
            "Marcus Aurelius reminds us that the quality of our lives matters more than simply counting the years. " +
            "In Stoic philosophy, living well means acting consciously and in accordance with our values.",
        reflection:
            "What would living more fully look like for you today?",
    },
    {
        id: "seneca-life",
        quote:
            "It is not that we have a short time to live, but that we waste a lot of it.",
        author: "Seneca",
        source: "On the Shortness of Life, 1.1 — English translation",
        category: "philosophy",
        explanation:
            "Seneca argues that the problem is not simply how much time we receive, but how we use it. " +
            "His writing encourages us to notice where our attention goes and whether our choices reflect what matters.",
        reflection:
            "Which part of your day deserves more of your attention?",
    },
    {
        id: "jupiter-time",
        quote:
            "Time is the single most precious commodity in the universe.",
        author: "Jupiter Ascending",
        source: "Film, 2015",
        category: "cinema",
        explanation:
            "In Jupiter Ascending, time is treated as an extraordinarily valuable resource. " +
            "Outside the film's fictional universe, the idea raises a powerful question: " +
            "if our time is limited, what deserves to receive it?",
        reflection:
            "What did you exchange your time for today?",
    },
    {
        id: "heraclitus-river",
        quote:
            "You cannot step into the same river twice.",
        author: "Heraclitus",
        source: "Traditional paraphrase of fragments on change",
        category: "philosophy",
        explanation:
            "Heraclitus is associated with the idea that reality is constantly changing. " +
            "The river changes, and so does the person entering it. " +
            "Life Currency reflects a similar idea: our days are not isolated events, but part of an ongoing transformation.",
        reflection:
            "How are you different from the person you were a year ago?",
    },
];

/**
 * Returns a deterministic thought for a calendar day.
 *
 * Uses the local calendar date rather than UTC, so the thought
 * changes at the user's local midnight.
 */
export function getDailyThought(date = new Date()): DailyThought {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const startOfYear = new Date(year, 0, 1);
    const currentDay = new Date(year, month, day);

    const dayOfYear =
        Math.round(
            (Date.UTC(
                currentDay.getFullYear(),
                currentDay.getMonth(),
                currentDay.getDate(),
            ) -
                Date.UTC(
                    startOfYear.getFullYear(),
                    startOfYear.getMonth(),
                    startOfYear.getDate(),
                )) /
            86_400_000,
        ) + 1;

    const index = (dayOfYear - 1) % DAILY_THOUGHTS.length;

    return DAILY_THOUGHTS[index];
}
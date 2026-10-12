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
    // =========================================================
    // PHILOSOPHY — TIME, CHANGE & LIFE
    // =========================================================

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

    // =========================================================
    // STOICISM
    // =========================================================

    {
        id: "stoic-control",
        quote:
            "Some things are within our control, and others are not.",
        author: "Epictetus",
        source: "Enchiridion, 1 — adapted translation",
        category: "philosophy",
        explanation:
            "Epictetus begins his philosophy by distinguishing what depends on us from what does not. " +
            "Our attention, judgments and choices are more directly within our influence than external events.",
        reflection:
            "Where could you redirect your energy toward something you can actually influence?",
    },

    {
        id: "stoic-present",
        quote:
            "Confine yourself to the present.",
        author: "Marcus Aurelius",
        source: "Meditations — traditional English rendering",
        category: "philosophy",
        explanation:
            "Stoic philosophy repeatedly returns to the present moment as the place where action becomes possible. " +
            "The past cannot be changed, and the future is uncertain, but our next choice remains available.",
        reflection:
            "What deserves your attention right now?",
    },

    {
        id: "seneca-living",
        quote:
            "Life is long if you know how to use it.",
        author: "Seneca",
        source: "On the Shortness of Life, 2.1 — English rendering",
        category: "philosophy",
        explanation:
            "Seneca challenges the assumption that a meaningful life requires more years. " +
            "He suggests that depth, purpose and conscious choices matter more than the simple passage of time.",
        reflection:
            "What would make today feel like time well spent?",
    },

    // =========================================================
    // JUNGIAN PSYCHOLOGY — ORIGINAL REFLECTIONS
    // =========================================================

    {
        id: "jung-awareness",
        quote:
            "What you refuse to notice can quietly shape the life you live.",
        author: "Life Currency",
        source: "Original reflection inspired by Jungian psychology",
        category: "psychology",
        explanation:
            "Carl Jung explored how unconscious patterns can influence our behavior. " +
            "This reflection invites us to observe recurring habits without immediately judging them. " +
            "Awareness creates an opportunity to respond differently.",
        reflection:
            "Which recurring habit in your life deserves more attention?",
    },

    {
        id: "jung-shadow",
        quote:
            "Growth begins when you become curious about the parts of yourself you usually avoid.",
        author: "Life Currency",
        source: "Original reflection inspired by Jung's concept of the shadow",
        category: "psychology",
        explanation:
            "In Jungian psychology, the shadow represents aspects of ourselves that we may reject or overlook. " +
            "Exploring these aspects can deepen self-understanding and help us recognize patterns in our choices.",
        reflection:
            "Is there something about your daily habits that you have been reluctant to acknowledge?",
    },

    {
        id: "jung-individuation",
        quote:
            "Becoming yourself is not a destination, but a process of discovery.",
        author: "Life Currency",
        source: "Original reflection inspired by Jung's concept of individuation",
        category: "psychology",
        explanation:
            "Jung described individuation as a process of developing a more integrated sense of self. " +
            "Rather than pursuing an idealized version of ourselves, we can gradually understand our needs, values and contradictions.",
        reflection:
            "What have you recently discovered about yourself?",
    },

    {
        id: "jung-patterns",
        quote:
            "The patterns you notice are the patterns you can begin to change.",
        author: "Life Currency",
        source: "Original reflection inspired by analytical psychology",
        category: "psychology",
        explanation:
            "Repeated behaviors often become so familiar that we stop noticing them. " +
            "Recording how we spend our time can reveal patterns that might otherwise remain invisible.",
        reflection:
            "What pattern has become more visible since you started paying attention to your time?",
    },

    // =========================================================
    // TAOISM
    // =========================================================

    {
        id: "tao-flow",
        quote:
            "Not every moment needs to be forced into productivity.",
        author: "Life Currency",
        source: "Original reflection inspired by Taoist philosophy",
        category: "philosophy",
        explanation:
            "Taoism often emphasizes harmony with the natural movement of life. " +
            "The concept of wu wei is sometimes understood as effortless or non-forcing action. " +
            "It does not mean doing nothing, but acting without unnecessary struggle.",
        reflection:
            "Where in your life might less effort create more harmony?",
    },

    {
        id: "tao-stillness",
        quote:
            "Stillness is not the absence of life. It is another way of experiencing it.",
        author: "Life Currency",
        source: "Original reflection inspired by Taoist thought",
        category: "philosophy",
        explanation:
            "Quiet moments can allow us to notice experiences that constant activity obscures. " +
            "Rest does not have to justify itself through future productivity.",
        reflection:
            "When did you last allow yourself to be still without feeling that you should be doing something?",
    },

    {
        id: "tao-nature",
        quote:
            "A river does not hurry, yet it continues to move.",
        author: "Life Currency",
        source: "Original metaphor inspired by Taoist philosophy",
        category: "philosophy",
        explanation:
            "Natural processes often unfold gradually. " +
            "This metaphor invites us to consider whether meaningful progress always requires urgency.",
        reflection:
            "What could you allow to develop at its own pace?",
    },

    {
        id: "tao-balance",
        quote:
            "A balanced life makes room for both movement and rest.",
        author: "Life Currency",
        source: "Original reflection inspired by Taoist ideas of balance",
        category: "philosophy",
        explanation:
            "Activity and rest are not necessarily opposites. " +
            "They can support one another, and our needs may change from one day to the next.",
        reflection:
            "Does your current routine leave enough room for both effort and renewal?",
    },

    // =========================================================
    // GNOSTICISM — ORIGINAL REFLECTIONS
    // =========================================================

    {
        id: "gnostic-knowledge",
        quote:
            "Understanding yourself can change the way you experience the world.",
        author: "Life Currency",
        source: "Original reflection inspired by themes of gnosis",
        category: "philosophy",
        explanation:
            "Several ancient movements now grouped under the term Gnosticism emphasized forms of spiritual knowledge. " +
            "This modern reflection draws on the broader theme of self-knowledge without presenting it as a historical quotation.",
        reflection:
            "What have you learned about yourself through your recent choices?",
    },

    {
        id: "gnostic-awakening",
        quote:
            "Awareness begins when you question what once seemed automatic.",
        author: "Life Currency",
        source: "Original reflection inspired by Gnostic themes of awakening",
        category: "philosophy",
        explanation:
            "Gnostic traditions differed considerably, but many explored themes of ignorance, insight and awakening. " +
            "In everyday life, questioning automatic habits can help us make more deliberate choices.",
        reflection:
            "Which part of your routine have you never really questioned?",
    },

    {
        id: "gnostic-inner-world",
        quote:
            "The world you experience is shaped partly by what you learn to notice.",
        author: "Life Currency",
        source: "Original reflection inspired by self-knowledge traditions",
        category: "psychology",
        explanation:
            "Our attention influences which aspects of experience become most prominent to us. " +
            "This does not mean that attention creates external reality, but that it shapes our awareness of it.",
        reflection:
            "What has been occupying most of your attention lately?",
    },

    // =========================================================
    // ATTENTION, INTENTION & TIME
    // =========================================================

    {
        id: "attention-life",
        quote:
            "Your attention is one of the ways you give your life direction.",
        author: "Life Currency",
        source: "Original reflection on attention",
        category: "psychology",
        explanation:
            "Attention is limited, and what repeatedly receives it can influence our habits, learning and experiences. " +
            "Noticing where attention goes can help us make choices that better reflect our priorities.",
        reflection:
            "What received most of your attention today?",
    },

    {
        id: "time-choices",
        quote:
            "A life is shaped not only by major decisions, but by ordinary hours.",
        author: "Life Currency",
        source: "Original reflection on everyday choices",
        category: "philosophy",
        explanation:
            "Many meaningful changes develop through repeated small actions. " +
            "The way we spend ordinary days can gradually influence our relationships, skills and well-being.",
        reflection:
            "Which ordinary part of your day would you like to experience differently?",
    },

    {
        id: "rest-value",
        quote:
            "Rest is not time taken away from life. Rest is part of life.",
        author: "Life Currency",
        source: "Original reflection on rest and renewal",
        category: "psychology",
        explanation:
            "Rest is a legitimate human need, not merely a reward for productivity. " +
            "Different forms of restoration may include sleep, solitude, movement, creativity or connection.",
        reflection:
            "What genuinely restores you, beyond simply taking a break?",
    },

    {
        id: "small-moments",
        quote:
            "The moments that matter most are not always the ones we planned.",
        author: "Life Currency",
        source: "Original reflection on meaningful experiences",
        category: "philosophy",
        explanation:
            "Unexpected conversations, quiet experiences and small acts of kindness can become meaningful memories. " +
            "A valuable life cannot be reduced to a perfectly optimized schedule.",
        reflection:
            "What unplanned moment recently meant something to you?",
    },

    {
        id: "presence",
        quote:
            "Being present means allowing this moment to be more than a bridge to the next.",
        author: "Life Currency",
        source: "Original reflection on presence",
        category: "philosophy",
        explanation:
            "It is easy to treat each activity as preparation for something else. " +
            "Presence invites us to recognize that our current experience also has value.",
        reflection:
            "Which moment today would you like to experience more fully?",
    },

    {
        id: "energy-direction",
        quote:
            "Not everything that fills your schedule nourishes your life.",
        author: "Life Currency",
        source: "Original reflection on priorities",
        category: "psychology",
        explanation:
            "A busy schedule does not necessarily reflect our deepest priorities. " +
            "Looking at how activities affect us can reveal differences between being occupied and feeling fulfilled.",
        reflection:
            "Which activity takes your time without giving you much in return?",
    },

    {
        id: "intentional-living",
        quote:
            "An intentional life is built through choices you are willing to notice.",
        author: "Life Currency",
        source: "Original reflection on intentional living",
        category: "philosophy",
        explanation:
            "Intentional living does not require perfect discipline. " +
            "It begins with recognizing our choices and understanding why certain activities matter to us.",
        reflection:
            "Which choice today felt most aligned with your values?",
    },

    {
        id: "growth-patience",
        quote:
            "Growth can be happening even when you cannot yet see the result.",
        author: "Life Currency",
        source: "Original reflection on gradual development",
        category: "psychology",
        explanation:
            "Learning and personal development are often gradual processes. " +
            "A single day may not reveal much, but patterns across weeks and months can show meaningful changes.",
        reflection:
            "What are you patiently building in your life?",
    },

    {
        id: "connection",
        quote:
            "Some of the best uses of time cannot be measured by achievement.",
        author: "Life Currency",
        source: "Original reflection on relationships and connection",
        category: "philosophy",
        explanation:
            "Time spent listening, caring, laughing or simply being with others can have value independent of productivity. " +
            "Life Currency is about understanding time, not turning every moment into a task.",
        reflection:
            "Who or what made your time feel meaningful recently?",
    },

    {
        id: "morphic-patterns",
        quote:
            "The patterns we repeat can become the paths we follow most easily.",
        author: "Life Currency",
        source:
            "Original reflection on habit formation; thematically inspired by Rupert Sheldrake's morphic resonance hypothesis",
        category: "psychology",
        explanation:
            "Repeated behaviors can become familiar through learning and habit formation. " +
            "Rupert Sheldrake has proposed a separate hypothesis called morphic resonance, but it is not established scientific theory. " +
            "This reflection concerns everyday habits rather than presenting that hypothesis as fact.",
        reflection:
            "Which repeated action is shaping the direction of your days?",
    },

    {
        id: "life-currency",
        quote:
            "You cannot save yesterday's hours, but you can choose what tomorrow receives.",
        author: "Life Currency",
        source: "Original Life Currency reflection",
        category: "philosophy",
        explanation:
            "Time passes whether we pay attention to it or not. " +
            "Recording activities is not about controlling every minute, but about seeing our patterns and making more conscious decisions.",
        reflection:
            "What deserves a little more of your time tomorrow?",
    },
];

/**
 * Returns a stable, pseudo-random thought for a local calendar day.
 *
 * The thought stays the same throughout the day,
 * including after restarting the app.
 *
 * No storage or external API required.
 */
export function getDailyThought(date = new Date()): DailyThought {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    let hash = 2166136261;

    for (let i = 0; i < dateKey.length; i++) {
        hash ^= dateKey.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    const index = (hash >>> 0) % DAILY_THOUGHTS.length;

    return DAILY_THOUGHTS[index];
}
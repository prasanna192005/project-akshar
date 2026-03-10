export const PROMPTS = {
    tech: [
        "The process of software engineering involves the design, development, and maintenance of software systems. It requires a deep understanding of algorithms, data structures, and computer architecture. Developers must also be proficient in various programming languages and version control systems.",
        "Cloud computing has revolutionized the way we store and process data. By utilizing remote servers hosted on the internet, companies can scale their infrastructure dynamically and reduce costs. Services like serverless computing and containerization have further simplified deployment pipelines.",
        "Artificial intelligence and machine learning are transforming industries by enabling computers to learn from data. Deep learning models, particularly neural networks, are being used for image recognition, natural language processing, and autonomous driving.",
        "Web development has evolved from static HTML pages to dynamic, interactive applications. Modern frameworks like React and Next.js allow developers to build performant user interfaces with reusable components and efficient state management."
    ],
    lore: [
        "In the unified network of AKSHAR, elite operatives are deployed to secure high-value data sectors. Each operative, from the neon streets of Delhi to the ancient ghats of Varanasi, wields specialized tactical abilities to gain the upper hand in the relentless pursuit of information dominance.",
        "The emergence of Radianite tech has birthed a new breed of tactical racers. These operatives, trained in the harshest environments of the Indian subcontinent, utilize localized phenomenon—from Mumbai's rhythmic flames to Bangalore's architectural AI—to rewrite the rules of the grid.",
        "Vayu streaks across the Delhi skyline, a blur of aerodynamic precision. Agni commands the rebellious fires of Mumbai, while Sutra maintains the ancient linguistic balance of Kerala. Together, they form the vanguard of the Sector 7 defense initiative.",
        "Chhaya haunts the mist-shrouded ghats of Varanasi, striking from the void. Visha deploys lethal biochemical logic from the heart of Bhopal, and Bijli shatters any defensive firewall with the raw bionic power of Punjab's wrestling heritage.",
        "Kali harvests tactical soul-data from the tea estates of Assam, turning enemy mistakes into raw speed. Yantra, the rogue genius of Bangalore, deploys turret-based logic gates to lock down any contested domain before the opposition can even react."
    ],
    quotes: [
        "To be or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
        "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith, knowing that the future is as bright as we make it.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. It is during our darkest moments that we must focus to see the light.",
        "In the middle of difficulty lies opportunity. The best way to predict the future is to create it. Live as if you were to die tomorrow. Learn as if you were to live forever."
    ],
    random: [
        "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the alphabet at least once, making it a popular choice for testing typewriters and computer keyboards.",
        "A journey of a thousand miles begins with a single step. Small, consistent efforts lead to great achievements over time. Stay focused on your goals and never give up on your dreams.",
        "The sun rose over the horizon, casting a golden glow across the quiet valley. The air was crisp and fresh, filled with the scent of pine needles and damp earth. A new day had begun, full of endless possibilities.",
        "The sound of rain tapping against the windowpane was soothing and rhythmic. Inside, the fireplace crackled, warming the room with its gentle heat. It was the perfect afternoon for reading a book and sipping hot cocoa."
    ]
};

export type PromptCategory = keyof typeof PROMPTS;

export const getRandomPrompt = (category: PromptCategory) => {
    const pool = PROMPTS[category];
    return pool[Math.floor(Math.random() * pool.length)];
};

export const PROMPTS = {
    tech: [
        "The process of software engineering involves the design, development, and maintenance of software systems. It requires a deep understanding of algorithms, data structures, and computer architecture. Developers must also be proficient in various programming languages and version control systems.",
        "Cloud computing has revolutionized the way we store and process data. By utilizing remote servers hosted on the internet, companies can scale their infrastructure dynamically and reduce costs. Services like serverless computing and containerization have further simplified deployment pipelines.",
        "Artificial intelligence and machine learning are transforming industries by enabling computers to learn from data. Deep learning models, particularly neural networks, are being used for image recognition, natural language processing, and autonomous driving.",
        "Web development has evolved from static HTML pages to dynamic, interactive applications. Modern frameworks like React and Next.js allow developers to build performant user interfaces with reusable components and efficient state management.",
        "Quantum computing leverages the principles of superposition and entanglement to perform calculations at speeds unattainable by classical computers. While still in its infancy, quantum supremacy could shatter modern encryption standard and solve complex optimization problems.",
        "Edge computing decentralized data processing, bringing computation closer to the source of data generation. This reduces latency and bandwidth usage, which is critical for real-time applications like autonomous vehicles, industrial IoT, and tactical signal processing.",
        "Cybersecurity is a continuous battle between system defenders and sophisticated threat actors. Zero-trust architecture, multi-factor authentication, and automated threat detection are essential components of a modern defensive posture against ransomware and phishing.",
        "DevOps bridges the gap between development and operations teams, fostering a culture of collaboration and automation. Continuous integration and continuous deployment pipelines enable rapid feature delivery while maintaining high reliability and performance."
    ],
    lore: [
        "In the unified network of AKSHAR, elite operatives are deployed to secure high-value data sectors. Each operative, from the neon streets of Delhi to the ancient ghats of Varanasi, wields specialized tactical abilities to gain the upper hand in the relentless pursuit of information dominance.",
        "The emergence of Radianite tech has birthed a new breed of tactical racers. These operatives, trained in the harshest environments of the Indian subcontinent, utilize localized phenomenon—from Mumbai's rhythmic flames to Bangalore's architectural AI—to rewrite the rules of the grid.",
        "Vayu streaks across the Delhi skyline, a blur of aerodynamic precision. Agni commands the rebellious fires of Mumbai, while Sutra maintains the ancient linguistic balance of Kerala. Together, they form the vanguard of the Sector 7 defense initiative.",
        "Chhaya haunts the mist-shrouded ghats of Varanasi, striking from the void. Visha deploys lethal biochemical logic from the heart of Bhopal, and Bijli shatters any defensive firewall with the raw bionic power of Punjab's wrestling heritage.",
        "Kali harvests tactical soul-data from the tea estates of Assam, turning enemy mistakes into raw speed. Yantra, the rogue genius of Bangalore, deploys turret-based logic gates to lock down any contested domain before the opposition can even react.",
        "The Jaisalmer Incident shattered the silence of the Thar Desert, leaving behind a network of anomalous signals. AKSHAR technicians worked tirelessly to isolate the frequency, discovering a linguistic gateway that could only be accessed through hyper-speed data entry.",
        "Strategic Sector 09, once a bustling tech hub in Hyderabad, now serves as the primary testing ground for the Neural Uplink. Operatives must traverse the holographic ruins of the old city while dodging static interference patterns left by the initial breach.",
        "The legend of the Eternal Script tells of a pre-digital language that can theoretically bypass any encryption. AKSHAR's directive is to piece together this fragmented code before the shadow syndicates can weaponize its raw computational power.",
        "Deep within the Western Ghats, the Bio-Sync facility remains operational despite the total blackout. Specialized drones report rhythmic pulses of green energy, suggesting that the region's biodiversity is merging with the leftover nanites from the global reset."
    ],
    quotes: [
        "To be or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
        "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith, knowing that the future is as bright as we make it.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. It is during our darkest moments that we must focus to see the light.",
        "In the middle of difficulty lies opportunity. The best way to predict the future is to create it. Live as if you were to die tomorrow. Learn as if you were to live forever.",
        "The greatest glory in living lies not in never falling, but in rising every time we fall. Your time is limited, so don't waste it living someone else's life. If you look at what you have in life, you'll always have more.",
        "The future belongs to those who believe in the beauty of their dreams. It does not matter how slowly you go as long as you do not stop. Spread love everywhere you go. Let no one ever come to you without leaving happier.",
        "Do not go where the path may lead, go instead where there is no path and leave a trail. Many of life's failures are people who did not realize how close they were to success when they gave up.",
        "Believe you can and you're halfway there. The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it."
    ],
    random: [
        "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the alphabet at least once, making it a popular choice for testing typewriters and computer keyboards.",
        "A journey of a thousand miles begins with a single step. Small, consistent efforts lead to great achievements over time. Stay focused on your goals and never give up on your dreams.",
        "The sun rose over the horizon, casting a golden glow across the quiet valley. The air was crisp and fresh, filled with the scent of pine needles and damp earth. A new day had begun, full of endless possibilities.",
        "The sound of rain tapping against the windowpane was soothing and rhythmic. Inside, the fireplace crackled, warming the room with its gentle heat. It was the perfect afternoon for reading a book and sipping hot cocoa.",
        "The old oak tree stood as a silent witness to the passing of time. Its gnarled branches reaching out like ancient hands, clutching at the fading memories of a forgotten era. Seasons changed, but the tree remained steadfast and proud.",
        "In the heart of the bustling city, a small secret garden offered a sanctuary for weary souls. Behind heavy rusted gates, vibrant flowers bloomed in defiance of the gray concrete jungle. It was a place where time seemed to stand still.",
        "The lighthouse tower beacon pierced through the thick fog, guiding lost ships toward the safety of the harbor. Its rhythmic beam was a symbol of hope and persistence for the sailors braving the unforgiving depths of the northern sea.",
        "A single spark can ignite a fire that illuminates the darkness. In the quiet corners of the mind, new ideas are born from the friction of curiosity and courage, eventually growing into theories that reshape our understanding of the world."
    ]
};

export type PromptCategory = keyof typeof PROMPTS;

export const getRandomPrompt = (category: PromptCategory, excludePrompt?: string) => {
    const pool = PROMPTS[category];
    if (pool.length <= 1) return pool[0];

    let selection = pool[Math.floor(Math.random() * pool.length)];
    while (selection === excludePrompt) {
        selection = pool[Math.floor(Math.random() * pool.length)];
    }
    return selection;
};

export function seededShuffle<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    const random = (min: number, max: number) => {
        const x = Math.sin(seed++) * 10000;
        return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
    };

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = random(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
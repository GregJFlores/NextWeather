const rateMap = new Map<string, { count: number; last: number }>();
const LIMIT = 10; // requests
const WINDOW = 60_000; // 1 min

export const rateLimiter = {
    check(ip: string) {
        const now = Date.now();
        const entry = rateMap.get(ip) ?? { count: 0, last: now };

        if (now - entry.last > WINDOW) {
            entry.count = 0;
            entry.last = now;
        }

        entry.count += 1;
        rateMap.set(ip, entry);

        return entry.count <= LIMIT;
    },
};

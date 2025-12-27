import { useLiveQuery } from '@electric-sql/pglite-react';
import { db } from '../db/client';

export function useDbQuery<T = any>(query: string, params?: any[]) {
    // If we want real-time updates for complex joins, live query is best.
    // However, PGlite live query parameter handling can be tricky if params change often.
    // For now, let's assume static or simple queries.
    const result = useLiveQuery<T>(query, params);

    return {
        data: result?.rows || [],
        isLoading: result === undefined, // or check internal state
        error: null // LiveQuery doesn't expose error easily in this version wrapper, but try/catch inside likely
    };
}

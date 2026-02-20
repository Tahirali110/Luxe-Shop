import { useRef, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Generic Admin Search — Trie DSA + Map cache
//
// Why a generic hook instead of page-specific ones?
//   - Each admin page searches different fields (name, email, order ID, etc.)
//   - A generic hook with a `getTokens` callback avoids duplicated Trie logic.
//   - The caller decides which fields are searchable; the hook handles the DSA.
//
// Complexity:
//   - Build (once per items change): O(n * k * m)
//       n = items, k = avg tokens per item, m = avg token length
//   - Search: O(m) where m = query length — independent of list size
//   - Repeated query: O(1) via Map cache
// ---------------------------------------------------------------------------

// ---- Trie internals --------------------------------------------------------

class TrieNode<T> {
    children: Map<string, TrieNode<T>> = new Map();
    // Items attached at this prefix depth — collecting them is O(1)
    items: Set<T> = new Set();
}

class AdminSearchTrie<T> {
    private root: TrieNode<T> = new TrieNode<T>();

    /**
     * Insert an item by its search tokens.
     * Each token is inserted character-by-character so that any prefix of a
     * token (e.g. "joh" for "john") will match the item at search time.
     */
    insert(item: T, tokens: string[]): void {
        for (const token of tokens) {
            const lower = token.toLowerCase();
            let node = this.root;
            for (const char of lower) {
                if (!node.children.has(char)) {
                    node.children.set(char, new TrieNode<T>());
                }
                node = node.children.get(char)!;
                // Attach item at every prefix node for O(1) retrieval later
                node.items.add(item);
            }
        }
    }

    /**
     * Prefix search: traverse the Trie one char at a time.
     * Returns all items that have at least one token starting with `query`.
     */
    search(query: string): T[] {
        let node = this.root;
        for (const char of query.toLowerCase()) {
            if (!node.children.has(char)) return [];
            node = node.children.get(char)!;
        }
        return Array.from(node.items);
    }
}

// ---- Public hook -----------------------------------------------------------

/**
 * useAdminSearch — generic Trie prefix search for admin list pages.
 *
 * @param items       Full list of items to search (e.g. products, orders).
 * @param query       Current search query string from the input.
 * @param getTokens   Function that extracts the searchable string tokens for
 *                    a single item (e.g. `p => [p.name, p.description]`).
 *                    Return only the fields the user expects to search by.
 *
 * @returns Filtered list of items matching the query prefix.
 *          Returns the full `items` array when query is shorter than 2 chars.
 *
 * @example
 * // In Products.tsx:
 * const searched = useAdminSearch(products, searchQuery, p => [p.name, p.description]);
 *
 * // In Orders.tsx:
 * const searched = useAdminSearch(orders, searchQuery,
 *   o => [o._id, o.customerName ?? '', o.customerEmail ?? '']);
 */
export function useAdminSearch<T>(
    items: T[],
    query: string,
    getTokens: (item: T) => string[],
): T[] {
    // Holds the Trie + the items reference it was built from.
    // Using useRef so the Trie object persists across re-renders without
    // triggering re-renders itself.
    const trieRef = useRef<{ trie: AdminSearchTrie<T>; items: T[] } | null>(null);

    // Per-component query result cache (Map DSA) — O(1) for repeated queries
    const queryCache = useRef<Map<string, T[]>>(new Map());

    return useMemo(() => {
        const trimmed = query.trim().toLowerCase();

        // Return all items for very short queries to avoid jarring UX
        if (trimmed.length < 2) return items;

        // Rebuild Trie only when the items array reference changes
        if (!trieRef.current || trieRef.current.items !== items) {
            const trie = new AdminSearchTrie<T>();
            for (const item of items) {
                // Filter out empty strings to keep the Trie clean
                const tokens = getTokens(item).filter(Boolean);
                trie.insert(item, tokens);
            }
            trieRef.current = { trie, items };
            // Invalidate cache when items change
            queryCache.current.clear();
        }

        // Map cache: O(1) lookup for repeated identical queries
        if (queryCache.current.has(trimmed)) {
            return queryCache.current.get(trimmed)!;
        }

        // Cache miss: O(m) Trie lookup
        const result = trieRef.current.trie.search(trimmed);
        queryCache.current.set(trimmed, result);
        return result;
    }, [items, query, getTokens]);
}

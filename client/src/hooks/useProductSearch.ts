import { useMemo, useRef } from 'react';
import { Product } from '@/types/product';

// ---------------------------------------------------------------------------
// Trie Data Structure
// ---------------------------------------------------------------------------
// A Trie (prefix tree) stores words character-by-character in a tree.
// Inserting a word is O(m) where m = word length.
// Searching by prefix is also O(m) — much faster than a linear scan O(n*m)
// over the full product list, especially as the catalogue grows.
// ---------------------------------------------------------------------------

class TrieNode {
    // Each character maps to its child node
    children: Map<string, TrieNode> = new Map();
    // All products reachable via this prefix node (accumulated on insert)
    products: Set<Product> = new Set();
}

class ProductSearchTrie {
    private root: TrieNode = new TrieNode();

    /**
     * Insert a product into the Trie.
     * Tokenises name + category into words and inserts each word separately,
     * so users can search by any word prefix in the product name or category.
     * Example: "Luxury Watch" → inserts tokens "luxury" and "watch".
     * Complexity: O(k * m) where k = number of tokens, m = avg token length.
     */
    insert(product: Product): void {
        const tokens = `${product.name} ${product.category}`
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        for (const token of tokens) {
            let node = this.root;
            for (const char of token) {
                if (!node.children.has(char)) {
                    node.children.set(char, new TrieNode());
                }
                node = node.children.get(char)!;
                // Attach this product at every prefix node so retrieval is O(m):
                // when we reach the end of the query string, results are already there.
                node.products.add(product);
            }
        }
    }

    /**
     * Search for products matching a given prefix.
     * Complexity: O(m) where m = query length, regardless of catalogue size.
     */
    search(query: string): Product[] {
        let node = this.root;
        for (const char of query.toLowerCase()) {
            if (!node.children.has(char)) {
                return []; // No products match this prefix
            }
            node = node.children.get(char)!;
        }
        return Array.from(node.products);
    }
}

// ---------------------------------------------------------------------------
// useProductSearch — Custom Hook
// ---------------------------------------------------------------------------

/**
 * Builds a Trie from the given products list (once per products change),
 * then returns a filtered list based on the current search query.
 *
 * The Trie is built synchronously inside useMemo so that both the build
 * and the search happen in the same render cycle. This is safe because
 * the build cost (O(n*k*m)) happens only when `products` reference changes,
 * which is rare (typically only once after the initial API fetch).
 *
 * @param products  - Full list of products fetched from the server
 * @param query     - The current search string from the user
 * @returns         - Filtered products matching the query prefix
 */
export function useProductSearch(products: Product[], query: string): Product[] {
    // Cache the last built Trie so it is not rebuilt on every query change —
    // only when the products array reference itself changes.
    const trieRef = useRef<{ trie: ProductSearchTrie; products: Product[] } | null>(null);

    return useMemo(() => {
        const trimmed = query.trim();

        // Build (or rebuild) the Trie when the products reference changes.
        // This is an O(n*k*m) operation but only runs once per product list update.
        if (!trieRef.current || trieRef.current.products !== products) {
            const trie = new ProductSearchTrie();
            for (const product of products) {
                trie.insert(product);
            }
            trieRef.current = { trie, products };
        }

        // Return all products when the query is empty or too short — no filter applied
        if (trimmed.length < 2) {
            return products;
        }

        // Trie lookup: O(m) where m = trimmed query length
        return trieRef.current.trie.search(trimmed);
    }, [products, query]);
}

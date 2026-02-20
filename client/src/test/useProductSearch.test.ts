import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductSearch } from '../hooks/useProductSearch';
import { Product } from '../types/product';

// ---------------------------------------------------------------------------
// Minimal mock products for Trie testing
// ---------------------------------------------------------------------------
const mockProducts: Product[] = [
    {
        _id: 'p1',
        name: 'Luxury Watch',
        description: 'A premium timepiece',
        category: 'Accessories',
        price: 299,
        stock: 10,
    },
    {
        _id: 'p2',
        name: 'Leather Jacket',
        description: 'Premium full-grain leather',
        category: 'Clothing',
        price: 199,
        stock: 5,
    },
    {
        _id: 'p3',
        name: 'Wireless Headphones',
        description: 'Noise cancelling audio',
        category: 'Electronics',
        price: 149,
        stock: 20,
    },
    {
        _id: 'p4',
        name: 'Silk Scarf',
        description: 'Lightweight silk accessory',
        category: 'Clothing',
        price: 89,
        stock: 15,
    },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useProductSearch (Trie)', () => {

    it('returns all products when query is empty', () => {
        // An empty query should short-circuit the Trie and return the full list
        const { result } = renderHook(() => useProductSearch(mockProducts, ''));
        expect(result.current.length).toBe(mockProducts.length);
    });

    it('returns all products when query is shorter than 2 chars (ProductGrid threshold)', () => {
        // useProductSearch returns all for < 2 chars — used by ProductGrid.
        // Note: SmartSearch has its own Trie (module-level singleton) and shows
        // results from 1 char, handled separately in the component layer.
        const { result } = renderHook(() => useProductSearch(mockProducts, 'L'));
        expect(result.current.length).toBe(mockProducts.length);
    });

    it('finds a product by exact name prefix', () => {
        // "lux" should match "Luxury Watch" (inserted as the token "luxury")
        const { result } = renderHook(() => useProductSearch(mockProducts, 'lux'));
        const names = result.current.map((p) => p.name);
        expect(names).toContain('Luxury Watch');
    });

    it('finds products by category prefix', () => {
        // "acc" is a prefix of "Accessories" which is tokenised and inserted into the Trie
        const { result } = renderHook(() => useProductSearch(mockProducts, 'acc'));
        const names = result.current.map((p) => p.name);
        expect(names).toContain('Luxury Watch'); // category = Accessories
    });

    it('finds products by full word in the name', () => {
        // "jacket" maps to "Leather Jacket"
        const { result } = renderHook(() => useProductSearch(mockProducts, 'jacket'));
        const names = result.current.map((p) => p.name);
        expect(names).toContain('Leather Jacket');
        expect(names).not.toContain('Luxury Watch');
    });

    it('is case-insensitive', () => {
        // Input casing should not matter — the Trie stores everything lowercased
        const { result } = renderHook(() => useProductSearch(mockProducts, 'WIRE'));
        const names = result.current.map((p) => p.name);
        expect(names).toContain('Wireless Headphones');
    });

    it('returns an empty array for a non-matching query', () => {
        // "zzz" has no prefix in the Trie — expect empty result
        const { result } = renderHook(() => useProductSearch(mockProducts, 'zzz'));
        expect(result.current.length).toBe(0);
    });

    it('finds multiple products sharing a common prefix', () => {
        // "l" is too short, but "le" is >= 2 chars and should match "leather" (Leather Jacket)
        // It should also match "leather" token — not "luxury" since "le" != "lu"
        const { result } = renderHook(() => useProductSearch(mockProducts, 'le'));
        const names = result.current.map((p) => p.name);
        expect(names).toContain('Leather Jacket');
    });

    it('handles a search query that is a full product name', () => {
        // Full token "silk" should still resolve correctly
        const { result } = renderHook(() => useProductSearch(mockProducts, 'silk'));
        const names = result.current.map((p) => p.name);
        expect(names).toContain('Silk Scarf');
    });
});

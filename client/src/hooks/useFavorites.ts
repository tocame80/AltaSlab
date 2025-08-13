import { useState, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((productId: string) => {
    return favorites.has(productId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteCount: favorites.size
  };
}
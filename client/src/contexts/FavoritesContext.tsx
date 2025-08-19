import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoriteCount: number;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Load favorites from localStorage
const loadFavorites = (): Set<string> => {
  try {
    const saved = localStorage.getItem('alta-slab-favorites');
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  return new Set();
};

// Save favorites to localStorage
const saveFavorites = (favorites: Set<string>) => {
  try {
    localStorage.setItem('alta-slab-favorites', JSON.stringify(Array.from(favorites)));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites());

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((productId: string) => {
    return favorites.has(productId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      favoriteCount: favorites.size
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
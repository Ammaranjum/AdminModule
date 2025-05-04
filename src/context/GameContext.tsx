import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGameLists, getGameProducts, getServerLists, ExternalGame, GameProduct, ServerList } from '../services/gameService';

interface GameWithDetails extends ExternalGame {
  products: GameProduct | null;
  servers: ServerList | null;
}

interface GameContextType {
  games: GameWithDetails[];
  selectedGame: GameWithDetails | null;
  loading: boolean;
  error: string | null;
  selectGame: (game: GameWithDetails) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllGamesData = async () => {
      try {
        setLoading(true);
        // First fetch all games
        const gameList = await getGameLists();
        
        // Then fetch products and servers for each game in parallel
        const gamesWithDetails = await Promise.all(
          gameList.map(async (game) => {
            try {
              const [products, servers] = await Promise.all([
                getGameProducts(game.name),
                getServerLists(game.name)
              ]);
              
              return {
                ...game,
                products,
                servers
              };
            } catch (err) {
              console.error(`Error fetching details for game ${game.name}:`, err);
              return {
                ...game,
                products: null,
                servers: null
              };
            }
          })
        );
        
        setGames(gamesWithDetails);
        setError(null);
      } catch (err) {
        setError('Failed to fetch games data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllGamesData();
  }, []);

  const selectGame = (game: GameWithDetails) => {
    setSelectedGame(game);
  };

  return (
    <GameContext.Provider
      value={{
        games,
        selectedGame,
        loading,
        error,
        selectGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 
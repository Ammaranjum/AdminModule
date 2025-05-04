import React from 'react';
import { useGame } from '../context/GameContext';

const GamesPage: React.FC = () => {
  const {
    games,
    selectedGame,
    loading,
    error,
    selectGame
  } = useGame();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Games & Servers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Games List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Available Games</h2>
          <div className="space-y-2">
            {games.map((game) => (
              <button
                key={game.name}
                onClick={() => selectGame(game)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedGame?.name === game.name
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* Game Details */}
        {selectedGame && (
          <>
            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Game Products</h2>
              {selectedGame.products ? (
                <div className="space-y-2">
                  {Object.entries(selectedGame.products).map(([product, price]) => (
                    <div
                      key={product}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">{product}</span>
                      <span className="text-green-600">${price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products available</p>
              )}
            </div>

            {/* Servers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Game Servers</h2>
              {selectedGame.servers ? (
                selectedGame.servers.code === '403' ? (
                  <p className="text-gray-500">{selectedGame.servers.message}</p>
                ) : (
                  <div className="space-y-2">
                    {/* Add server list rendering here if the API returns servers */}
                    <p className="text-gray-500">No servers available</p>
                  </div>
                )
              ) : (
                <p className="text-gray-500">No server information available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GamesPage;
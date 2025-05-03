import React, { useState, useEffect } from 'react';
import { getGames, getGameServers } from '../services/supabase';
import { Game, GameServer } from '../types';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import { Globe, Server, Eye } from 'lucide-react';
import Modal from '../components/common/Modal';

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [gameServers, setGameServers] = useState<GameServer[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<GameServer | null>(null);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoadingGames(false);
      }
    };

    const fetchServers = async () => {
      try {
        const serversData = await getGameServers();
        setGameServers(serversData);
      } catch (error) {
        console.error('Error fetching game servers:', error);
      } finally {
        setIsLoadingServers(false);
      }
    };

    fetchGames();
    fetchServers();
  }, []);

  const handleViewGame = (game: Game) => {
    setSelectedGame(game);
    setIsGameModalOpen(true);
  };

  const handleViewServer = (server: GameServer) => {
    setSelectedServer(server);
    setIsServerModalOpen(true);
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
  };

  const closeServerModal = () => {
    setIsServerModalOpen(false);
    setSelectedServer(null);
  };

  const gameColumns = [
    {
      header: 'Game',
      accessor: (game: Game) => (
        <div className="flex items-center">
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.name} className="w-10 h-10 rounded-md mr-3" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
              <Globe size={20} className="text-gray-400" />
            </div>
          )}
          <span className="font-medium">{game.name}</span>
        </div>
      )
    },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Status',
      accessor: (game: Game) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          game.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {game.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (game: Game) => (
        <Button
          variant="info"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => handleViewGame(game)}
        >
          View
        </Button>
      )
    }
  ];

  const serverColumns = [
    {
      header: 'Server',
      accessor: (server: GameServer) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center mr-3">
            <Server size={16} className="text-gray-400" />
          </div>
          <span>{server.name}</span>
        </div>
      )
    },
    {
      header: 'Game',
      accessor: (server: GameServer) => {
        const game = games.find(g => g.id === server.gameId);
        return game?.name || 'Unknown';
      }
    },
    { header: 'Region', accessor: 'region' },
    {
      header: 'Status',
      accessor: (server: GameServer) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          server.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {server.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (server: GameServer) => (
        <Button
          variant="info"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => handleViewServer(server)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Games & Servers</h1>
        <p className="text-sm text-gray-500">
          Total: {games.length} games, {gameServers.length} servers
        </p>
      </div>

      <Card title="Games">
        <DataTable
          columns={gameColumns}
          data={games}
          keyField="id"
          isLoading={isLoadingGames}
          emptyMessage="No games found"
        />
      </Card>

      <Card title="Game Servers">
        <DataTable
          columns={serverColumns}
          data={gameServers}
          keyField="id"
          isLoading={isLoadingServers}
          emptyMessage="No game servers found"
        />
      </Card>

      {selectedGame && (
        <Modal
          isOpen={isGameModalOpen}
          onClose={closeGameModal}
          title={`Game Details: ${selectedGame.name}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              {selectedGame.imageUrl ? (
                <img src={selectedGame.imageUrl} alt={selectedGame.name} className="w-16 h-16 rounded-md mr-4" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                  <Globe size={24} className="text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedGame.name}</h3>
                <p className={`text-sm ${selectedGame.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedGame.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {selectedGame.description}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Servers</h4>
              <div className="bg-gray-50 rounded-md border border-gray-200">
                {gameServers.filter(server => server.gameId === selectedGame.id).length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">No servers found for this game</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {gameServers
                      .filter(server => server.gameId === selectedGame.id)
                      .map(server => (
                        <li key={server.id} className="px-3 py-2 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{server.name}</p>
                            <p className="text-xs text-gray-500">Region: {server.region}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            server.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {server.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {selectedServer && (
        <Modal
          isOpen={isServerModalOpen}
          onClose={closeServerModal}
          title={`Server Details: ${selectedServer.name}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                <Server size={24} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedServer.name}</h3>
                <p className={`text-sm ${selectedServer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedServer.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <dl className="divide-y divide-gray-200">
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Game</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {games.find(g => g.id === selectedServer.gameId)?.name || 'Unknown'}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Region</dt>
                  <dd className="text-sm font-medium text-gray-900">{selectedServer.region}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedServer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedServer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Server ID</dt>
                  <dd className="text-sm font-medium text-gray-900 font-mono">{selectedServer.id}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GamesPage;
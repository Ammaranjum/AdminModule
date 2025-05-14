import React, { useState, useEffect } from "react";
import { supabase, getUsers, searchUsers } from "../services/supabase";
import { getGameLists, getGameProducts, getServerLists, ExternalGame, GameProduct } from "../services/gameService";
import { User } from "../types";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const PurchasePage: React.FC = () => {
  
  const { admin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [games, setGames] = useState<ExternalGame[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [products, setProducts] = useState<GameProduct>({});

  const [selectedGame, setSelectedGame] = useState<ExternalGame | null>(null);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [exchangeRate, setExchangeRate] = useState<number | "">("");
  const [gameUserId, setGameUserId] = useState("");
  const [deductFromBalance, setDeductFromBalance] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const users = await getUsers();
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const apiGames = await getGameLists();
        setGames(apiGames);
      } catch (error) {
        console.error("Error fetching games:", error);
        toast.error("Failed to load games");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
    fetchGames();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      return;
    }
    try {
      setIsLoading(true);
      const users = await searchUsers(searchQuery);
      setFilteredUsers(users);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setGameUserId(user.customerId);
  };

  useEffect(() => {
    if (!selectedGame) {
      setServers([]);
      setProducts({});
      setSelectedServerId("");
      setSelectedProduct("");
      return;
    }
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const prods = await getGameProducts(selectedGame.name);
        setProducts(prods);
        const srvList = await getServerLists(selectedGame.name);
        setServers(Array.isArray(srvList) ? srvList : []);
      } catch (error) {
        console.error("Error fetching game details:", error);
        toast.error("Failed to load game details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedGame]);

  const handlePurchase = async () => {
    if (!admin) {
      toast.error("Admin not authenticated");
      return;
    }
    if (
      !selectedUser ||
      !selectedGame ||
      !selectedProduct ||
      exchangeRate === "" ||
      exchangeRate <= 0 ||
      !gameUserId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsProcessing(true);
      // Prepare data according to new orders schema
      const amountToppedUp = products[selectedProduct];
      const totalPrice = Number(amountToppedUp) * Number(exchangeRate);
      const beforeBalance = selectedUser.balance;
      const afterBalance = deductFromBalance ? beforeBalance - totalPrice : beforeBalance;

      // Update user balance if deducting
      if (deductFromBalance) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ balance: afterBalance })
          .eq("id", selectedUser.id);
        if (updateError) throw updateError;
      }

      // Construct order payload
      const orderPayload: any = {
        order_id: crypto.randomUUID(),
        user_id: selectedUser.id,
        admin_id: admin.id,
        game_user_id: gameUserId,
        game_name: selectedGame.name,
        product_id: selectedProduct,
        amount_topped_up: amountToppedUp,
        price: totalPrice,
        before_balance: beforeBalance,
        after_balance: afterBalance,
        payment_method: deductFromBalance ? 'userBalance' : 'directAdminTopUp',
        done_by: 'admin',
        status: 'pending',
      };
      if (selectedServerId) {
        orderPayload.game_server_id = selectedServerId;
      }

      // Insert order record
      const { error: insertError } = await supabase
        .from("orders")
        .insert(orderPayload);
      if (insertError) throw insertError;

      toast.success("Purchase recorded successfully");
      // Reset form
      setSelectedUser(null);
      setSelectedGame(null);
      setExchangeRate("");
      setGameUserId("");
      setDeductFromBalance(true);
    } catch (error) {
      console.error("Error processing purchase:", error);
      toast.error("Failed to process purchase");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Purchase Game Items
        </h1>
      </div>

      <Card title="Search User">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search by Name, Email, or Customer ID
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user..."
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <Button
            variant="primary"
            icon={<Search size={18} />}
            onClick={handleSearch}
            isLoading={isLoading}
          >
            Search
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Search Results
          </h3>
          <div className="bg-gray-50 rounded-md border border-gray-200 divide-y divide-gray-200 h-48 overflow-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.email} | Customer ID: {user.customerId}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-4">
                No users found.
              </p>
            )}
          </div>
        </div>
      </Card>

      {selectedUser && (
        <Card title="Purchase Details">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900">
                {selectedUser.name}
              </p>
              <p className="text-xs text-gray-500 ml-4">
                {selectedUser.email} | Customer ID: {selectedUser.customerId}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="exchangeRate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Exchange Rate
              </label>
              <input
                id="exchangeRate"
                type="number"
                min="0"
                step="0.01"
                value={exchangeRate}
                onChange={(e) =>
                  setExchangeRate(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Enter Exchange Rate"
              />
            </div>

            <div>
              <label
                htmlFor="gameUserId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Game User ID
              </label>
              <input
                id="gameUserId"
                type="text"
                value={gameUserId}
                onChange={(e) => setGameUserId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Enter Game User ID"
              />
            </div>

            <div>
              <label
                htmlFor="game"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Game
              </label>
              <select
                id="game"
                value={selectedGame?.name || ""}
                onChange={(e) => {
                  const game = games.find((g) => g.name === e.target.value);
                  setSelectedGame(game || null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
              >
                <option value="" disabled>
                  Select Game
                </option>
                {games.map((game) => (
                  <option key={game.name} value={game.name}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="server"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Game Server
              </label>
              <select
                id="server"
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                disabled={!selectedGame || servers.length === 0}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
              >
                <option value="" disabled>
                  Select Server
                </option>
                {servers.map((server: any, idx) => (
                  <option key={idx} value={server.id || server.name || idx}>
                    {server.name || server.region || JSON.stringify(server)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="product"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product
              </label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={!selectedGame}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
              >
                <option value="" disabled>
                  Select Product
                </option>
                {Object.entries(products).map(([product, price]) => (
                  <option key={product} value={product}>
                    {product} (${price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="deductToggle"
                checked={deductFromBalance}
                onChange={(e) => setDeductFromBalance(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="deductToggle" className="ml-2 text-sm text-gray-700">
                Deduct from user balance
              </label>
            </div>

            {selectedProduct && exchangeRate !== "" && exchangeRate > 0 && (
              <div className="flex justify-end">
                <span className="text-lg font-semibold">
                  Total: ${(products[selectedProduct] * Number(exchangeRate)).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePurchase}
                isLoading={isProcessing}
                disabled={
                  !exchangeRate ||
                  exchangeRate <= 0 ||
                  !gameUserId ||
                  !selectedGame ||
                  !selectedProduct
                }
              >
                Purchase
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PurchasePage; 
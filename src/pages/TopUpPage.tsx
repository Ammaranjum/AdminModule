import React, { useState, useEffect } from "react";
import { getUsers, searchUsers, topUpUserBalanceBackend } from "../services/supabase";
import { User } from "../types";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { Search, DollarSign, User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const TopUpPage: React.FC = () => {
  const { admin, refreshAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [remark, setRemark] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true);
        const users = await getUsers();
        console.log('Fetched users:', users);
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error instanceof Error) {
          toast.error('Failed to load users: ' + error.message);
        } else {
          toast.error('Failed to load users: Unknown error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUsers();
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
  };

  const handleTopUp = async () => {
    if (!selectedUser || amount === "" || amount <= 0) {
      toast.error("Please select a user and enter a valid amount");
      return;
    }

    if (!admin) {
      toast.error("Admin not authenticated");
      return;
    }

    if (admin.Recharge < amount) {
      toast.error("Insufficient admin balance");
      return;
    }

    try {
      setIsProcessing(true);
      await topUpUserBalanceBackend(admin.id, selectedUser.id, Number(amount));
      toast.success(
        `Successfully topped up ${selectedUser.name}'s balance by $${amount}`
      );
      await refreshAdmin();
      const users = await getUsers();
      setAllUsers(users);
      setFilteredUsers(users);
      setSelectedUser(null);
      setAmount("");
      setRemark("");
    } catch (error) {
      console.error("Error topping up balance:", error);
      toast.error("Failed to top up balance");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Top Up User Balance
        </h1>
        <p className="text-sm text-gray-500">
          Your Balance:{" "}
          <span className="font-medium">
            ${admin?.Recharge.toFixed(2) || "0.00"}
          </span>
        </p>
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
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search user..."
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
          <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
          <div className="bg-gray-50 rounded-md border border-gray-200 divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectUser(user)}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email} | Customer ID: {user.customerId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-600">Balance: ${user.balance.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-4">No users found. Please check if users exist in the database or try searching again.</p>
            )}
          </div>
        </div>
      </Card>

      {selectedUser && (
        <Card title="Top Up Details">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                <UserIcon size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedUser.email} | Customer ID: {selectedUser.customerId}
                </p>
                <p className="text-sm font-medium text-green-600 mt-1">
                  Current Balance: ${selectedUser.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Top Up Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="pl-7 px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="remark"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Remark (Optional)
              </label>
              <textarea
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add optional remark..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<DollarSign size={18} />}
                onClick={handleTopUp}
                isLoading={isProcessing}
                disabled={
                  !amount ||
                  amount <= 0 ||
                  !admin ||
                  admin.Recharge < Number(amount)
                }
              >
                Top Up Balance
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TopUpPage;

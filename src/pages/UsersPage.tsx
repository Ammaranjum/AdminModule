import React, { useState, useEffect } from "react";
import { getUsers } from "../services/supabase";
import { User } from "../types";
import DataTable from "../components/common/DataTable";
import Card from "../components/common/Card";
import { Eye, Mail, Phone } from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        console.log(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    { header: "Customer ID", accessor: "customerId" },
    { header: "Name", accessor: "name" },
    {
      header: "Email",
      accessor: (user: User) => (
        <div className="flex items-center">
          <Mail size={16} className="mr-2 text-gray-400" />
          <span>{user.email}</span>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: (user: User) => (
        <div className="flex items-center">
          <Phone size={16} className="mr-2 text-gray-400" />
          <span>{user.phone}</span>
        </div>
      ),
    },
    {
      header: "Balance",
      accessor: (user: User) => (
        <span className="font-medium text-green-600">
          ${user.balance.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Joined",
      accessor: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <Button
          variant="info"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => handleViewUser(user)}
        >
          View
        </Button>
      ),
    },
    {
      header: "Total Spent",
      accessor: (user: User) => (
        <span className="font-medium text-blue-600">
          ${user.totalBalance.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">Total users: {users.length}</p>
      </div>

      <Card title="All Users">
        <DataTable
          columns={columns}
          data={users}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </Card>

      {selectedUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`User Details: ${selectedUser.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Basic Information
                </h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Customer ID
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedUser.customerId}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedUser.name}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedUser.email}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedUser.phone}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Joined
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Account Information
                </h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Balance
                      </dt>
                      <dd className="text-sm font-medium text-green-600">
                        ${selectedUser.balance.toFixed(2)}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Total Spent
                      </dt>
                      <dd className="text-sm font-medium text-blue-600">
                        ${selectedUser.totalBalance.toFixed(2)}
                      </dd>
                    </div>

                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Last Updated
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(selectedUser.updatedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Actions</h3>
              <div className="mt-2 flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    closeModal();
                    window.location.href = "/admin/topup";
                  }}
                >
                  Top Up Balance
                </Button>
                <Button variant="secondary">View Orders</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, PackageSearch, Server as ServerStack, Activity, LogOut, Menu, X, DollarSign, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLayout: React.FC = () => {
  const { admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (admin) {
      console.log('Admin object:', admin);
      console.log('Admin Recharge:', admin.Recharge);
      console.log('Admin totalBalance:', admin.totalBalance);
    }
  }, [admin]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/orders', icon: <PackageSearch size={20} />, label: 'Orders' },
    { to: '/admin/topup', icon: <DollarSign size={20} />, label: 'Top Up' },
    { to: '/admin/topups', icon: <ClipboardList size={20} />, label: 'Top-Up Logs' },
    { to: '/admin/games', icon: <ServerStack size={20} />, label: 'Games & Servers' },
    { to: '/admin/activity', icon: <Activity size={20} />, label: 'Activity Logs' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button 
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-300 ease-in-out w-64 bg-gray-900 text-white flex flex-col`}
      >
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold">Top-Up Admin</h1>
          {admin && (
            <p className="text-gray-400 text-sm mt-1">
              Logged in as {admin.name}
            </p>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)} 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md transition duration-150 ease-in-out ${
                  isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          {admin && admin.Recharge !== undefined && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Recharge:</span>
              <span className="font-medium">${admin.Recharge?.toFixed(2) || '0.00'}</span>
            </div>
          )}

          {admin && admin.totalBalance !== undefined && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Total Balance:</span>
              <span className="font-medium">${admin.totalBalance?.toFixed(2) || '0.00'}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white transition duration-150 ease-in-out"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, BarChart3 } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                GLS
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/links/new"
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Link
              </Link>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 
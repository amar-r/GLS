import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { linksAPI } from '../services/api';
import { Edit, Trash2, BarChart3, Search, Plus } from 'lucide-react';

interface LinkData {
  id: number;
  short_code: string;
  target_url: string;
  title: string;
  description?: string;
  is_active: boolean;
  access_count: number;
  owner: {
    username: string;
  };
}

interface LinksResponse {
  links: LinkData[];
  total: number;
  page: number;
  per_page: number;
}

const Dashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery<LinksResponse>(
    ['links', page, search],
    () => linksAPI.getLinks({ skip: (page - 1) * limit, limit, search }),
    { keepPreviousData: true }
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await linksAPI.deleteLink(id);
        toast.success('Link deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to delete link');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Links</h1>
        <Link to="/links/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Link
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links..."
              className="input pl-10"
            />
          </div>
        </div>
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      {/* Links List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              {data?.total || 0} links found
            </h2>
          </div>
          <div className="card-body">
            {data?.links?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No links found. Create your first link!
              </div>
            ) : (
              <div className="space-y-4">
                {data?.links?.map((link: LinkData) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {link.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {link.short_code}
                        </span>
                        {!link.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {link.description || 'No description'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {link.target_url}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created by {link.owner.username} • {link.access_count} clicks
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/links/${link.short_code}/stats`}
                        className="btn-secondary"
                        title="View Stats"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/links/${link.id}/edit`}
                        className="btn-secondary"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="btn-danger"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {Math.ceil(data.total / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(data.total / limit)}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
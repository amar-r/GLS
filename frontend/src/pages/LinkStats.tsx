import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { linksAPI } from '../services/api';
import { ArrowLeft, BarChart3, Calendar, MousePointer } from 'lucide-react';

const LinkStats: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery(
    ['link-stats', shortCode],
    () => linksAPI.getLinkStats(shortCode!),
    { enabled: !!shortCode }
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load link statistics</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Link Statistics
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
              <MousePointer className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Total Clicks
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats?.access_count || 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Created
            </h3>
            <p className="text-sm text-gray-600">
              {stats?.created_at
                ? new Date(stats.created_at).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Last Accessed
            </h3>
            <p className="text-sm text-gray-600">
              {stats?.last_accessed
                ? new Date(stats.last_accessed).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Link Details
          </h2>
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Short Code</dt>
              <dd className="mt-1 text-sm text-gray-900">{stats?.short_code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {stats?.created_at
                  ? new Date(stats.created_at).toLocaleString()
                  : 'Unknown'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Accessed</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {stats?.last_accessed
                  ? new Date(stats.last_accessed).toLocaleString()
                  : 'Never accessed'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Clicks</dt>
              <dd className="mt-1 text-sm text-gray-900">{stats?.access_count || 0}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default LinkStats; 
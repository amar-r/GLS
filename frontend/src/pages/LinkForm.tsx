import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { linksAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

interface LinkFormData {
  short_code: string;
  target_url: string;
  title: string;
  description: string;
}

const LinkForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>();

  // Fetch link data if editing
  const { data: link, isLoading } = useQuery(
    ['link', id],
    () => linksAPI.getLink(Number(id)),
    { enabled: isEditing }
  );

  // Create/Update mutation
  const mutation = useMutation(
    (data: LinkFormData) => {
      if (isEditing) {
        return linksAPI.updateLink(Number(id), data);
      }
      return linksAPI.createLink(data);
    },
    {
      onSuccess: () => {
        toast.success(`Link ${isEditing ? 'updated' : 'created'} successfully!`);
        queryClient.invalidateQueries(['links']);
        navigate('/');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} link`);
      },
    }
  );

  useEffect(() => {
    if (link) {
      reset({
        short_code: link.short_code,
        target_url: link.target_url,
        title: link.title,
        description: link.description || '',
      });
    }
  }, [link, reset]);

  const onSubmit = (data: LinkFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Link' : 'Create New Link'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-body space-y-4">
            {!isEditing && (
              <div className="form-group">
                <label htmlFor="short_code" className="form-label">
                  Short Code *
                </label>
                <input
                  id="short_code"
                  type="text"
                  {...register('short_code', {
                    required: 'Short code is required',
                    pattern: {
                      value: /^[a-zA-Z0-9]+$/,
                      message: 'Short code must be alphanumeric',
                    },
                    minLength: {
                      value: 3,
                      message: 'Short code must be at least 3 characters',
                    },
                    maxLength: {
                      value: 20,
                      message: 'Short code must be at most 20 characters',
                    },
                  })}
                  className="input"
                  placeholder="e.g., docs, api, blog"
                />
                {errors.short_code && (
                  <p className="form-error">{errors.short_code.message}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="target_url" className="form-label">
                Target URL *
              </label>
              <input
                id="target_url"
                type="url"
                {...register('target_url', {
                  required: 'Target URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL must start with http:// or https://',
                  },
                })}
                className="input"
                placeholder="https://example.com"
              />
              {errors.target_url && (
                <p className="form-error">{errors.target_url.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  maxLength: {
                    value: 200,
                    message: 'Title must be at most 200 characters',
                  },
                })}
                className="input"
                placeholder="Enter a descriptive title"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="input"
                placeholder="Optional description of the link"
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="btn-primary"
          >
            {mutation.isLoading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Link'
              : 'Create Link'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinkForm; 
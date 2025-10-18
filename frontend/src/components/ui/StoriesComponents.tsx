/**
 * Loading and Error Components for Stories
 * Mashujaa Voices - Kenyan Heritage Storytelling Platform
 */

import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-amber-600"></div>
    </div>
  );
};

interface StoriesLoadingProps {
  message?: string;
}

export const StoriesLoading: React.FC<StoriesLoadingProps> = ({ 
  message = 'Loading stories...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

interface StoriesErrorProps {
  error: string;
  onRetry?: () => void;
}

export const StoriesError: React.FC<StoriesErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Stories</h3>
      <p className="text-gray-600 text-sm mb-4 max-w-md">{error}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

interface StoriesEmptyProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const StoriesEmpty: React.FC<StoriesEmptyProps> = ({ 
  message = 'No stories found',
  actionLabel,
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stories Available</h3>
      <p className="text-gray-600 text-sm mb-4 max-w-md">{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
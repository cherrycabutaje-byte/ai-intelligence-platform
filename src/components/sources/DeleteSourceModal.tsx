'use client';

import { useState } from 'react';
import type { Source } from '@/types/database';
import { deleteSource } from '@/lib/sources';
import { useToast } from '@/components/ui/Toast';

interface Props {
  source: Source;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteSourceModal({ source, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const { error: e } = await deleteSource(String(source.id));
    if (e) { setError(e.message); setLoading(false); return; }
    setLoading(false);
    showToast(`"${source.asset_name}" deleted successfully.`, 'success');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d27] border border-gray-700 rounded-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Delete Source</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">

          {/* Warning Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>

          <div className="text-center space-y-2">
            <p className="text-white font-medium">
              Are you sure you want to delete this source?
            </p>
            <p className="text-gray-400 text-sm">
              This will permanently delete{' '}
              <span className="text-white font-semibold">{source.asset_name}</span>
              {' '}and all associated data. This action cannot be undone.
            </p>
          </div>

          {/* Source Info */}
          <div className="bg-[#0f1117] border border-gray-800 rounded-lg px-4 py-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Asset Name</span>
              <span className="text-white font-medium">{source.asset_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Platform</span>
              <span className="text-gray-300">{source.platform ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Status</span>
              <span className="text-gray-300 capitalize">{source.status}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>

      </div>
    </div>
  );
}

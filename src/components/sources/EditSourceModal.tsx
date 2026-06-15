'use client';

import { useState, useEffect } from 'react';
import type { Source, SourceUpdate } from '@/types/database';
import { updateSource } from '@/lib/sources';
import { useToast } from '@/components/ui/Toast';

interface Props {
  source: Source;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSourceModal({ source, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [form, setForm] = useState<SourceUpdate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      asset_name: source.asset_name,
      platform: source.platform,
      asset_url: source.asset_url,
      source_type: source.source_type,
      category: source.category,
      country: source.country,
      niche: source.niche,
      notes: source.notes,
      asset_type: source.asset_type,
      status: source.status,
    });
  }, [source]);

  const set = (field: keyof SourceUpdate, value: string) => {
    setForm(prev => ({ ...prev, [field]: value || null }));
  };

  const handleSubmit = async () => {
    if (!form.asset_name?.trim()) { setError('Asset name is required.'); return; }
    if (!form.platform?.trim()) { setError('Platform is required.'); return; }
    setLoading(true);
    setError(null);
    const { error: e } = await updateSource(String(source.id), form);
    if (e) { setError(e.message); setLoading(false); return; }
    setLoading(false);
    showToast('Source updated successfully!', 'success');
    onSuccess();
  };

  const inputClass = "w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";
  const labelClass = "block text-xs text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d27] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Source</h2>
            <p className="text-xs text-gray-500 mt-0.5">{source.asset_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Asset Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.asset_name ?? ''}
                onChange={e => setForm(p => ({ ...p, asset_name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Platform <span className="text-red-400">*</span></label>
              <select value={form.platform ?? ''} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className={inputClass}>
                <option value="">Select platform...</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Amazon">Amazon</option>
                <option value="Shopify">Shopify</option>
                <option value="Etsy">Etsy</option>
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Asset Type</label>
              <select value={form.asset_type ?? ''} onChange={e => set('asset_type', e.target.value)} className={inputClass}>
                <option value="">Select type...</option>
                <option value="video">Video</option>
                <option value="blog">Blog</option>
                <option value="product">Product</option>
                <option value="channel">Channel</option>
                <option value="store">Store</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Source Type</label>
              <select value={form.source_type ?? ''} onChange={e => set('source_type', e.target.value)} className={inputClass}>
                <option value="">Select source type...</option>
                <option value="organic">Organic</option>
                <option value="paid">Paid</option>
                <option value="referral">Referral</option>
                <option value="direct">Direct</option>
                <option value="social">Social</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className={labelClass}>Asset URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.asset_url ?? ''}
              onChange={e => set('asset_url', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <input type="text" value={form.category ?? ''} onChange={e => set('category', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Niche</label>
              <input type="text" value={form.niche ?? ''} onChange={e => set('niche', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={form.country ?? ''} onChange={e => set('country', e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Row 5 */}
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status ?? 'active'} onChange={e => setForm(p => ({ ...p, status: e.target.value as Source['status'] }))} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Row 6 */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import { SourceChannel } from '../types/crisis';

interface AddIssueModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (issueId: string) => void;
}

const CHANNELS: SourceChannel[] = [
  'Instagram',
  'Twitter/X',
  'TikTok',
  'Website',
  'Email',
  'Acara/Kegiatan',
];

export const AddIssueModal: React.FC<AddIssueModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { addIssue, keywords } = useCrisis();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [primarySource, setPrimarySource] = useState('');
  const [primaryChannel, setPrimaryChannel] = useState<SourceChannel>('Instagram');
  const [mentions, setMentions] = useState<number>(45);
  const [negativePct, setNegativePct] = useState<number>(62);
  const [selectedKeyword, setSelectedKeyword] = useState<string>(keywords[0] || 'UNJ');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !primarySource.trim()) {
      setError('Judul isu, deskripsi, dan sumber utama wajib diisi.');
      return;
    }
    if (mentions < 1) {
      setError('Jumlah mention awal minimal 1.');
      return;
    }
    const created = addIssue({
      title,
      description,
      primarySource,
      primaryChannel,
      mentions,
      negativePct,
      keywords: [selectedKeyword],
    });
    setTitle('');
    setDescription('');
    setPrimarySource('');
    setMentions(45);
    setNegativePct(62);
    setError('');
    onClose();
    if (onCreated) onCreated(created.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-issue-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 id="add-issue-title" className="text-lg font-bold text-slate-900">
              Tambah Isu Baru ke Monitoring
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Input manual untuk pencatatan isu dan pengujian alur penanganan krisis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup formulir"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama / Judul Isu <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Gangguan jadwal registrasi ulang mahasiswa baru"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Deskripsi Singkat Isu <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan konteks isu yang terpantau..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Saluran Sumber
              </label>
              <select
                value={primaryChannel}
                onChange={(e) => setPrimaryChannel(e.target.value as SourceChannel)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Akun / Sumber Informasi <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={primarySource}
                onChange={(e) => setPrimarySource(e.target.value)}
                placeholder="Contoh: @info_unj"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Jumlah Mention
              </label>
              <input
                type="number"
                min={1}
                value={mentions}
                onChange={(e) => setMentions(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Sentimen Negatif (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={negativePct}
                onChange={(e) => setNegativePct(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kata Kunci Utama
              </label>
              <select
                value={selectedKeyword}
                onChange={(e) => setSelectedKeyword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {keywords.map((kw) => (
                  <option key={kw} value={kw}>
                    {kw}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Simpan Isu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

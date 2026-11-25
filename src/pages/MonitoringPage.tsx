import React, { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { AddIssueModal } from '../components/AddIssueModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EarlyWarningText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { SentimentType, SourceChannel } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';

const CHANNELS: ('Semua' | SourceChannel)[] = [
  'Semua',
  'Instagram',
  'Twitter/X',
  'TikTok',
  'Website',
  'Email',
  'Acara/Kegiatan',
];

export const MonitoringPage: React.FC = () => {
  const {
    issues,
    activeIssues,
    mentions,
    keywords,
    addKeyword,
    removeKeyword,
    addMention,
    toggleMentionVerified,
    setSelectedIssueId,
    setActivePage,
  } = useCrisis();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'Semua' | SourceChannel>('Semua');
  const [activeKeywordFilter, setActiveKeywordFilter] = useState<string>('Semua');
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null);
  const [addIssueOpen, setAddIssueOpen] = useState(false);

  // Manual mention form
  const [showManualForm, setShowManualForm] = useState(false);
  const [mIssueId, setMIssueId] = useState(activeIssues[0]?.id || issues[0]?.id || '');
  const [mChannel, setMChannel] = useState<SourceChannel>('Instagram');
  const [mAccount, setMAccount] = useState('');
  const [mContent, setMContent] = useState('');
  const [mKeyword, setMKeyword] = useState(keywords[0] || 'UNJ');
  const [mSentiment, setMSentiment] = useState<SentimentType>('Negatif');
  const [mInteractions, setMInteractions] = useState(25);
  const [mError, setMError] = useState('');

  const filteredMentions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mentions.filter((m) => {
      if (selectedChannel !== 'Semua' && m.channel !== selectedChannel) return false;
      if (
        activeKeywordFilter !== 'Semua' &&
        m.keyword.toLowerCase() !== activeKeywordFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      const linkedIssue = issues.find((i) => i.id === m.issueId);
      return (
        m.accountOrSource.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.keyword.toLowerCase().includes(q) ||
        (linkedIssue?.title.toLowerCase().includes(q) ?? false)
      );
    });
  }, [mentions, selectedChannel, activeKeywordFilter, searchQuery, issues]);

  const earlyIndicators = useMemo(() => {
    const highMentionIssues = activeIssues.filter((i) => i.mentions >= 250).length;
    const highNegIssues = activeIssues.filter((i) => i.negativePct >= 60).length;
    const uniqueAccounts = new Set(mentions.map((m) => m.accountOrSource)).size;
    const totalInteractions = mentions.reduce((s, m) => s + m.interactions, 0);
    return {
      highMentionIssues,
      highNegIssues,
      uniqueAccounts,
      totalInteractions,
    };
  }, [activeIssues, mentions]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (addKeyword(newKeyword)) {
      setNewKeyword('');
    }
  };

  const handleSubmitManualMention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mAccount.trim() || !mContent.trim() || !mIssueId) {
      setMError('Isu terkait, nama akun/sumber, dan isi percakapan wajib diisi.');
      return;
    }
    addMention({
      issueId: mIssueId,
      channel: mChannel,
      accountOrSource: mAccount,
      content: mContent,
      keyword: mKeyword,
      interactions: mInteractions,
      sentiment: mSentiment,
      verified: false,
    });
    setMAccount('');
    setMContent('');
    setMInteractions(25);
    setMError('');
    setShowManualForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Monitoring & Deteksi Dini Isu
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pemantauan kata kunci, sumber percakapan lintas kanal, dan indikator peringatan dini · Data Simulasi & Input Manual
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowManualForm((v) => !v)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Input Percakapan Manual
          </button>
          <button
            type="button"
            onClick={() => setAddIssueOpen(true)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Tambah Isu Baru
          </button>
        </div>
      </div>

      {/* Explicit Transparency Notice on Simulation vs Live API */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-xs text-slate-600">
        Sistem saat ini berjalan dalam mode <strong className="text-slate-900">Data Simulasi & Input Manual</strong> (belum terhubung ke API langsung Instagram, Twitter/X, atau TikTok). Gunakan tombol <em>Input Percakapan Manual</em> atau <em>Tambah Isu Baru</em> untuk menguji skenario pemantauan.
      </div>

      {/* Manual Mention Form */}
      {showManualForm && (
        <form
          onSubmit={handleSubmitManualMention}
          className="rounded-xl border border-blue-200 bg-white p-5 sm:p-6"
        >
          <h2 className="font-display text-base font-bold text-slate-900">
            Catat Percakapan / Laporan Baru (Input Manual)
          </h2>
          {mError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {mError}
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Isu Terkait
              </label>
              <select
                value={mIssueId}
                onChange={(e) => setMIssueId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kategori Sumber
              </label>
              <select
                value={mChannel}
                onChange={(e) => setMChannel(e.target.value as SourceChannel)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                {CHANNELS.filter((c) => c !== 'Semua').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nama Akun / Sumber
              </label>
              <input
                type="text"
                value={mAccount}
                onChange={(e) => setMAccount(e.target.value)}
                placeholder="@akun_mahasiswa / Email pengadu"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kata Kunci Terkait
              </label>
              <select
                value={mKeyword}
                onChange={(e) => setMKeyword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                {keywords.map((kw) => (
                  <option key={kw} value={kw}>
                    {kw}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Isi Percakapan / Laporan
              </label>
              <textarea
                rows={2}
                value={mContent}
                onChange={(e) => setMContent(e.target.value)}
                placeholder="Tuliskan isi unggahan, komentar, atau laporan yang ditemukan..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Sentimen
                </label>
                <select
                  value={mSentiment}
                  onChange={(e) => setMSentiment(e.target.value as SentimentType)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Negatif">Negatif</option>
                  <option value="Netral">Netral</option>
                  <option value="Positif">Positif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Interaksi
                </label>
                <input
                  type="number"
                  min={0}
                  value={mInteractions}
                  onChange={(e) => setMInteractions(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Simpan ke Feed Monitoring
            </button>
          </div>
        </form>
      )}

      {/* Search & Keyword Management */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <label htmlFor="monitoring-search" className="block text-xs font-semibold text-slate-700">
              Pencarian Isu, Akun, Topik, atau Layanan
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="monitoring-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci, @akun, topik pembicaraan, atau layanan..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <form onSubmit={handleAddKeyword} className="lg:col-span-5">
            <label htmlFor="new-keyword-input" className="block text-xs font-semibold text-slate-700">
              Tambah Kata Kunci Pantauan Baru
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="new-keyword-input"
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Contoh: Wisuda UNJ / SIAKAD"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tambah
              </button>
            </div>
          </form>
        </div>

        {/* Interactive Keyword Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-500">Filter Kata Kunci:</span>
          <button
            type="button"
            onClick={() => setActiveKeywordFilter('Semua')}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeKeywordFilter === 'Semua'
                ? 'bg-[#0B1F3A] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {keywords.map((kw) => (
            <div key={kw} className="inline-flex items-center rounded-md bg-slate-100">
              <button
                type="button"
                onClick={() =>
                  setActiveKeywordFilter(activeKeywordFilter === kw ? 'Semua' : kw)
                }
                className={`whitespace-nowrap rounded-l-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeKeywordFilter === kw
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {kw}
              </button>
              <button
                type="button"
                onClick={() => setKeywordToDelete(kw)}
                className="rounded-r-md px-1.5 py-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Hapus kata kunci ${kw}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Early Detection Panel */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Sistem Deteksi Dini Eskalasi Isu
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi lonjakan mention, sentimen negatif, pengulangan keluhan, sebaran akun, dan atensi publik.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Aman
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-yellow-700">
              <Eye className="h-3.5 w-3.5" /> Meningkat
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" /> Perhatian Serius
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-red-700">
              <AlertOctagon className="h-3.5 w-3.5" /> Indikasi Krisis Tinggi
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Isu Volume Tinggi (≥250)</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
              {earlyIndicators.highMentionIssues} isu
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sentimen Negatif Tinggi (≥60%)</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-red-600">
              {earlyIndicators.highNegIssues} isu
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sebaran Akun / Sumber Unik</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
              {earlyIndicators.uniqueAccounts} akun
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Interaksi Terpantau</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
              {formatNumberID(earlyIndicators.totalInteractions)}
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {activeIssues.map((iss) => (
            <div
              key={iss.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{iss.title}</p>
                <p className="text-xs text-slate-500">
                  {formatNumberID(iss.mentions)} mention · {iss.negativePct}% negatif · Sumber{' '}
                  <span className="font-mono">{iss.primarySource}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <EarlyWarningText level={iss.earlyWarning} />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIssueId(iss.id);
                    setActivePage('validation');
                  }}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-blue-700 hover:underline"
                >
                  Validasi
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Source Category Tabs + Feed */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Daftar Percakapan & Laporan Menurut Saluran
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CHANNELS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedChannel === ch
                    ? 'bg-[#0B1F3A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {filteredMentions.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Tidak ditemukan percakapan yang cocok dengan filter pencarian Anda.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredMentions.map((m) => {
              const linked = issues.find((i) => i.id === m.issueId);
              return (
                <div key={m.id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">{m.channel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-700">{m.accountOrSource}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateTimeID(m.foundAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Kata kunci: {m.keyword}</span>
                      {m.isSimulated && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-700">Data Simulasi</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-semibold ${
                          m.sentiment === 'Negatif'
                            ? 'text-red-700'
                            : m.sentiment === 'Positif'
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        Sentimen {m.sentiment}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {formatNumberID(m.interactions)} interaksi
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-slate-800">“{m.content}”</p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Terkait isu:{' '}
                      <strong className="text-slate-800">{linked?.title || '-'}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleMentionVerified(m.id)}
                        className={`font-medium ${
                          m.verified
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {m.verified ? '✓ Sumber Terverifikasi' : 'Tandai Terverifikasi'}
                      </button>
                      {linked && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIssueId(linked.id);
                            setActivePage('validation');
                          }}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          Buka Validasi Isu →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(keywordToDelete)}
        title="Hapus Kata Kunci Pantauan?"
        description={`Kata kunci "${keywordToDelete}" akan dihapus dari daftar filter aktif.`}
        confirmLabel="Hapus Kata Kunci"
        variant="danger"
        onConfirm={() => {
          if (keywordToDelete) {
            removeKeyword(keywordToDelete);
            if (activeKeywordFilter === keywordToDelete) {
              setActiveKeywordFilter('Semua');
            }
          }
          setKeywordToDelete(null);
        }}
        onCancel={() => setKeywordToDelete(null)}
      />

      <AddIssueModal open={addIssueOpen} onClose={() => setAddIssueOpen(false)} />
    </div>
  );
};

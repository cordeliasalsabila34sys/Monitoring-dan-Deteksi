import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Instagram,
  Music2,
  Send,
  Twitter,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ApprovalStatusText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { DistributionPlatform } from '../types/crisis';
import { formatDateTimeID } from '../utils/crypto';

const PLATFORMS: {
  id: DistributionPlatform;
  label: string;
  handle: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'Instagram', label: 'Instagram', handle: '@unj_official', icon: Instagram },
  { id: 'Twitter/X', label: 'Twitter / X', handle: '@unj_official', icon: Twitter },
  { id: 'TikTok', label: 'TikTok', handle: '@unj_official', icon: Music2 },
  { id: 'Website Resmi', label: 'Website Resmi', handle: 'unj.ac.id/pengumuman', icon: Globe },
];

export const DistributionPage: React.FC = () => {
  const {
    issues,
    selectedIssue,
    setSelectedIssueId,
    publishResponse,
    setActivePage,
    notify,
  } = useCrisis();

  const [selectedPlatforms, setSelectedPlatforms] = useState<DistributionPlatform[]>([
    'Instagram',
    'Twitter/X',
    'Website Resmi',
  ]);
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);

  const msgStatus = selectedIssue.officialMessage.status;
  const isApproved = msgStatus === 'Disetujui' || msgStatus === 'Dipublikasikan';
  const hasDraft = Boolean(selectedIssue.officialMessage.draft.trim());

  const togglePlatform = (p: DistributionPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handlePublishClick = () => {
    if (!isApproved) {
      notify('Pesan resmi harus berstatus Disetujui sebelum dapat didistribusikan.', 'error');
      return;
    }
    if (!hasDraft) {
      notify('Teks pesan resmi kosong. Lengkapi di Pusat Respons Krisis.', 'error');
      return;
    }
    if (selectedPlatforms.length === 0) {
      notify('Pilih minimal satu platform distribusi terlebih dahulu.', 'warning');
      return;
    }
    setConfirmPublishOpen(true);
  };

  const confirmPublish = () => {
    publishResponse(selectedIssue.id, selectedPlatforms);
    setConfirmPublishOpen(false);
  };

  const publishedPlatformsSet = new Set(
    selectedIssue.distributions.flatMap((d) => d.platforms)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Distribusi Respons Resmi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pilih saluran komunikasi resmi untuk menyebarkan pernyataan klarifikasi · Mode Simulasi Distribusi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="dist-issue-select" className="text-xs font-medium text-slate-600">
            Pilih Isu:
          </label>
          <select
            id="dist-issue-select"
            value={selectedIssue.id}
            onChange={(e) => setSelectedIssueId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
          >
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Approval Guard Banner */}
      {!isApproved && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Pesan Resmi Belum Disetujui
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                Status saat ini: <strong>{msgStatus}</strong>. Ajukan dan setujui pernyataan resmi di Pusat Respons Krisis sebelum melakukan distribusi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('response')}
            className="whitespace-nowrap rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
          >
            Ke Pusat Respons Krisis
          </button>
        </div>
      )}

      {/* Approved Message Preview */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs text-slate-500">Pernyataan Resmi yang Akan Didistribusikan</p>
            <h2 className="mt-0.5 font-display text-base font-bold text-slate-900">
              {selectedIssue.title}
            </h2>
          </div>
          <ApprovalStatusText status={msgStatus} />
        </div>
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
          {hasDraft
            ? `“${selectedIssue.officialMessage.draft}”`
            : 'Belum ada isi pesan resmi untuk isu ini.'}
        </p>
      </section>

      {/* 4 Platform Selection Cards */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Distribusi ke Platform Komunikasi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Centang satu atau beberapa saluran sekaligus. Karena API platform eksternal belum terhubung, publikasi berjalan sebagai <strong>Simulasi Distribusi</strong>.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const checked = selectedPlatforms.includes(p.id);
            const alreadyPublished = publishedPlatformsSet.has(p.id);
            return (
              <label
                key={p.id}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-colors ${
                  checked
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.label}</p>
                      <p className="font-mono text-[11px] text-slate-500">{p.handle}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlatform(p.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </div>

                <div className="mt-4 border-t border-slate-100 pt-2.5 text-xs">
                  {alreadyPublished ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Simulasi Distribusi Tercatat
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      {checked ? 'Dipilih untuk simulasi publikasi' : 'Tidak dipilih'}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-500">
            Platform terpilih:{' '}
            <strong className="text-slate-900">
              {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'Belum ada'}
            </strong>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePublishClick}
              disabled={!isApproved || !hasDraft}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Publikasikan Respons Cepat
            </button>
            {selectedIssue.distributions.length > 0 && (
              <button
                type="button"
                onClick={() => setActivePage('evaluation')}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Lanjutkan ke Evaluasi Sentimen
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Distribution Log */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-slate-900">
          Catatan Riwayat Distribusi Isu Ini
        </h3>
        {selectedIssue.distributions.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            Belum ada catatan distribusi untuk isu ini.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-slate-200">
            {selectedIssue.distributions.map((dist) => (
              <div key={dist.id} className="py-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-emerald-700">
                    {dist.mode} · {dist.platforms.join(', ')}
                  </span>
                  <span className="font-mono text-slate-500">
                    {formatDateTimeID(dist.publishedAt)} · oleh {dist.publishedBy}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">“{dist.messageSnapshot}”</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmPublishOpen}
        title="Konfirmasi Simulasi Publikasi Respons Cepat?"
        description={`Pernyataan resmi akan dicatat sebagai Simulasi Distribusi ke platform: ${selectedPlatforms.join(', ')}.`}
        confirmLabel="Jalankan Simulasi Distribusi"
        onConfirm={confirmPublish}
        onCancel={() => setConfirmPublishOpen(false)}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  Save,
  Send,
  ShieldAlert,
  Trash2,
  XCircle,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ApprovalStatusText, CrisisLevelText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';

const GUIDELINES = [
  'Menggunakan bahasa yang profesional dan formal sesuai standar kehumasan universitas.',
  'Menunjukkan empati terhadap mahasiswa atau pihak yang terdampak.',
  'Menyampaikan informasi secara jelas, ringkas, dan tidak berbelit.',
  'Tidak menyalahkan pihak tertentu tanpa bukti yang terverifikasi.',
  'Tidak memberikan informasi atau janji yang belum terkonfirmasi.',
  'Menjelaskan langkah penanganan nyata yang sedang dilakukan oleh pihak kampus.',
  'Menggunakan nada komunikasi yang tenang, objektif, dan bertanggung jawab.',
];

export const ResponseCenterPage: React.FC = () => {
  const {
    issues,
    selectedIssue,
    setSelectedIssueId,
    currentUser,
    saveDraftMessage,
    deleteDraftMessage,
    submitForApproval,
    reviewOfficialMessage,
    setActivePage,
    notify,
  } = useCrisis();

  const limit = selectedIssue.officialMessage.charLimit || 280;
  const [draft, setDraft] = useState(selectedIssue.officialMessage.draft);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setDraft(selectedIssue.officialMessage.draft);
  }, [selectedIssue]);

  const handleDraftChange = (val: string) => {
    if (val.length <= limit) {
      setDraft(val);
    } else {
      setDraft(val.slice(0, limit));
    }
  };

  const handleApplyTemplate = () => {
    const template =
      selectedIssue.classification.level === 'Penanganan Terbatas'
        ? `Universitas Negeri Jakarta memperhatikan masukan terkait ${selectedIssue.title.toLowerCase()}. Tim layanan mahasiswa sedang menindaklanjuti laporan tersebut agar berjalan optimal. Terima kasih atas pengertiannya.`
        : `Universitas Negeri Jakarta memahami keluhan yang disampaikan terkait ${selectedIssue.title.toLowerCase()}. Saat ini, pihak kampus sedang melakukan penanganan untuk memastikan layanan kembali berjalan optimal secepatnya. Terima kasih atas pengertiannya.`;
    setDraft(template.slice(0, limit));
  };

  const handleCopy = async () => {
    if (!draft.trim()) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      notify('Pesan resmi berhasil disalin ke clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('Gagal menyalin otomatis. Silakan salin teks secara manual.', 'warning');
    }
  };

  const handleSaveDraft = () => {
    if (!draft.trim()) {
      notify('Isi pesan resmi tidak boleh kosong saat menyimpan draf.', 'warning');
      return;
    }
    saveDraftMessage(selectedIssue.id, draft, limit);
  };

  const handleSubmitApproval = () => {
    if (!draft.trim()) {
      notify('Tulis pesan resmi terlebih dahulu sebelum mengajukan persetujuan.', 'warning');
      return;
    }
    saveDraftMessage(selectedIssue.id, draft, limit);
    submitForApproval(selectedIssue.id);
  };

  const msgStatus = selectedIssue.officialMessage.status;
  const isApproved = msgStatus === 'Disetujui' || msgStatus === 'Dipublikasikan';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Pusat Respons Krisis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Formulasi pesan resmi (Hold Statement / Klarifikasi) dan alur persetujuan sebelum distribusi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="resp-issue-select" className="text-xs font-medium text-slate-600">
            Pilih Isu:
          </label>
          <select
            id="resp-issue-select"
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

      {/* Issue Context Banner */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs text-slate-500">Isu yang Sedang Ditangani</p>
          <p className="mt-0.5 font-display text-base font-bold text-slate-900">
            {selectedIssue.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <CrisisLevelText level={selectedIssue.classification.level} />
          <ApprovalStatusText status={msgStatus} />
        </div>
      </section>

      {selectedIssue.classification.crisisTeamActive && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-medium text-red-900">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
          <span>
            Mode Crisis Team Aktif · Jadwal konten reguler dihentikan sementara hingga pernyataan resmi selesai didistribusikan.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Section A: Official Message Editor */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Formulasi Pesan Resmi — Hold Statement / Klarifikasi
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Batas maksimal {limit} karakter agar siap dipublikasikan lintas platform media sosial.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyTemplate}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <FileText className="h-3.5 w-3.5" />
              Gunakan Format Standar UNJ
            </button>
          </div>

          <div className="mt-4">
            <textarea
              rows={6}
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              placeholder="Tuliskan pernyataan resmi atau hold statement universitas..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                {selectedIssue.officialMessage.rejectionReason && (
                  <span className="font-semibold text-red-700">
                    Catatan Penolakan: {selectedIssue.officialMessage.rejectionReason}
                  </span>
                )}
              </span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  draft.length >= limit ? 'text-red-600' : 'text-slate-700'
                }`}
              >
                {draft.length}/{limit}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Save className="h-3.5 w-3.5" />
                Simpan Draf
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" />
                {showPreview ? 'Tutup Pratinjau' : 'Pratinjau Pesan'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Tersalin' : 'Salin Pesan'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Draf
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmitApproval}
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Ajukan Persetujuan
            </button>
          </div>

          {/* Live Preview Card */}
          {showPreview && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Pratinjau Tampilan Pernyataan Resmi (@unj_official)
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                {draft || 'Belum ada teks pesan.'}
              </p>
              <p className="mt-2 font-mono text-[11px] text-slate-500">
                Panjang karakter: {draft.length}/{limit}
              </p>
            </div>
          )}

          {/* Section C: Persetujuan Pesan */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Tahap Persetujuan Pesan Resmi
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Pesan tidak boleh didistribusikan sebelum berstatus <strong>Disetujui</strong>.
                </p>
              </div>
              <ApprovalStatusText status={msgStatus} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!draft.trim()}
                  onClick={() => {
                    if (draft !== selectedIssue.officialMessage.draft) {
                      saveDraftMessage(selectedIssue.id, draft, limit);
                    }
                    reviewOfficialMessage(selectedIssue.id, true);
                  }}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Setujui Pesan Resmi
                </button>
                <button
                  type="button"
                  disabled={!draft.trim()}
                  onClick={() => setRejectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Tolak / Minta Revisi
                </button>
              </div>

              {isApproved && (
                <button
                  type="button"
                  onClick={() => setActivePage('distribution')}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Lanjutkan ke Distribusi Respons
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {selectedIssue.officialMessage.reviewedBy && (
              <p className="mt-3 text-[11px] text-slate-500">
                Terakhir ditinjau oleh {selectedIssue.officialMessage.reviewedBy} (Peran aktif:{' '}
                {currentUser?.role}).
              </p>
            )}
          </div>
        </section>

        {/* Section B: Rekomendasi Penyusunan Pesan */}
        <aside className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Panduan Penyusunan Pesan Resmi
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Pastikan pernyataan memenuhi 7 prinsip komunikasi krisis berikut sebelum diajukan:
          </p>
          <ol className="mt-4 space-y-3 text-xs leading-relaxed text-slate-700">
            {GUIDELINES.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                  {idx + 1}
                </span>
                <span>{g}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-bold text-slate-900">
              Tolak & Kembalikan untuk Revisi
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Berikan catatan bagian yang perlu diperbaiki oleh penyusun pesan.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Mohon perjelas estimasi tindak lanjut oleh unit layanan akademik."
              className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  reviewOfficialMessage(selectedIssue.id, false, rejectionReason);
                  setRejectionReason('');
                  setRejectModalOpen(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Tolak Pesan
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Hapus Draf Pesan Resmi?"
        description="Isi pernyataan resmi pada kotak editor akan dikosongkan."
        confirmLabel="Hapus Draf"
        variant="danger"
        onConfirm={() => {
          deleteDraftMessage(selectedIssue.id);
          setDraft('');
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};

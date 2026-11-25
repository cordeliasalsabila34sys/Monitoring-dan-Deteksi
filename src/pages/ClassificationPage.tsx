import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Headset,
  PauseCircle,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CrisisLevelText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';

export const ClassificationPage: React.FC = () => {
  const {
    issues,
    selectedIssue,
    setSelectedIssueId,
    classifyIssue,
    setActivePage,
  } = useCrisis();

  const [rationale, setRationale] = useState(
    selectedIssue.classification.rationale || ''
  );
  const [pendingDecision, setPendingDecision] = useState<null | boolean>(null);

  const verifiedCount = [
    selectedIssue.validation.sourceConfirmed,
    selectedIssue.validation.widespreadImpact,
    selectedIssue.validation.negativeSentimentRising,
  ].filter(Boolean).length;

  const confirmDecision = () => {
    if (pendingDecision === null) return;
    classifyIssue(selectedIssue.id, pendingDecision, rationale);
    setPendingDecision(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Klasifikasi Tingkat Krisis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Penetapan skala krisis berdasarkan hasil validasi sumber, dampak isu, bukti referensi, dan tren sentimen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cls-issue-select" className="text-xs font-medium text-slate-600">
            Pilih Isu:
          </label>
          <select
            id="cls-issue-select"
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

      {/* Multi-factor Validation Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {selectedIssue.title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Sumber: {selectedIssue.primarySource} ({selectedIssue.primaryChannel}) ·{' '}
              {formatNumberID(selectedIssue.mentions)} mention · {selectedIssue.negativePct}% negatif
            </p>
          </div>
          <CrisisLevelText level={selectedIssue.classification.level} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs text-slate-500">Sumber Terkonfirmasi</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {selectedIssue.validation.sourceConfirmed ? '✓ Ya' : 'Belum'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs text-slate-500">Dampak Meluas</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {selectedIssue.validation.widespreadImpact ? '✓ Ya' : 'Belum'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs text-slate-500">Sentimen Negatif Naik</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {selectedIssue.validation.negativeSentimentRising ? '✓ Ya' : 'Belum'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs text-slate-500">Kelengkapan Validasi</p>
            <p className="mt-1 font-mono text-sm font-bold text-blue-700">
              {verifiedCount}/3 Indikator · {selectedIssue.evidence.length} Bukti
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          <strong>Prinsip Klasifikasi:</strong> Keputusan tidak ditentukan hanya dari persentase sentimen negatif, melainkan mempertimbangkan keabsahan sumber, bukti terlampir, luas dampak, serta konfirmasi petugas berwenang.
        </p>
      </section>

      {/* Main Decision Prompt */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="text-center">
          <p className="text-xs font-semibold text-blue-700">
            Tahap Pengambilan Keputusan
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
            Apakah isu masuk kategori krisis tinggi?
          </h2>
        </div>

        <div className="mt-4">
          <label
            htmlFor="cls-rationale"
            className="block text-xs font-semibold text-slate-700"
          >
            Dasar Pertimbangan / Catatan Keputusan (Opsional)
          </label>
          <input
            id="cls-rationale"
            type="text"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Contoh: Dampak meluas ke beberapa fakultas dan membutuhkan klarifikasi pimpinan."
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Option A: YA (Krisis Tinggi) */}
          <div
            className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
              selectedIssue.classification.level === 'Krisis Tinggi'
                ? 'border-red-500 bg-red-50/70'
                : 'border-red-200 bg-red-50/30'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 text-red-700">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-display text-lg font-bold">
                  YA — Kategori Krisis Tinggi
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-red-600" />
                  Aktifkan status <strong>Crisis Team</strong>
                </li>
                <li className="flex items-center gap-2">
                  <PauseCircle className="h-3.5 w-3.5 text-red-600" />
                  Hentikan sementara jadwal konten reguler
                </li>
                <li className="flex items-center gap-2">
                  <AlertOctagon className="h-3.5 w-3.5 text-red-600" />
                  Ubah status isu menjadi <strong>Krisis Tinggi</strong>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setPendingDecision(true)}
              className="mt-5 w-full rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              Tetapkan sebagai Krisis Tinggi (YA)
            </button>
          </div>

          {/* Option B: TIDAK (Bukan Krisis Tinggi) */}
          <div
            className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
              selectedIssue.classification.level === 'Penanganan Terbatas'
                ? 'border-blue-500 bg-blue-50/70'
                : 'border-blue-200 bg-blue-50/30'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 text-blue-800">
                <Headset className="h-5 w-5" />
                <span className="font-display text-lg font-bold">
                  TIDAK — Bukan Krisis Tinggi
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Headset className="h-3.5 w-3.5 text-blue-700" />
                  Arahkan penanganan melalui <strong>Customer Service</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
                  Siapkan klarifikasi terbatas & lanjutkan monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
                  Ubah status menjadi <strong>Penanganan Terbatas</strong>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setPendingDecision(false)}
              className="mt-5 w-full rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-800"
            >
              Tetapkan Penanganan Terbatas (TIDAK)
            </button>
          </div>
        </div>
      </section>

      {/* Active Classification Outcome Banner & Next Step Convergence */}
      {selectedIssue.classification.level !== 'Belum Diklasifikasi' && (
        <section
          className={`rounded-xl border p-5 sm:p-6 ${
            selectedIssue.classification.level === 'Krisis Tinggi'
              ? 'border-red-300 bg-red-50'
              : 'border-blue-300 bg-blue-50'
          }`}
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-1.5">
              <p
                className={`text-sm font-bold ${
                  selectedIssue.classification.level === 'Krisis Tinggi'
                    ? 'text-red-900'
                    : 'text-blue-950'
                }`}
              >
                {selectedIssue.classification.level === 'Krisis Tinggi'
                  ? 'Isu dikategorikan sebagai krisis tinggi. Aktifkan Crisis Team dan lakukan penghentian sementara jadwal konten reguler untuk memprioritaskan penanganan krisis.'
                  : 'Isu belum masuk kategori krisis tinggi. Penanganan dilakukan melalui Customer Service atau klarifikasi terbatas dengan tetap memantau perkembangan isu.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                <span>
                  Ditetapkan oleh:{' '}
                  <strong>{selectedIssue.classification.decidedBy}</strong>
                </span>
                {selectedIssue.classification.decidedAt && (
                  <span>
                    Waktu: {formatDateTimeID(selectedIssue.classification.decidedAt)}
                  </span>
                )}
                {selectedIssue.classification.crisisTeamActive && (
                  <span className="font-semibold text-red-700">
                    ● Crisis Team AKTIF · Jadwal Konten Reguler DIJEDA
                  </span>
                )}
                {selectedIssue.classification.customerServiceRouted && (
                  <span className="font-semibold text-blue-800">
                    ● Dialihkan ke Customer Service & Klarifikasi Terbatas
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('response')}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#0B1F3A] px-5 py-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              Lanjutkan Formulasi Pesan Resmi
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={pendingDecision !== null}
        title={
          pendingDecision
            ? 'Konfirmasi Status Krisis Tinggi?'
            : 'Konfirmasi Penanganan Terbatas?'
        }
        description={
          pendingDecision
            ? 'Sistem akan menetapkan isu sebagai Krisis Tinggi, mengaktifkan Crisis Team, dan menandai penghentian sementara jadwal konten reguler.'
            : 'Sistem akan menetapkan isu sebagai Penanganan Terbatas dan mengarahkan tindak lanjut melalui Customer Service serta klarifikasi terbatas.'
        }
        confirmLabel={pendingDecision ? 'Ya, Aktifkan Crisis Team' : 'Konfirmasi Penanganan Terbatas'}
        variant={pendingDecision ? 'danger' : 'primary'}
        onConfirm={confirmDecision}
        onCancel={() => setPendingDecision(null)}
      />
    </div>
  );
};

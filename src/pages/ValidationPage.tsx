import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EarlyWarningText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { EvidenceItem } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';

export const ValidationPage: React.FC = () => {
  const {
    issues,
    selectedIssue,
    setSelectedIssueId,
    addEvidence,
    removeEvidence,
    saveValidation,
    setActivePage,
  } = useCrisis();

  const [sourceConfirmed, setSourceConfirmed] = useState(
    selectedIssue.validation.sourceConfirmed
  );
  const [widespreadImpact, setWidespreadImpact] = useState(
    selectedIssue.validation.widespreadImpact
  );
  const [negativeSentimentRising, setNegativeSentimentRising] = useState(
    selectedIssue.validation.negativeSentimentRising
  );
  const [notes, setNotes] = useState(selectedIssue.validation.notes);

  // Add evidence form
  const [evType, setEvType] = useState<EvidenceItem['type']>('Teks Percakapan');
  const [evAccount, setEvAccount] = useState('');
  const [evContent, setEvContent] = useState('');
  const [evUrlOrFile, setEvUrlOrFile] = useState('');
  const [evError, setEvError] = useState('');
  const [showEvForm, setShowEvForm] = useState(false);
  const [evidenceToDelete, setEvidenceToDelete] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    setSourceConfirmed(selectedIssue.validation.sourceConfirmed);
    setWidespreadImpact(selectedIssue.validation.widespreadImpact);
    setNegativeSentimentRising(selectedIssue.validation.negativeSentimentRising);
    setNotes(selectedIssue.validation.notes);
  }, [selectedIssue]);

  const verifiedCount = [
    sourceConfirmed,
    widespreadImpact,
    negativeSentimentRising,
  ].filter(Boolean).length;

  const handleSaveValidation = () => {
    saveValidation(selectedIssue.id, {
      sourceConfirmed,
      widespreadImpact,
      negativeSentimentRising,
      notes,
    });
  };

  const handleProceedClassification = () => {
    saveValidation(selectedIssue.id, {
      sourceConfirmed,
      widespreadImpact,
      negativeSentimentRising,
      notes,
    });
    setActivePage('classification');
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evAccount.trim() || !evContent.trim()) {
      setEvError('Sumber akun dan keterangan/kutipan bukti wajib diisi.');
      return;
    }
    addEvidence(selectedIssue.id, {
      type: evType,
      sourceAccount: evAccount.trim(),
      timestampLabel: 'Baru saja',
      content: evContent.trim(),
      urlOrFile: evUrlOrFile.trim() || undefined,
    });
    setEvAccount('');
    setEvContent('');
    setEvUrlOrFile('');
    setEvError('');
    setShowEvForm(false);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvUrlOrFile(file.name);
    if (!evContent.trim()) {
      setEvContent(`Lampiran screenshot: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Validasi dan Klarifikasi Isu
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Verifikasi keabsahan sumber, kelengkapan bukti referensi, serta dampak eskalasi sebelum menentukan tingkat krisis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="val-issue-select" className="text-xs font-medium text-slate-600">
            Pilih Isu:
          </label>
          <select
            id="val-issue-select"
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

      {/* Section A: Issue Details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-700">
                {selectedIssue.primarySource}
              </span>
              <span aria-hidden="true">·</span>
              <span>{selectedIssue.primaryChannel}</span>
              <span aria-hidden="true">·</span>
              <span>Ditemukan {formatDateTimeID(selectedIssue.discoveredAt)}</span>
            </div>
            <h2 className="mt-1.5 font-display text-xl font-bold text-slate-900">
              {selectedIssue.title}
            </h2>
          </div>
          <EarlyWarningText level={selectedIssue.earlyWarning} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {selectedIssue.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Jumlah Mention</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
              {formatNumberID(selectedIssue.mentions)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sentimen Negatif</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-red-600">
              {selectedIssue.negativePct}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Bukti & Referensi</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900">
              {selectedIssue.evidence.length} item
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status Indikator</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-blue-700">
              {verifiedCount}/3
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Section B: Bukti & Referensi */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Bukti & Referensi Informasi
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Lampiran tautan postingan, kutipan percakapan, tangkapan layar, atau dokumen pendukung.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEvForm((v) => !v)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Bukti
            </button>
          </div>

          {showEvForm && (
            <form
              onSubmit={handleAddEvidence}
              className="mt-4 space-y-3 rounded-lg border border-blue-200 bg-slate-50 p-4"
            >
              {evError && (
                <p className="rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                  {evError}
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Jenis Bukti
                  </label>
                  <select
                    value={evType}
                    onChange={(e) => setEvType(e.target.value as EvidenceItem['type'])}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="Teks Percakapan">Teks Percakapan</option>
                    <option value="Tautan">Tautan Postingan</option>
                    <option value="Screenshot">Screenshot</option>
                    <option value="Dokumen Pendukung">Dokumen Pendukung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Akun / Sumber Bukti
                  </label>
                  <input
                    type="text"
                    value={evAccount}
                    onChange={(e) => setEvAccount(e.target.value)}
                    placeholder="Contoh: @mahasiswaUNJ / Laporan Layanan"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {evType === 'Tautan' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    URL Postingan
                  </label>
                  <input
                    type="url"
                    value={evUrlOrFile}
                    onChange={(e) => setEvUrlOrFile(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              )}

              {(evType === 'Screenshot' || evType === 'Dokumen Pendukung') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Pilih Berkas / Nama Dokumen
                  </label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="file"
                      accept={evType === 'Screenshot' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                      onChange={handleScreenshotUpload}
                      className="text-xs text-slate-600"
                    />
                    <input
                      type="text"
                      value={evUrlOrFile}
                      onChange={(e) => setEvUrlOrFile(e.target.value)}
                      placeholder="Atau tuliskan nama berkas/referensi"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Isi Kutipan / Deskripsi Bukti
                </label>
                <textarea
                  rows={2}
                  value={evContent}
                  onChange={(e) => setEvContent(e.target.value)}
                  placeholder="Tuliskan kutipan teks atau ringkasan bukti..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEvForm(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1D4ED8] px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  Simpan Bukti
                </button>
              </div>
            </form>
          )}

          {selectedIssue.evidence.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Belum ada bukti referensi tercatat untuk isu ini. Klik <em>Tambah Bukti</em> untuk melampirkan data pendukung.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-200">
              {selectedIssue.evidence.map((ev) => {
                const TypeIcon =
                  ev.type === 'Tautan'
                    ? Link2
                    : ev.type === 'Screenshot'
                    ? ImageIcon
                    : ev.type === 'Dokumen Pendukung'
                    ? FileText
                    : MessageSquare;

                return (
                  <div key={ev.id} className="py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <TypeIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-900">
                              {ev.sourceAccount}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">{ev.type}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">{ev.timestampLabel}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-700">“{ev.content}”</p>
                          {ev.urlOrFile && (
                            <p className="mt-1 font-mono text-xs text-blue-700">
                              Referensi: {ev.urlOrFile}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewEvidence(ev)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Lihat detail bukti"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvidenceToDelete(ev.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Hapus bukti"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section C: Checklist Verifikasi */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-display text-base font-bold text-slate-900">
              Checklist Verifikasi
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Periksa seluruh indikator validasi sebelum mengambil keputusan klasifikasi krisis.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                key: 'sourceConfirmed',
                label: 'Sumber informasi terkonfirmasi',
                desc: 'Akun atau laporan asal dapat ditelusuri dan bukti kejadian valid.',
                checked: sourceConfirmed,
                toggle: () => setSourceConfirmed((v) => !v),
              },
              {
                key: 'widespreadImpact',
                label: 'Dampak isu meluas',
                desc: 'Isu mulai dibahas lintas akun, fakultas, atau berpotensi memengaruhi citra institusi.',
                checked: widespreadImpact,
                toggle: () => setWidespreadImpact((v) => !v),
              },
              {
                key: 'negativeSentimentRising',
                label: 'Sentimen negatif meningkat',
                desc: 'Keluhan publik meningkat dan menunjukkan eskalasi opini negatif.',
                checked: negativeSentimentRising,
                toggle: () => setNegativeSentimentRising((v) => !v),
              },
            ].map((item) => (
              <label
                key={item.key}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  item.checked
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={item.toggle}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Indicator Counter & Warning */}
          <div className="mt-4">
            {verifiedCount < 3 ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">
                    Validasi belum lengkap ({verifiedCount}/3 indikator terverifikasi)
                  </p>
                  <p className="mt-0.5">
                    Periksa seluruh indikator verifikasi di atas agar keputusan klasifikasi krisis lebih akurat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">
                    Seluruh indikator validasi terverifikasi (3/3)
                  </p>
                  <p className="mt-0.5">
                    Isu siap dilanjutkan ke tahap Klasifikasi Tingkat Krisis.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="validation-notes"
              className="block text-xs font-semibold text-slate-700"
            >
              Catatan Hasil Verifikasi
            </label>
            <textarea
              id="validation-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan koordinasi unit terkait atau temuan verifikasi..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveValidation}
              className="flex-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Simpan Validasi
            </button>
            <button
              type="button"
              onClick={handleProceedClassification}
              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Lanjutkan ke Klasifikasi
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* Preview Evidence Modal */}
      {previewEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-bold text-slate-900">
              Detail Bukti & Referensi
            </h3>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p>
                <strong>Jenis:</strong> {previewEvidence.type}
              </p>
              <p>
                <strong>Sumber:</strong> {previewEvidence.sourceAccount}
              </p>
              <p>
                <strong>Waktu:</strong> {previewEvidence.timestampLabel}
              </p>
              <p>
                <strong>Ditambahkan oleh:</strong> {previewEvidence.addedBy}
              </p>
              {previewEvidence.urlOrFile && (
                <p className="break-all font-mono text-blue-700">
                  {previewEvidence.urlOrFile}
                </p>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                “{previewEvidence.content}”
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(evidenceToDelete)}
        title="Hapus Bukti Referensi?"
        description="Item bukti ini akan dihapus permanen dari daftar validasi isu."
        confirmLabel="Hapus Bukti"
        variant="danger"
        onConfirm={() => {
          if (evidenceToDelete) {
            removeEvidence(selectedIssue.id, evidenceToDelete);
          }
          setEvidenceToDelete(null);
        }}
        onCancel={() => setEvidenceToDelete(null)}
      />
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Calendar, Eye, Search, X } from 'lucide-react';
import { CrisisLevelText, RecoveryStatusText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { CrisisIssue, CrisisLevel, RecoveryStatus } from '../types/crisis';
import { formatDateTimeID } from '../utils/crypto';

export const HistoryPage: React.FC = () => {
  const { issues, activityLogs } = useCrisis();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'Semua' | CrisisLevel>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | RecoveryStatus>('Semua');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<CrisisIssue | null>(null);

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((iss) => {
      if (levelFilter !== 'Semua' && iss.classification.level !== levelFilter) return false;
      if (statusFilter !== 'Semua' && iss.evaluation.recoveryStatus !== statusFilter)
        return false;
      const isoDay = iss.discoveredAt.slice(0, 10);
      if (dateFrom && isoDay < dateFrom) return false;
      if (dateTo && isoDay > dateTo) return false;
      if (!q) return true;
      return (
        iss.title.toLowerCase().includes(q) ||
        iss.primarySource.toLowerCase().includes(q) ||
        iss.officialMessage.draft.toLowerCase().includes(q)
      );
    });
  }, [issues, search, levelFilter, statusFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Riwayat Penanganan Krisis
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Arsip lengkap isu, validasi, keputusan klasifikasi, pesan resmi, distribusi, evaluasi, dan jejak aktivitas.
        </p>
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">
              Pencarian Riwayat
            </label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama isu, sumber, atau isi klarifikasi..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Tingkat Krisis
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as 'Semua' | CrisisLevel)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              <option value="Semua">Semua Tingkat</option>
              <option value="Krisis Tinggi">Krisis Tinggi</option>
              <option value="Penanganan Terbatas">Penanganan Terbatas</option>
              <option value="Belum Diklasifikasi">Belum Diklasifikasi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Status Akhir
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'Semua' | RecoveryStatus)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              <option value="Semua">Semua Status</option>
              <option value="Dalam Pemantauan">Dalam Pemantauan</option>
              <option value="Proses Pemulihan">Proses Pemulihan</option>
              <option value="Krisis Teratasi">Krisis Teratasi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Rentang Tanggal
            </label>
            <div className="mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Dari tanggal"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 font-mono text-[11px]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Sampai tanggal"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Handled Issues Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Rekapitulasi Isu & Penanganan ({filteredIssues.length})
          </h2>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada riwayat penanganan yang sesuai dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Isu & Tanggal Ditemukan</th>
                  <th className="px-5 py-3">Validasi</th>
                  <th className="px-5 py-3">Tingkat Krisis</th>
                  <th className="px-5 py-3">Tindakan & Distribusi</th>
                  <th className="px-5 py-3">Status Akhir</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIssues.map((iss) => {
                  const checks = [
                    iss.validation.sourceConfirmed,
                    iss.validation.widespreadImpact,
                    iss.validation.negativeSentimentRising,
                  ].filter(Boolean).length;
                  const platforms = Array.from(
                    new Set(iss.distributions.flatMap((d) => d.platforms))
                  );

                  return (
                    <tr key={iss.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 align-top">
                        <p className="font-semibold text-slate-900">{iss.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {iss.primarySource} · {formatDateTimeID(iss.discoveredAt)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 align-top font-mono tabular-nums text-slate-700">
                        {checks}/3 indikator · {iss.evidence.length} bukti
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <CrisisLevelText level={iss.classification.level} />
                      </td>
                      <td className="px-5 py-3.5 align-top text-slate-700">
                        <p>
                          {iss.classification.crisisTeamActive
                            ? 'Crisis Team & Pause Konten'
                            : iss.classification.customerServiceRouted
                            ? 'Customer Service & Klarifikasi Terbatas'
                            : 'Menunggu Klasifikasi'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Distribusi:{' '}
                          {platforms.length > 0 ? platforms.join(', ') : 'Belum ada'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <RecoveryStatusText status={iss.evaluation.recoveryStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-right align-top">
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(iss)}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Lihat Detail Penanganan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Activity Audit Trail */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          Log Perubahan Status & Aktivitas Sistem
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Setiap keputusan klasifikasi, persetujuan pesan, simulasi distribusi, dan evaluasi terekam secara kronologis.
        </p>

        <div className="mt-4 divide-y divide-slate-200">
          {activityLogs.slice(0, 20).map((log) => (
            <div
              key={log.id}
              className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {log.action}{' '}
                  <span className="font-normal text-slate-500">
                    pada isu “{log.issueTitle}”
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{log.detail}</p>
              </div>
              <div className="shrink-0 text-left text-[11px] text-slate-500 sm:text-right">
                <p className="font-medium text-slate-700">
                  {log.actor} ({log.role})
                </p>
                <p className="font-mono">{formatDateTimeID(log.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs text-slate-500">
                  Arsip Penanganan · {selectedDetail.primarySource} (
                  {selectedDetail.primaryChannel})
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                  {selectedDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Hasil Validasi</p>
                <p>
                  Sumber Terkonfirmasi:{' '}
                  {selectedDetail.validation.sourceConfirmed ? 'Ya' : 'Tidak'} · Dampak
                  Meluas: {selectedDetail.validation.widespreadImpact ? 'Ya' : 'Tidak'} ·
                  Sentimen Negatif Meningkat:{' '}
                  {selectedDetail.validation.negativeSentimentRising ? 'Ya' : 'Tidak'}
                </p>
                <p className="mt-1 text-slate-600">
                  Catatan: {selectedDetail.validation.notes || '-'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Tingkat Krisis & Tindakan
                </p>
                <p>
                  Klasifikasi: <strong>{selectedDetail.classification.level}</strong>{' '}
                  {selectedDetail.classification.decidedBy
                    ? `(${selectedDetail.classification.decidedBy})`
                    : ''}
                </p>
                <p>
                  Tindakan:{' '}
                  {selectedDetail.classification.crisisTeamActive
                    ? 'Crisis Team Diaktifkan & Jadwal Konten Dihentikan Sementara'
                    : selectedDetail.classification.customerServiceRouted
                    ? 'Penanganan Customer Service & Klarifikasi Terbatas'
                    : 'Belum ditetapkan'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Pesan Resmi ({selectedDetail.officialMessage.status})
                </p>
                <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {selectedDetail.officialMessage.draft || 'Belum disusun.'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Distribusi & Hasil Evaluasi ({selectedDetail.evaluation.recoveryStatus})
                </p>
                <p>
                  Platform:{' '}
                  {Array.from(
                    new Set(selectedDetail.distributions.flatMap((d) => d.platforms))
                  ).join(', ') || 'Belum didistribusikan'}
                </p>
                <p className="mt-1">
                  Ringkasan Evaluasi:{' '}
                  {selectedDetail.evaluation.summaryNote || 'Belum ada evaluasi tertulis.'}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="font-semibold text-slate-900">
                  Jejak Aktivitas Terkait Isu Ini
                </p>
                <ul className="mt-2 space-y-2">
                  {activityLogs
                    .filter((l) => l.issueId === selectedDetail.id)
                    .map((l) => (
                      <li key={l.id} className="rounded bg-slate-50 px-3 py-2">
                        <span className="font-semibold text-slate-900">{l.action}</span>{' '}
                        · {formatDateTimeID(l.timestamp)} oleh {l.actor}
                        <p className="text-slate-600">{l.detail}</p>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

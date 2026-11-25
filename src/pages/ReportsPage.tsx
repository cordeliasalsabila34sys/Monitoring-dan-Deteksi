import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';
import { CrisisLevelText, RecoveryStatusText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';
import { exportIssuesToCSV, exportReportToPDF } from '../utils/exportUtils';

type ReportPeriod = 'today' | '7d' | '30d' | 'all';

export const ReportsPage: React.FC = () => {
  const { issues, currentUser, notify } = useCrisis();
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [generatedAt, setGeneratedAt] = useState<string>(new Date().toISOString());

  const periodLabel =
    period === 'today'
      ? 'Hari Ini'
      : period === '7d'
      ? '7 Hari Terakhir'
      : period === '30d'
      ? '30 Hari Terakhir'
      : 'Seluruh Periode';

  const filteredIssues = useMemo(() => {
    const nowMs = Date.now();
    const cutoffDays =
      period === 'today' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 36500;
    const cutoffMs = nowMs - cutoffDays * 86400 * 1000;
    return issues.filter((iss) => {
      const t = Date.parse(iss.discoveredAt);
      if (Number.isNaN(t)) return true;
      return t >= cutoffMs;
    });
  }, [issues, period]);

  const stats = useMemo(() => {
    const totalMentions = filteredIssues.reduce((s, i) => s + i.mentions, 0);
    const avgNegativePct =
      totalMentions === 0
        ? 0
        : Math.round(
            (filteredIssues.reduce((s, i) => s + (i.mentions * i.negativePct) / 100, 0) /
              totalMentions) *
              100
          );
    const avgPositivePct =
      totalMentions === 0
        ? 0
        : Math.round(
            (filteredIssues.reduce((s, i) => s + (i.mentions * i.positivePct) / 100, 0) /
              totalMentions) *
              100
          );
    const validatedCount = filteredIssues.filter(
      (i) =>
        i.validation.sourceConfirmed &&
        i.validation.widespreadImpact &&
        i.validation.negativeSentimentRising
    ).length;
    const highCrisisCount = filteredIssues.filter(
      (i) => i.classification.level === 'Krisis Tinggi'
    ).length;
    const limitedCount = filteredIssues.filter(
      (i) => i.classification.level === 'Penanganan Terbatas'
    ).length;
    const distributedCount = filteredIssues.filter(
      (i) => i.distributions.length > 0
    ).length;
    const resolvedCount = filteredIssues.filter(
      (i) => i.evaluation.recoveryStatus === 'Krisis Teratasi'
    ).length;

    return {
      totalMentions,
      avgNegativePct,
      avgPositivePct,
      validatedCount,
      highCrisisCount,
      limitedCount,
      distributedCount,
      resolvedCount,
    };
  }, [filteredIssues]);

  const handleRegenerate = () => {
    setGeneratedAt(new Date().toISOString());
    notify(`Laporan periode ${periodLabel} berhasil diperbarui dari data tersimpan.`, 'success');
  };

  const handleDownloadPDF = () => {
    exportReportToPDF(
      filteredIssues,
      periodLabel,
      currentUser?.name || 'Tim Humas UNJ',
      stats
    );
    notify('Laporan PDF berhasil dibuat dan diunduh.', 'success');
  };

  const handleExportCSV = () => {
    exportIssuesToCSV(filteredIssues, periodLabel);
    notify('Data CSV berhasil diekspor.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Laporan Monitoring & Manajemen Krisis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Laporan formal terhitung langsung dari data validasi, klasifikasi, distribusi, dan evaluasi yang tersimpan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            Ekspor Data CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Unduh Laporan PDF
          </button>
        </div>
      </div>

      {/* Period Selector & Generate Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Periode Laporan:</span>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                { id: 'today', label: 'Hari ini' },
                { id: '7d', label: '7 hari terakhir' },
                { id: '30d', label: '30 hari terakhir' },
                { id: 'all', label: 'Semua periode' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${
                  period === opt.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-slate-500">
            Disusun: {formatDateTimeID(generatedAt)}
          </span>
          <button
            type="button"
            onClick={handleRegenerate}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Buat Laporan
          </button>
        </div>
      </section>

      {/* Formal Report Sheet */}
      <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold text-blue-700">
              DOKUMEN REKAPITULASI KEHUMASAN UNJ
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
              Laporan Pengelolaan Krisis Media Sosial — {periodLabel}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Disusun oleh: {currentUser?.name} ({currentUser?.role}) · Sumber data: Penyimpanan Sistem CrisisWatch
            </p>
          </div>
          <FileText className="h-8 w-8 text-slate-300" />
        </div>

        {/* 9 Structured Report Points */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">1. Ringkasan Monitoring</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {formatNumberID(stats.totalMentions)} mention
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">2. Jumlah Isu Ditemukan</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {filteredIssues.length} isu
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">3. Hasil Analisis Sentimen</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
              <span className="text-red-600">{stats.avgNegativePct}% Neg</span> ·{' '}
              <span className="text-emerald-700">{stats.avgPositivePct}% Pos</span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">4. Isu Tervalidasi Penuh (3/3)</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {stats.validatedCount} isu
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">5. Klasifikasi Tingkat Krisis</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {stats.highCrisisCount} Krisis Tinggi · {stats.limitedCount} Terbatas
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              6–9. Distribusi & Pemulihan Reputasi
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {stats.distributedCount} Terdistribusi · {stats.resolvedCount} Teratasi
            </p>
          </div>
        </div>

        {/* Detailed Issue Breakdown Table */}
        <div className="mt-8">
          <h3 className="font-display text-base font-bold text-slate-900">
            Rincian Penanganan, Distribusi Pesan, Evaluasi & Pemulihan
          </h3>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Nama Isu</th>
                  <th className="px-4 py-3 text-right">Mention</th>
                  <th className="px-4 py-3 text-right">Negatif</th>
                  <th className="px-4 py-3">Klasifikasi & Tindakan</th>
                  <th className="px-4 py-3">Distribusi Pesan Resmi</th>
                  <th className="px-4 py-3">Evaluasi & Pemulihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIssues.map((iss) => {
                  const platforms = Array.from(
                    new Set(iss.distributions.flatMap((d) => d.platforms))
                  );
                  return (
                    <tr key={iss.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-slate-900">{iss.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {iss.primarySource} · {iss.primaryChannel}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right align-top font-mono tabular-nums">
                        {formatNumberID(iss.mentions)}
                      </td>
                      <td className="px-4 py-3 text-right align-top font-mono tabular-nums text-red-600">
                        {iss.negativePct}%
                      </td>
                      <td className="px-4 py-3 align-top">
                        <CrisisLevelText level={iss.classification.level} />
                        <p className="mt-1 text-[11px] text-slate-600">
                          {iss.classification.crisisTeamActive
                            ? 'Crisis Team Aktif'
                            : iss.classification.customerServiceRouted
                            ? 'Via Customer Service'
                            : 'Menunggu keputusan'}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-slate-800">
                          {iss.officialMessage.status}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {platforms.length > 0
                            ? platforms.join(', ')
                            : 'Belum didistribusikan'}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RecoveryStatusText status={iss.evaluation.recoveryStatus} />
                        <p className="mt-1 text-[11px] text-slate-500">
                          Pasca-respons: {iss.evaluation.afterNegativePct}% neg
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </div>
  );
};

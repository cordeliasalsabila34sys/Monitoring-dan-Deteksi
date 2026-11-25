import React, { useMemo, useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Calendar,
  Eye,
  Flame,
  MessageSquare,
  Plus,
  TrendingDown,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AddIssueModal } from '../components/AddIssueModal';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { CrisisLevelText, EarlyWarningText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { CrisisIssue } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';

type TimeFilter = 'today' | '7d' | '30d' | 'custom';
type ChannelView = 'all' | 'email' | 'medsos' | 'acara';

export const DashboardPage: React.FC = () => {
  const {
    activeIssues,
    trendData,
    dashboardMetrics,
    setSelectedIssueId,
    setActivePage,
  } = useCrisis();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [channelView, setChannelView] = useState<ChannelView>('all');
  const [startDate, setStartDate] = useState<string>(() => trendData[15]?.date || '');
  const [endDate, setEndDate] = useState<string>(
    () => trendData[trendData.length - 1]?.date || ''
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailIssue, setDetailIssue] = useState<CrisisIssue | null>(null);

  const highRiskIssues = useMemo(
    () =>
      activeIssues.filter(
        (i) => i.earlyWarning === 'krisis' || i.classification.level === 'Krisis Tinggi'
      ),
    [activeIssues]
  );

  const filteredTrend = useMemo(() => {
    let slice = trendData;
    if (timeFilter === 'today') {
      const latest = trendData[trendData.length - 1];
      if (!latest) return [];
      // Hourly breakdown simulated from today's snapshot
      return ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map((hr, idx) => {
        const factor = (idx + 2) / 6;
        return {
          label: hr,
          emailPositif: Math.round(latest.emailPositif * factor * 0.4),
          emailNetral: Math.round(latest.emailNetral * factor * 0.4),
          emailNegatif: Math.round(latest.emailNegatif * factor * 0.5),
          medsosPositif: Math.round(latest.medsosPositif * factor * 0.45),
          medsosNetral: Math.round(latest.medsosNetral * factor * 0.45),
          medsosNegatif: Math.round(latest.medsosNegatif * factor * 0.65),
          acaraPositif: Math.round(latest.acaraPositif * factor * 0.4),
          acaraNetral: Math.round(latest.acaraNetral * factor * 0.4),
          acaraNegatif: Math.round(latest.acaraNegatif * factor * 0.5),
        };
      });
    } else if (timeFilter === '7d') {
      slice = trendData.slice(-7);
    } else if (timeFilter === 'custom' && startDate && endDate) {
      const subset = trendData.filter((d) => d.date >= startDate && d.date <= endDate);
      slice = subset.length > 0 ? subset : trendData.slice(-7);
    }

    return slice;
  }, [trendData, timeFilter, startDate, endDate]);

  const chartData = useMemo(() => {
    return filteredTrend.map((d) => {
      if (channelView === 'email') {
        return {
          label: d.label,
          Positif: d.emailPositif,
          Netral: d.emailNetral,
          Negatif: d.emailNegatif,
        };
      }
      if (channelView === 'medsos') {
        return {
          label: d.label,
          Positif: d.medsosPositif,
          Netral: d.medsosNetral,
          Negatif: d.medsosNegatif,
        };
      }
      if (channelView === 'acara') {
        return {
          label: d.label,
          Positif: d.acaraPositif,
          Netral: d.acaraNetral,
          Negatif: d.acaraNegatif,
        };
      }
      return {
        label: d.label,
        Email: d.emailNegatif + d.emailNetral + d.emailPositif,
        'Media Sosial': d.medsosNegatif + d.medsosNetral + d.medsosPositif,
        'Acara/Kegiatan': d.acaraNegatif + d.acaraNetral + d.acaraPositif,
        Negatif: d.emailNegatif + d.medsosNegatif + d.acaraNegatif,
      };
    });
  }, [filteredTrend, channelView]);

  const handleAnalyzeIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
    setActivePage('validation');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Monitoring Krisis UNJ
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan pemantauan isu publik, pergerakan sentimen, dan status deteksi dini · Data Simulasi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Isu Baru
        </button>
      </div>

      {/* Early Warning Risk Alert */}
      {highRiskIssues.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-900">
                Peringatan Dini: {highRiskIssues.length} Isu Membutuhkan Validasi & Penanganan Prioritas
              </p>
              <p className="mt-0.5 text-xs text-red-800">
                Isu prioritas:{' '}
                <span className="font-semibold">
                  {highRiskIssues.map((i) => i.title).join(', ')}
                </span>
                . Lakukan verifikasi bukti dan tentukan klasifikasi tingkat krisis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAnalyzeIssue(highRiskIssues[0].id)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            Validasi Sekarang
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Mention Hari Ini
            </span>
            <MessageSquare className="h-4 w-4 text-blue-700" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-slate-900">
            {formatNumberID(dashboardMetrics.totalMentionsToday)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Akumulasi seluruh saluran · Data Simulasi
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Persentase Sentimen Negatif
            </span>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-red-600">
            {dashboardMetrics.negativePctToday}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Rasio percakapan negatif terhadap total mention
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Jumlah Isu Aktif
            </span>
            <Flame className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-slate-900">
            {dashboardMetrics.activeIssuesCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Isu dalam tahap pemantauan atau penanganan
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Isu Berpotensi Krisis
            </span>
            <AlertOctagon className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-red-600">
            {dashboardMetrics.potentialCrisisCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Memenuhi indikator peringatan dini tingkat tinggi
          </p>
        </div>
      </div>

      {/* Interactive Sentiment Trend Chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Grafik Tren Sentimen Lintas Saluran
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Perbandingan volume percakapan Email, Media Sosial, dan Acara/Kegiatan · Data Simulasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time range segmented buttons */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  { id: 'today', label: 'Hari ini' },
                  { id: '7d', label: '7 hari terakhir' },
                  { id: '30d', label: '30 hari terakhir' },
                  { id: 'custom', label: 'Rentang tanggal' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeFilter(opt.id)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    timeFilter === opt.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Breakdown Filter + Custom Date Range */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'Semua Saluran' },
                { id: 'medsos', label: 'Media Sosial (Pos/Net/Neg)' },
                { id: 'email', label: 'Email (Pos/Net/Neg)' },
                { id: 'acara', label: 'Acara/Kegiatan (Pos/Net/Neg)' },
              ] as const
            ).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannelView(ch.id)}
                className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  channelView === ch.id
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {timeFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-slate-300 px-2.5 py-1 font-mono text-xs text-slate-800"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-slate-300 px-2.5 py-1 font-mono text-xs text-slate-800"
              />
            </div>
          )}
        </div>

        <div className="mt-5 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              {channelView === 'all' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="Media Sosial"
                    stroke="#1D4ED8"
                    fill="#DBEAFE"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Email"
                    stroke="#0F172A"
                    fill="#E2E8F0"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Acara/Kegiatan"
                    stroke="#D97706"
                    fill="#FEF3C7"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Negatif"
                    stroke="#DC2626"
                    fill="#FEE2E2"
                    strokeWidth={2}
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="Negatif"
                    stroke="#DC2626"
                    fill="#FEE2E2"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Netral"
                    stroke="#64748B"
                    fill="#F1F5F9"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Positif"
                    stroke="#16A34A"
                    fill="#DCFCE7"
                    strokeWidth={2}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monitored Issues List */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Daftar Isu yang Sedang Dipantau
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Pilih “Lihat Detail” untuk ringkasan bukti atau “Analisis Isu” untuk memulai validasi krisis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('monitoring')}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Buka Monitoring Lengkap →
          </button>
        </div>

        {activeIssues.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Seluruh isu aktif telah terselesaikan.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tambahkan isu baru untuk melakukan simulasi pemantauan dan penanganan krisis.
            </p>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Isu Baru
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {activeIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-col justify-between gap-4 px-5 py-5 transition-colors hover:bg-slate-50/70 sm:px-6 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-medium text-slate-700">
                      {issue.primarySource}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{issue.primaryChannel}</span>
                    <span aria-hidden="true">·</span>
                    <span>Diperbarui {formatDateTimeID(issue.lastUpdated)}</span>
                    {issue.isSimulated && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-700">Data Simulasi</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                    {issue.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {issue.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-5">
                    <EarlyWarningText level={issue.earlyWarning} />
                    <CrisisLevelText level={issue.classification.level} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 lg:shrink-0">
                  <div className="flex items-center gap-6">
                    <div className="text-left lg:text-right">
                      <p className="text-[11px] text-slate-500">Mention</p>
                      <p className="font-mono text-lg font-bold tabular-nums text-slate-900">
                        {formatNumberID(issue.mentions)}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-[11px] text-slate-500">Sentimen Negatif</p>
                      <p
                        className={`font-mono text-lg font-bold tabular-nums ${
                          issue.negativePct >= 65
                            ? 'text-red-600'
                            : issue.negativePct >= 50
                            ? 'text-amber-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {issue.negativePct}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDetailIssue(issue)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnalyzeIssue(issue.id)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      Analisis Isu
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddIssueModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={(id) => {
          setSelectedIssueId(id);
        }}
      />

      <IssueDetailModal
        issue={detailIssue}
        onClose={() => setDetailIssue(null)}
        onAnalyze={handleAnalyzeIssue}
      />
    </div>
  );
};

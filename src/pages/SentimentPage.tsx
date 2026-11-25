import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCrisis } from '../context/CrisisContext';
import { SentimentType, SourceChannel } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';

const CHANNELS: SourceChannel[] = [
  'Instagram',
  'Twitter/X',
  'TikTok',
  'Website',
  'Email',
  'Acara/Kegiatan',
];

export const SentimentPage: React.FC = () => {
  const { issues, mentions, selectedIssue, setSelectedIssueId, updateMentionSentiment } =
    useCrisis();
  const [scope, setScope] = useState<'all' | 'selected'>('all');

  const aggregateStats = useMemo(() => {
    const targetIssues = scope === 'selected' && selectedIssue ? [selectedIssue] : issues;
    const total = targetIssues.reduce((s, i) => s + i.mentions, 0) || 1;
    const neg = Math.round(
      targetIssues.reduce((s, i) => s + (i.mentions * i.negativePct) / 100, 0)
    );
    const neu = Math.round(
      targetIssues.reduce((s, i) => s + (i.mentions * i.neutralPct) / 100, 0)
    );
    const pos = Math.max(0, total - neg - neu);

    return {
      total,
      negPct: Math.round((neg / total) * 100),
      neuPct: Math.round((neu / total) * 100),
      posPct: Math.max(0, 100 - Math.round((neg / total) * 100) - Math.round((neu / total) * 100)),
      pieData: [
        { name: 'Negatif', value: neg, color: '#DC2626' },
        { name: 'Netral', value: neu, color: '#64748B' },
        { name: 'Positif', value: pos, color: '#16A34A' },
      ],
    };
  }, [issues, selectedIssue, scope]);

  const channelBreakdown = useMemo(() => {
    const relevant =
      scope === 'selected' && selectedIssue
        ? mentions.filter((m) => m.issueId === selectedIssue.id)
        : mentions;

    return CHANNELS.map((ch) => {
      const list = relevant.filter((m) => m.channel === ch);
      return {
        channel: ch,
        Negatif: list.filter((m) => m.sentiment === 'Negatif').length,
        Netral: list.filter((m) => m.sentiment === 'Netral').length,
        Positif: list.filter((m) => m.sentiment === 'Positif').length,
      };
    });
  }, [mentions, scope, selectedIssue]);

  const displayedMentions = useMemo(() => {
    if (scope === 'selected' && selectedIssue) {
      return mentions.filter((m) => m.issueId === selectedIssue.id);
    }
    return mentions;
  }, [mentions, scope, selectedIssue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Analisis Sentimen Publik
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Klasifikasi percakapan Positif, Netral, dan Negatif per isu dan saluran · Data Simulasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${
                scope === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Semua Isu
            </button>
            <button
              type="button"
              onClick={() => setScope('selected')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${
                scope === 'selected' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Per Isu Terpilih
            </button>
          </div>

          {scope === 'selected' && (
            <select
              value={selectedIssue?.id || ''}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800"
            >
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Percentages */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Sentimen Negatif</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-red-600">
            {aggregateStats.negPct}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dari {formatNumberID(aggregateStats.total)} total mention · Data Simulasi
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Sentimen Netral</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-slate-700">
            {aggregateStats.neuPct}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pertanyaan informasional & netral
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Sentimen Positif</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-emerald-600">
            {aggregateStats.posPct}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dukungan & apresiasi publik
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Distribusi Proporsi Sentimen
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Komposisi sentimen Positif, Netral, dan Negatif (Data Simulasi)
          </p>
          <div className="mt-4 h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aggregateStats.pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {aggregateStats.pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Sebaran Sentimen Sampel per Saluran
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Berdasarkan percakapan tercatat pada masing-masing kategori sumber
          </p>
          <div className="mt-4 h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelBreakdown} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Negatif" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Netral" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Positif" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Re-classification Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Klasifikasi Sentimen Percakapan (Dapat Disesuaikan Manual)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Tim Humas dapat mengoreksi kategori sentimen secara manual agar hasil analisis sesuai konteks bahasa kampus.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Sumber & Waktu</th>
                <th className="px-5 py-3">Isi Percakapan</th>
                <th className="px-5 py-3 text-right">Interaksi</th>
                <th className="px-5 py-3">Kategori Sentimen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedMentions.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 align-top">
                    <p className="font-mono text-xs font-semibold text-slate-900">
                      {m.accountOrSource}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {m.channel} · {formatDateTimeID(m.foundAt)}
                    </p>
                  </td>
                  <td className="max-w-md px-5 py-3.5 align-top text-xs leading-relaxed text-slate-700">
                    “{m.content}”
                  </td>
                  <td className="px-5 py-3.5 text-right align-top font-mono text-xs tabular-nums text-slate-700">
                    {formatNumberID(m.interactions)}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <select
                      value={m.sentiment}
                      onChange={(e) =>
                        updateMentionSentiment(m.id, e.target.value as SentimentType)
                      }
                      aria-label={`Ubah sentimen untuk ${m.accountOrSource}`}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                        m.sentiment === 'Negatif'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : m.sentiment === 'Positif'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <option value="Negatif">Negatif</option>
                      <option value="Netral">Netral</option>
                      <option value="Positif">Positif</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

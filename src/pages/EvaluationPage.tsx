import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RecoveryStatusText } from '../components/StatusBadge';
import { useCrisis } from '../context/CrisisContext';
import { RecoveryStatus } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';

type EvalTimeFilter = 'before' | 'after' | '24h' | '7d' | '30d';

export const EvaluationPage: React.FC = () => {
  const { issues, selectedIssue, setSelectedIssueId, saveEvaluation, notify } =
    useCrisis();

  const [timeFilter, setTimeFilter] = useState<EvalTimeFilter>('after');
  const [afterMentions, setAfterMentions] = useState(
    selectedIssue.evaluation.afterMentions
  );
  const [afterNegativePct, setAfterNegativePct] = useState(
    selectedIssue.evaluation.afterNegativePct
  );
  const [afterPositivePct, setAfterPositivePct] = useState(
    selectedIssue.evaluation.afterPositivePct
  );
  const [issueTrajectory, setIssueTrajectory] = useState(
    selectedIssue.evaluation.issueTrajectory
  );
  const [publicResponseSummary, setPublicResponseSummary] = useState(
    selectedIssue.evaluation.publicResponseSummary
  );
  const [messageEffectiveness, setMessageEffectiveness] = useState(
    selectedIssue.evaluation.messageEffectiveness
  );
  const [summaryNote, setSummaryNote] = useState(
    selectedIssue.evaluation.summaryNote ||
      'Setelah publikasi klarifikasi, jumlah keluhan mulai mengalami penurunan dan sentimen negatif menunjukkan perubahan. Monitoring tetap dilakukan untuk memastikan kondisi stabil.'
  );
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>(
    selectedIssue.evaluation.recoveryStatus
  );

  useEffect(() => {
    setAfterMentions(selectedIssue.evaluation.afterMentions);
    setAfterNegativePct(selectedIssue.evaluation.afterNegativePct);
    setAfterPositivePct(selectedIssue.evaluation.afterPositivePct);
    setIssueTrajectory(selectedIssue.evaluation.issueTrajectory);
    setPublicResponseSummary(selectedIssue.evaluation.publicResponseSummary);
    setMessageEffectiveness(selectedIssue.evaluation.messageEffectiveness);
    setSummaryNote(
      selectedIssue.evaluation.summaryNote ||
        'Setelah publikasi klarifikasi, jumlah keluhan mulai mengalami penurunan dan sentimen negatif menunjukkan perubahan. Monitoring tetap dilakukan untuk memastikan kondisi stabil.'
    );
    setRecoveryStatus(selectedIssue.evaluation.recoveryStatus);
  }, [selectedIssue]);

  const comparisonData = useMemo(() => {
    const ev = selectedIssue.evaluation;
    const beforeNeutral = Math.max(0, 100 - ev.beforeNegativePct - ev.beforePositivePct);
    const afterNeutral = Math.max(0, 100 - afterNegativePct - afterPositivePct);

    if (timeFilter === 'before') {
      return [
        {
          periode: 'Sebelum Respons',
          Negatif: ev.beforeNegativePct,
          Netral: beforeNeutral,
          Positif: ev.beforePositivePct,
        },
      ];
    }

    const horizonScale =
      timeFilter === '24h' ? 0.65 : timeFilter === '7d' ? 0.85 : timeFilter === '30d' ? 1 : 1;

    const scaledNeg = Math.round(
      ev.beforeNegativePct - (ev.beforeNegativePct - afterNegativePct) * horizonScale
    );
    const scaledPos = Math.round(
      ev.beforePositivePct + (afterPositivePct - ev.beforePositivePct) * horizonScale
    );
    const scaledNeu = Math.max(0, 100 - scaledNeg - scaledPos);

    return [
      {
        periode: 'Sebelum Respons',
        Negatif: ev.beforeNegativePct,
        Netral: beforeNeutral,
        Positif: ev.beforePositivePct,
      },
      {
        periode:
          timeFilter === 'after'
            ? 'Setelah Respons'
            : timeFilter === '24h'
            ? 'Pasca 24 Jam'
            : timeFilter === '7d'
            ? 'Pasca 7 Hari'
            : 'Pasca 30 Hari',
        Negatif: timeFilter === 'after' ? afterNegativePct : scaledNeg,
        Netral: timeFilter === 'after' ? afterNeutral : scaledNeu,
        Positif: timeFilter === 'after' ? afterPositivePct : scaledPos,
      },
    ];
  }, [selectedIssue, timeFilter, afterNegativePct, afterPositivePct]);

  const mentionDelta = afterMentions - selectedIssue.evaluation.beforeMentions;
  const negDelta = afterNegativePct - selectedIssue.evaluation.beforeNegativePct;
  const posDelta = afterPositivePct - selectedIssue.evaluation.beforePositivePct;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryNote.trim()) {
      notify('Isi ringkasan hasil evaluasi sebelum menyimpan.', 'warning');
      return;
    }
    if (afterNegativePct + afterPositivePct > 100) {
      notify('Jumlah persentase sentimen negatif dan positif tidak boleh melebihi 100%.', 'error');
      return;
    }
    saveEvaluation(selectedIssue.id, {
      afterMentions,
      afterNegativePct,
      afterPositivePct,
      issueTrajectory,
      publicResponseSummary,
      messageEffectiveness,
      summaryNote,
      recoveryStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Evaluasi Sentimen & Pemulihan Reputasi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Bandingkan sentimen sebelum dan sesudah respons resmi dipublikasikan serta tetapkan status pemulihan reputasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="eval-issue-select" className="text-xs font-medium text-slate-600">
            Pilih Isu:
          </label>
          <select
            id="eval-issue-select"
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

      {/* Resolved Banner when Krisis Teratasi */}
      {selectedIssue.evaluation.recoveryStatus === 'Krisis Teratasi' && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-emerald-950">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold">
              Krisis teratasi. Proses penanganan telah dievaluasi dan reputasi organisasi memasuki tahap pemulihan.
            </p>
            {selectedIssue.evaluation.evaluatedAt && (
              <p className="mt-0.5 text-xs text-emerald-800">
                Dievaluasi oleh {selectedIssue.evaluation.evaluatedBy} ·{' '}
                {formatDateTimeID(selectedIssue.evaluation.evaluatedAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top Indicators */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Perubahan Jumlah Mention</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
              {formatNumberID(afterMentions)}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
                mentionDelta <= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {mentionDelta <= 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {mentionDelta > 0 ? `+${mentionDelta}` : mentionDelta} dari awal
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">
            Perubahan Sentimen Negatif
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-red-600">
              {afterNegativePct}%
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                negDelta <= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {negDelta > 0 ? `+${negDelta}` : negDelta} poin (awal{' '}
              {selectedIssue.evaluation.beforeNegativePct}%)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">
            Peningkatan Sentimen Positif
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-emerald-600">
              {afterPositivePct}%
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                posDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {posDelta >= 0 ? `+${posDelta}` : posDelta} poin (awal{' '}
              {selectedIssue.evaluation.beforePositivePct}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Before/After Chart */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Perbandingan Sentimen Sebelum & Sesudah Respons
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Distribusi persentase sentimen (%) · Data Simulasi
              </p>
            </div>
            <RecoveryStatusText status={selectedIssue.evaluation.recoveryStatus} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                { id: 'before', label: 'Sebelum respons' },
                { id: 'after', label: 'Setelah respons' },
                { id: '24h', label: '24 jam' },
                { id: '7d', label: '7 hari' },
                { id: '30d', label: '30 hari' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTimeFilter(f.id)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  timeFilter === f.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="periode" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Negatif" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Netral" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Positif" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Evaluation & Recovery Form */}
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6"
        >
          <h2 className="font-display text-base font-bold text-slate-900">
            Formulir Evaluasi & Status Pemulihan Reputasi
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Status penyelesaian hanya berubah setelah evaluasi disimpan dan dikonfirmasi petugas berwenang.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Mention Pasca-Respons
              </label>
              <input
                type="number"
                min={0}
                value={afterMentions}
                onChange={(e) => setAfterMentions(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Negatif Pasca (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={afterNegativePct}
                onChange={(e) => setAfterNegativePct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Positif Pasca (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={afterPositivePct}
                onChange={(e) => setAfterPositivePct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Perkembangan Isu
              </label>
              <input
                type="text"
                value={issueTrajectory}
                onChange={(e) => setIssueTrajectory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Efektivitas Pesan Resmi
              </label>
              <input
                type="text"
                value={messageEffectiveness}
                onChange={(e) => setMessageEffectiveness(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700">
              Tanggapan Masyarakat
            </label>
            <input
              type="text"
              value={publicResponseSummary}
              onChange={(e) => setPublicResponseSummary(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700">
              Ringkasan Evaluasi
            </label>
            <textarea
              rows={3}
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-700">Status Pemulihan</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                ['Dalam Pemantauan', 'Proses Pemulihan', 'Krisis Teratasi'] as const
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRecoveryStatus(st)}
                  className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    recoveryStatus === st
                      ? st === 'Krisis Teratasi'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
            >
              <Save className="h-4 w-4" />
              Simpan Evaluasi & Status Pemulihan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

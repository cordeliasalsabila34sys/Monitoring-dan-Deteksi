import React from 'react';
import { ArrowRight, FileCheck2, MessageSquareText, X } from 'lucide-react';
import { CrisisIssue } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from '../utils/crypto';
import {
  ApprovalStatusText,
  CrisisLevelText,
  EarlyWarningText,
  RecoveryStatusText,
} from './StatusBadge';

interface IssueDetailModalProps {
  issue: CrisisIssue | null;
  onClose: () => void;
  onAnalyze: (issueId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onAnalyze,
}) => {
  if (!issue) return null;

  const verifiedChecks = [
    issue.validation.sourceConfirmed,
    issue.validation.widespreadImpact,
    issue.validation.negativeSentimentRising,
  ].filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-issue-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{issue.primaryChannel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{issue.primarySource}</span>
              <span aria-hidden="true">·</span>
              <span>Ditemukan {formatDateTimeID(issue.discoveredAt)}</span>
              {issue.isSimulated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-amber-700">Data Simulasi</span>
                </>
              )}
            </div>
            <h2
              id="detail-issue-title"
              className="mt-1.5 text-xl font-bold text-slate-900"
            >
              {issue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup detail isu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <p className="text-sm leading-relaxed text-slate-700">{issue.description}</p>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Total Mention</p>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
                {formatNumberID(issue.mentions)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Sentimen Negatif</p>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums text-red-600">
                {issue.negativePct}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Checklist Validasi</p>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
                {verifiedChecks}/3
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Bukti Tercatat</p>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
                {issue.evidence.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Deteksi Dini</p>
              <div className="mt-1">
                <EarlyWarningText level={issue.earlyWarning} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Klasifikasi Krisis</p>
              <div className="mt-1">
                <CrisisLevelText level={issue.classification.level} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Status Pesan Resmi</p>
              <div className="mt-1">
                <ApprovalStatusText status={issue.officialMessage.status} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Status Pemulihan</p>
              <div className="mt-1">
                <RecoveryStatusText status={issue.evaluation.recoveryStatus} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileCheck2 className="h-4 w-4 text-blue-700" />
              Bukti & Referensi Terbaru
            </h3>
            {issue.evidence.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Belum ada bukti yang dilampirkan. Tambahkan bukti pada halaman Validasi Isu.
              </p>
            ) : (
              <div className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {issue.evidence.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{ev.sourceAccount}</span>
                      <span>
                        {ev.type} · {ev.timestampLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">“{ev.content}”</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {issue.officialMessage.draft && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MessageSquareText className="h-4 w-4 text-blue-700" />
                Draf / Pernyataan Resmi Terakhir
              </h3>
              <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700">
                “{issue.officialMessage.draft}”
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAnalyze(issue.id);
            }}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Analisis & Validasi Isu
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

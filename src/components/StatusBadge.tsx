import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  ApprovalStatus,
  CrisisLevel,
  EarlyWarningLevel,
  RecoveryStatus,
} from '../types/crisis';

export const EarlyWarningText: React.FC<{ level: EarlyWarningLevel }> = ({ level }) => {
  switch (level) {
    case 'krisis':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
          Indikasi Krisis Tinggi
        </span>
      );
    case 'serius':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Perhatian Serius
        </span>
      );
    case 'meningkat':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-700 whitespace-nowrap">
          <Eye className="h-3.5 w-3.5 shrink-0" />
          Isu Mulai Meningkat
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Kondisi Relatif Aman
        </span>
      );
  }
};

export const CrisisLevelText: React.FC<{ level: CrisisLevel }> = ({ level }) => {
  if (level === 'Krisis Tinggi') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
        Krisis Tinggi
      </span>
    );
  }
  if (level === 'Penanganan Terbatas') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 whitespace-nowrap">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        Penanganan Terbatas
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      Belum Diklasifikasi
    </span>
  );
};

export const ApprovalStatusText: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  switch (status) {
    case 'Dipublikasikan':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Dipublikasikan
        </span>
      );
    case 'Disetujui':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Disetujui
        </span>
      );
    case 'Menunggu Persetujuan':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Menunggu Persetujuan
        </span>
      );
    case 'Ditolak':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          Ditolak
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Draf
        </span>
      );
  }
};

export const RecoveryStatusText: React.FC<{ status: RecoveryStatus }> = ({ status }) => {
  if (status === 'Krisis Teratasi') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Krisis Teratasi
      </span>
    );
  }
  if (status === 'Proses Pemulihan') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 whitespace-nowrap">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        Proses Pemulihan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
      <Eye className="h-3.5 w-3.5 shrink-0" />
      Dalam Pemantauan
    </span>
  );
};

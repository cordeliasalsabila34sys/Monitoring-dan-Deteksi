import { jsPDF } from 'jspdf';
import { CrisisIssue } from '../types/crisis';
import { formatDateTimeID, formatNumberID } from './crypto';

export function exportIssuesToCSV(issues: CrisisIssue[], periodLabel: string): void {
  const headers = [
    'ID Isu',
    'Nama Isu',
    'Tanggal Ditemukan',
    'Sumber Utama',
    'Saluran',
    'Jumlah Mention',
    'Sentimen Negatif (%)',
    'Sentimen Netral (%)',
    'Sentimen Positif (%)',
    'Indikator Validasi Terpenuhi',
    'Tingkat Krisis',
    'Tindakan Penanganan',
    'Status Pesan Resmi',
    'Platform Distribusi',
    'Ringkasan Evaluasi',
    'Status Akhir Pemulihan',
  ];

  const escapeCsv = (val: string | number): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = issues.map((issue) => {
    const checkCount = [
      issue.validation.sourceConfirmed,
      issue.validation.widespreadImpact,
      issue.validation.negativeSentimentRising,
    ].filter(Boolean).length;

    const actions: string[] = [];
    if (issue.classification.crisisTeamActive) actions.push('Aktivasi Crisis Team');
    if (issue.classification.schedulePaused) actions.push('Pause Jadwal Konten');
    if (issue.classification.customerServiceRouted) actions.push('Penanganan Customer Service');
    if (issue.classification.limitedClarification) actions.push('Klarifikasi Terbatas');

    const platforms = Array.from(
      new Set(issue.distributions.flatMap((d) => d.platforms))
    ).join('; ');

    return [
      issue.id,
      issue.title,
      formatDateTimeID(issue.discoveredAt),
      issue.primarySource,
      issue.primaryChannel,
      issue.mentions,
      issue.negativePct,
      issue.neutralPct,
      issue.positivePct,
      `${checkCount}/3`,
      issue.classification.level,
      actions.join('; ') || 'Dalam Evaluasi Awal',
      issue.officialMessage.status,
      platforms || 'Belum Didistribusikan',
      issue.evaluation.summaryNote || '-',
      issue.evaluation.recoveryStatus,
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = `\uFEFF${headers.map(escapeCsv).join(',')}\n${rows.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSlug = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.setAttribute('download', `laporan-crisiswatch-unj-${safeSlug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportToPDF(
  issues: CrisisIssue[],
  periodLabel: string,
  generatedBy: string,
  summaryStats: {
    totalMentions: number;
    avgNegativePct: number;
    validatedCount: number;
    highCrisisCount: number;
    resolvedCount: number;
  }
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const maxWidth = pageWidth - margin * 2;
  let y = 48;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 48;
    }
  };

  // Header band
  doc.setFillColor(11, 31, 58);
  doc.rect(0, 0, pageWidth, 88, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('LAPORAN MONITORING & PENGELOLAAN KRISIS', margin, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('CrisisWatch — Kehumasan Universitas Negeri Jakarta (UNJ)', margin, 54);
  doc.text(
    `Periode: ${periodLabel}  |  Disusun oleh: ${generatedBy}  |  Tanggal: ${formatDateTimeID(new Date().toISOString())}`,
    margin,
    70
  );

  y = 112;
  doc.setTextColor(15, 23, 42);

  // Section 1: Ringkasan Monitoring
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Ringkasan Monitoring & Analisis Sentimen', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = [
    `Total Isu Tercatat: ${issues.length} isu`,
    `Total Mention Terpantau: ${formatNumberID(summaryStats.totalMentions)} mention (Data Simulasi)`,
    `Rata-rata Sentimen Negatif: ${summaryStats.avgNegativePct}%`,
    `Isu Tervalidasi Penuh (3/3): ${summaryStats.validatedCount} isu`,
    `Klasifikasi Krisis Tinggi: ${summaryStats.highCrisisCount} isu`,
    `Status Krisis Teratasi: ${summaryStats.resolvedCount} isu`,
  ];
  summaryLines.forEach((line) => {
    doc.text(`• ${line}`, margin + 6, y);
    y += 15;
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Section 2: Rincian Penanganan Per Isu
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Rincian Validasi, Klasifikasi, Respons & Pemulihan Isu', margin, y);
  y += 18;

  issues.forEach((issue, idx) => {
    ensureSpace(145);

    const checkCount = [
      issue.validation.sourceConfirmed,
      issue.validation.widespreadImpact,
      issue.validation.negativeSentimentRising,
    ].filter(Boolean).length;

    const platforms = Array.from(
      new Set(issue.distributions.flatMap((d) => d.platforms))
    ).join(', ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 31, 58);
    doc.text(`${idx + 1}. ${issue.title}`, margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    const detailRows = [
      `Sumber: ${issue.primarySource} (${issue.primaryChannel}) | Mention: ${formatNumberID(issue.mentions)} | Sentimen Negatif: ${issue.negativePct}%`,
      `Validasi: ${checkCount}/3 indikator terverifikasi | Klasifikasi: ${issue.classification.level}`,
      `Tindakan: ${
        issue.classification.crisisTeamActive
          ? 'Crisis Team Aktif & Jadwal Konten Dihentikan Sementara'
          : issue.classification.customerServiceRouted
          ? 'Ditangani via Customer Service & Klarifikasi Terbatas'
          : 'Menunggu Keputusan Klasifikasi'
      }`,
      `Pesan Resmi (${issue.officialMessage.status}): ${issue.officialMessage.draft || 'Belum disusun'}`,
      `Distribusi Platform: ${platforms || 'Belum didistribusikan'}`,
      `Evaluasi & Pemulihan (${issue.evaluation.recoveryStatus}): ${issue.evaluation.summaryNote || 'Belum ada catatan evaluasi.'}`,
    ];

    detailRows.forEach((row) => {
      const wrapped = doc.splitTextToSize(row, maxWidth - 10);
      ensureSpace(wrapped.length * 12 + 4);
      doc.text(wrapped, margin + 8, y);
      y += wrapped.length * 12 + 3;
    });

    y += 10;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  });

  const safeSlug = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`laporan-crisiswatch-unj-${safeSlug}.pdf`);
}

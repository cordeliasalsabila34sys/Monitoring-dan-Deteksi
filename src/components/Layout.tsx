import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Radio,
  Search,
  Send,
  Settings,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  X,
} from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import { NavPage } from '../types/crisis';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.FC<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'monitoring', label: 'Monitoring Isu', icon: Search },
  { id: 'sentiment', label: 'Analisis Sentimen', icon: BarChart3 },
  { id: 'validation', label: 'Validasi Isu', icon: ClipboardCheck },
  { id: 'classification', label: 'Klasifikasi Krisis', icon: ShieldAlert },
  { id: 'response', label: 'Pusat Respons Krisis', icon: Megaphone },
  { id: 'distribution', label: 'Distribusi Respons', icon: Send },
  { id: 'evaluation', label: 'Evaluasi & Pemulihan', icon: TrendingUp },
  { id: 'history', label: 'Riwayat Penanganan', icon: History },
  { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  { id: 'settings', label: 'Pengaturan', icon: Settings, adminOnly: true },
];

const WORKFLOW_STEPS: { page: NavPage; step: number; short: string }[] = [
  { page: 'monitoring', step: 1, short: 'Deteksi & Monitoring' },
  { page: 'validation', step: 2, short: 'Validasi Bukti' },
  { page: 'classification', step: 3, short: 'Klasifikasi Krisis' },
  { page: 'response', step: 4, short: 'Formulasi Pesan' },
  { page: 'distribution', step: 5, short: 'Distribusi Respons' },
  { page: 'evaluation', step: 6, short: 'Evaluasi & Pemulihan' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    activePage,
    setActivePage,
    issues,
    selectedIssue,
    setSelectedIssueId,
    settings,
    toasts,
    dismissToast,
    logout,
  } = useCrisis();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentNavLabel =
    NAV_ITEMS.find((n) => n.id === activePage)?.label || 'Dashboard';

  const isWorkflowPage = WORKFLOW_STEPS.some((s) => s.page === activePage);

  const handleNavClick = (id: NavPage) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-slate-800 bg-[#0B1F3A] text-slate-100 lg:flex">
        <div className="border-b border-slate-800/80 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Radio className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold tracking-tight text-white">
                CrisisWatch
              </p>
              <p className="truncate text-[11px] text-slate-300">
                Humas Universitas Negeri Jakarta
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-snug text-slate-300">
            Pantau Isu, Cegah Krisis Sebelum Meluas.
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Menu utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const locked = item.adminOnly && currentUser?.role !== 'Administrator';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
              </button>
            );
          })}
        </nav>

        {currentUser && (
          <div className="border-t border-slate-800/80 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-blue-300">
                {currentUser.name
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-slate-300">{currentUser.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar Sesi
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#0B1F3A] text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Radio className="h-4 w-4" />
                </div>
                <span className="font-display text-base font-bold text-white">
                  CrisisWatch
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                const locked = item.adminOnly && currentUser?.role !== 'Administrator';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {locked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                );
              })}
            </nav>
            {currentUser && (
              <div className="border-t border-slate-800 p-4">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-300">
                  {currentUser.role} · {currentUser.unit}
                </p>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar Sesi
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Clean 3-Zone Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Buka navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-slate-400 sm:inline">CrisisWatch UNJ</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="truncate font-semibold text-slate-900">
                {currentNavLabel}
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <label htmlFor="global-issue-select" className="text-xs text-slate-500">
              Isu Aktif:
            </label>
            <select
              id="global-issue-select"
              value={selectedIssue?.id || ''}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="max-w-[260px] truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              {issues.map((iss) => (
                <option key={iss.id} value={iss.id}>
                  {iss.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
              <UserCheck className="h-4 w-4 text-blue-700" />
              <span className="font-medium text-slate-800">{currentUser?.role}</span>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('reports')}
              className="whitespace-nowrap rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Lihat Laporan
            </button>
          </div>
        </header>

        {/* Simulation Notice + Workflow Progress Bar */}
        {settings.showSimulationBanner && (
          <div className="border-b border-amber-200 bg-amber-50/80 px-4 py-2 text-xs text-amber-900 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                <span>
                  <strong>Mode Prototipe & Data Simulasi:</strong> Angka awal menggunakan data demonstrasi UNJ (bukan data live API media sosial). Anda dapat menambah, menguji, dan menyimpan seluruh alur secara lokal.
                </span>
              </span>
            </div>
          </div>
        )}

        {isWorkflowPage && selectedIssue && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1280px]">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Alur Penanganan Isu: <strong className="text-slate-900">{selectedIssue.title}</strong>
                </span>
                <span>
                  Status Pemulihan: <strong className="text-slate-800">{selectedIssue.evaluation.recoveryStatus}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {WORKFLOW_STEPS.map((s) => {
                  const active = activePage === s.page;
                  return (
                    <button
                      key={s.page}
                      type="button"
                      onClick={() => setActivePage(s.page)}
                      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#0B1F3A] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span className="font-mono text-[11px]">{s.step}.</span>
                      <span>{s.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>

        {/* Quiet Institutional Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2">
            <span>CrisisWatch · Sistem Pengelolaan Krisis Komunikasi & Kehumasan UNJ</span>
            <span>Penyimpanan Lokal Browser · Tanpa Koneksi API Eksternal</span>
          </div>
        </footer>
      </div>

      {/* Toast Stack */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-medium shadow-lg ${
                t.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : t.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : t.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <span className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t.text}</span>
              </span>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="rounded p-0.5 opacity-70 hover:opacity-100"
                aria-label="Tutup notifikasi"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

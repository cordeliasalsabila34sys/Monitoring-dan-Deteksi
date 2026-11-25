import React, { useState } from 'react';
import {
  Lock,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useCrisis } from '../context/CrisisContext';
import { UserRole } from '../types/crisis';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    users,
    keywords,
    settings,
    addUserAccount,
    toggleUserActive,
    updateUserRole,
    deleteUserAccount,
    addKeyword,
    removeKeyword,
    updateSettings,
    resetDemoData,
    setActivePage,
  } = useCrisis();

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Tim Humas');
  const [newPassword, setNewPassword] = useState('');
  const [userError, setUserError] = useState('');

  const [kwInput, setKwInput] = useState('');
  const [charLimit, setCharLimit] = useState(settings.defaultCharLimit);
  const [showSimBanner, setShowSimBanner] = useState(settings.showSimulationBanner);
  const [orgName, setOrgName] = useState(settings.organizationName);

  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Strict RBAC enforcement
  if (currentUser?.role !== 'Administrator') {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-slate-900">
          Akses Dibatasi Khusus Administrator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Akun Anda saat ini menggunakan peran <strong>{currentUser?.role}</strong>. Pengelolaan pengguna, kata kunci sistem, dan pengaturan inti hanya dapat diakses oleh Administrator.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('dashboard')}
          className="mt-6 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-xs font-semibold text-white"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    const res = await addUserAccount({
      name: newName,
      email: newEmail,
      username: newUsername,
      role: newRole,
      unit: newUnit,
      password: newPassword,
    });
    if (!res.ok) {
      setUserError(res.message);
      return;
    }
    setNewName('');
    setNewEmail('');
    setNewUsername('');
    setNewUnit('');
    setNewPassword('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      organizationName: orgName.trim() || 'Universitas Negeri Jakarta (UNJ)',
      defaultCharLimit: Math.max(140, Math.min(1000, Number(charLimit) || 280)),
      showSimulationBanner: showSimBanner,
    });
  };

  const activeAdminCount = users.filter(
    (u) => u.role === 'Administrator' && u.active
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Pengaturan & Pengelolaan Pengguna
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola akun tim humas, hak akses peran, daftar kata kunci monitoring, dan konfigurasi sistem.
        </p>
      </div>

      {/* User Management */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <ShieldCheck className="h-5 w-5 text-blue-700" />
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Manajemen Akun Pengguna
            </h2>
            <p className="text-xs text-slate-500">
              Kata sandi disimpan sebagai hash SHA-256 dan tidak pernah disimpan dalam teks biasa.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Nama & Unit</th>
                <th className="px-4 py-3">Email / Username</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => {
                const isSelf = u.id === currentUser.id;
                const isLastActiveAdmin =
                  u.role === 'Administrator' && u.active && activeAdminCount <= 1;

                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {u.name} {isSelf ? '(Anda)' : ''}
                      </p>
                      <p className="text-[11px] text-slate-500">{u.unit}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {u.email} · @{u.username}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isLastActiveAdmin}
                        onChange={(e) =>
                          updateUserRole(u.id, e.target.value as UserRole)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium disabled:opacity-60"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Tim Humas">Tim Humas</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={isLastActiveAdmin}
                        onClick={() => toggleUserActive(u.id)}
                        className={`font-semibold ${
                          u.active ? 'text-emerald-700' : 'text-slate-400'
                        } disabled:cursor-not-allowed`}
                      >
                        {u.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={isSelf || isLastActiveAdmin}
                        onClick={() => setUserToDelete(u.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Hapus akun"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add User Form */}
        <form
          onSubmit={handleAddUser}
          className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
        >
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <UserPlus className="h-4 w-4 text-blue-700" />
            Tambah Pengguna Baru
          </h3>
          {userError && (
            <p className="mt-2 rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {userError}
            </p>
          )}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama lengkap"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (@unj.ac.id)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="Unit kerja / jabatan"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              <option value="Tim Humas">Tim Humas</option>
              <option value="Administrator">Administrator</option>
            </select>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kata sandi (min. 6 karakter)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Simpan Pengguna
            </button>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Keyword Settings */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Pengaturan Kata Kunci Monitoring
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Daftar kata kunci utama yang dipantau pada halaman Monitoring Isu.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (addKeyword(kwInput)) setKwInput('');
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              placeholder="Tambah kata kunci baru..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white"
            >
              Tambah
            </button>
          </form>

          <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {keywords.map((kw) => (
              <div
                key={kw}
                className="flex items-center justify-between px-3.5 py-2.5 text-xs"
              >
                <span className="font-medium text-slate-800">{kw}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="text-slate-400 hover:text-red-600"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* System Settings */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Konfigurasi Sistem & Data Simulasi
          </h2>
          <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nama Institusi
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Batas Karakter Default Pesan Resmi
              </label>
              <input
                type="number"
                min={140}
                max={1000}
                value={charLimit}
                onChange={(e) => setCharLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={showSimBanner}
                onChange={(e) => setShowSimBanner(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span>Tampilkan penanda informasi Mode Simulasi di header</span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Data Simulasi
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Save className="h-3.5 w-3.5" />
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Hapus Akun Pengguna?"
        description="Pengguna ini tidak akan lagi dapat mengakses sistem CrisisWatch."
        confirmLabel="Hapus Akun"
        variant="danger"
        onConfirm={() => {
          if (userToDelete) deleteUserAccount(userToDelete);
          setUserToDelete(null);
        }}
        onCancel={() => setUserToDelete(null)}
      />

      <ConfirmDialog
        open={confirmResetOpen}
        title="Pulihkan Data Simulasi Awal?"
        description="Seluruh isu tambahan, bukti, klasifikasi, dan pesan yang diubah akan dikembalikan ke data demonstrasi awal UNJ."
        confirmLabel="Ya, Reset Data"
        variant="danger"
        onConfirm={() => {
          resetDemoData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};

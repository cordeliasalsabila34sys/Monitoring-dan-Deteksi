import React, { useState } from 'react';
import { ArrowRight, Lock, Radio, ShieldCheck, Users } from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';

export const LoginPage: React.FC = () => {
  const { login } = useCrisis();
  const [identifier, setIdentifier] = useState('humas@unj.ac.id');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
    }
  };

  const quickLogin = async (email: string, pw: string) => {
    setIdentifier(email);
    setPassword(pw);
    setError('');
    setLoading(true);
    const res = await login(email, pw);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* Left Institutional Panel */}
      <div className="flex flex-col justify-between bg-[#0B1F3A] px-6 py-10 text-white sm:px-12 lg:w-[46%] lg:py-14">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">
                CrisisWatch
              </h1>
              <p className="text-xs text-slate-300">
                Universitas Negeri Jakarta (UNJ)
              </p>
            </div>
          </div>

          <h2 className="mt-10 max-w-md font-display text-3xl font-bold leading-tight text-white">
            Pantau Isu, Cegah Krisis Sebelum Meluas.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            Sistem terpadu monitoring media sosial, deteksi dini eskalasi isu, validasi bukti, klasifikasi tingkat krisis, formulasi pernyataan resmi, hingga evaluasi pemulihan reputasi kehumasan UNJ.
          </p>

          <div className="mt-10 space-y-4 border-t border-slate-800 pt-8 text-sm text-slate-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <span>
                Alur penanganan terstruktur 7 tahap mulai dari deteksi dini sampai status krisis teratasi.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <span>
                Pembatasan akses berbasis peran untuk Administrator dan Tim Humas / Crisis Team.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <span>
                Prototipe statis dengan penyimpanan lokal browser dan verifikasi kata sandi terenkripsi SHA-256.
              </span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          Biro Hubungan Masyarakat & Komunikasi Publik · Studi Penerapan UNJ
        </p>
      </div>

      {/* Right Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Masuk ke Sistem
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Gunakan akun Administrator atau Tim Humas untuk mengakses dashboard CrisisWatch.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="login-identifier"
                className="block text-xs font-semibold text-slate-700"
              >
                Email atau Username
              </label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="humas@unj.ac.id atau admin"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Kata Sandi
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-7 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold text-slate-700">
              Akses Demonstrasi Cepat (Data Simulasi)
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => quickLogin('humas@unj.ac.id', 'humas123')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50"
              >
                <p className="text-xs font-semibold text-slate-900">Tim Humas</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                  humas@unj.ac.id
                </p>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('admin@unj.ac.id', 'admin123')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50"
              >
                <p className="text-xs font-semibold text-slate-900">Administrator</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                  admin@unj.ac.id
                </p>
              </button>
            </div>
            <p className="mt-2.5 text-[11px] text-slate-500">
              Sandi demonstrasi: <span className="font-mono">humas123</span> (Tim Humas) /{' '}
              <span className="font-mono">admin123</span> (Administrator).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

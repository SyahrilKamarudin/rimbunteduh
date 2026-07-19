import { useState } from 'react';
import AdminDashboard from './AdminDashboard';

export default function AdminGate() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (authed) return <AdminDashboard onUnauthorized={() => setAuthed(false)} />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-[380px] rounded-card-lg bg-white p-8 shadow-card">
        <div className="mb-1 font-serif text-2xl text-ink">Admin Login</div>
        <div className="mb-6 text-sm text-muted">Rimbun Teduh Homestead Farm</div>
        <label className="mb-2 block text-[13px] font-semibold text-ink">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-full rounded-lg border-[1.5px] border-forest/20 px-3.5 py-3 text-sm text-ink"
          autoFocus
        />
        {error && <div className="mb-2 text-[13px] text-[#a8402f]">Incorrect password.</div>}
        <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-forest py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? 'Checking…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

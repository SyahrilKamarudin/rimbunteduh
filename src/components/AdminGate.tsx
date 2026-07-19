import { useEffect, useState } from 'react';
import AdminDashboard from './AdminDashboard';

// Demo-only client-side gate. Replace with real server-side auth before launch.
const DEMO_PASSWORD = 'rimbunteduh2026';

export default function AdminGate() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('rt_admin_authed') === '1') setAuthed(true);
    } catch (e) {}
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === DEMO_PASSWORD) {
      try {
        sessionStorage.setItem('rt_admin_authed', '1');
      } catch (e) {}
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (authed) return <AdminDashboard />;

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
        <button type="submit" className="mt-4 w-full rounded-lg bg-forest py-3 text-sm font-semibold text-white">Log In</button>
      </form>
    </div>
  );
}

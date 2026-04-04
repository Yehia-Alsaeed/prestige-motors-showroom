import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-lg border border-subtle">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const res = await apiFetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
              login({ id: data._id, name: `${data.firstName} ${data.lastName}`, email: data.email }, data.role, data.token);
              toast.success('Logged in successfully!');
              navigate('/dashboard');
            } else {
              toast.error(data.message || 'Account does not exist or invalid credentials.');
            }
          } catch (err) {
            toast.error('Server error. Please try again.');
          } finally {
            setLoading(false);
          }
        }}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="Email address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="Password" />
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-main bg-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="text-center text-secondary flex flex-col gap-2 mt-4">
          <Link to="/admin/login" className="text-metallic hover:text-white transition text-sm">Admin Login</Link>
          <div>Don't have an account? <Link to="/register" className="text-gold hover:text-white transition">Sign up</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

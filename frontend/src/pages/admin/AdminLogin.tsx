import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/apiFetch';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login({ id: data._id, name: `${data.firstName} ${data.lastName}`, email: data.email }, data.role, data.token);
        toast.success('Admin authentication verified.');
        navigate('/admin');
      } else {
        toast.error(data.message || 'Access Denied. Invalid admin credentials.');
      }
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-6 sm:p-10 rounded-lg border border-subtle shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 text-center">Admin Access</h1>
        <p className="text-secondary text-sm text-center mb-8">Restricted personnel only</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Admin Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" 
              placeholder="Enter secured email" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent font-bold rounded-md text-main bg-gold hover:bg-yellow-600 focus:outline-none transition disabled:opacity-50">
            {loading ? 'Verifying...' : 'Proceed to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-card p-6 sm:p-10 rounded-lg border border-subtle">
        <div>
          <h2 className="mt-2 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary">Create an account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const res = await apiFetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ firstName, lastName, address, city, country, email, phone, password })
            });
            const data = await res.json();
            if (res.ok) {
              login({ id: data._id, name: `${data.firstName} ${data.lastName}`, email: data.email }, data.role, data.token);
              toast.success('Registration successful. Welcome!');
              navigate('/dashboard');
            } else {
              toast.error(data.message || 'Registration failed.');
            }
          } catch {
            toast.error('Server error. Please try again.');
          } finally {
            setLoading(false);
          }
        }}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">First Name</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Last Name</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Street Address (Optional)</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="123 Luxury Blvd" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">City (Optional)</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Country (Optional)</label>
                <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="USA" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="Email address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Phone Number</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="Password" />
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-main bg-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition disabled:opacity-50">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-center text-secondary">
          Already have an account? <Link to="/login" className="text-gold hover:text-white transition">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-section border-b border-subtle px-8 py-4 flex justify-between items-center">
      <div className="text-primary font-bold tracking-widest text-lg">Admin Dashboard</div>
      <div className="flex items-center space-x-6">
        <span className="text-gold font-bold tracking-wide">{user?.name || 'Master Admin'}</span>
        <button onClick={handleLogout} className="bg-main text-red-500 border border-red-900/50 px-5 py-1.5 rounded hover:bg-red-900/40 hover:text-red-400 transition font-bold shadow-lg">Logout</button>
      </div>
    </header>
  );
};

export default AdminNavbar;

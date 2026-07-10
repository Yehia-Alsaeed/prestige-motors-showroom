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
    <header className="bg-section border-b border-subtle px-4 py-4 sm:px-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <div className="text-primary font-bold tracking-widest text-base sm:text-lg">Admin Dashboard</div>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-6">
        <span className="min-w-0 truncate text-gold font-bold tracking-wide text-sm sm:text-base">{user?.name || 'Master Admin'}</span>
        <button onClick={handleLogout} className="bg-main text-red-500 border border-red-900/50 px-4 sm:px-5 py-1.5 rounded hover:bg-red-900/40 hover:text-red-400 transition font-bold shadow-lg text-sm">Logout</button>
      </div>
    </header>
  );
};

export default AdminNavbar;

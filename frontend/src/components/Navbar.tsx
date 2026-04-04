import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <nav className="bg-section border-b border-subtle px-4 py-4 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
          <img src="https://res.cloudinary.com/ddpmrivna/image/upload/v1774280433/prestige-motors-assets/logo.png" alt="Prestige Motors Logo" className="h-8 md:h-12 w-auto object-contain drop-shadow-lg" />
          <span className="text-xl md:text-2xl font-bold tracking-widest uppercase text-primary whitespace-nowrap">Prestige Motors</span>
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-secondary font-medium text-[15px]">
          <Link to="/" className="hover:text-gold transition whitespace-nowrap">Home</Link>
          <Link to="/cars" className="hover:text-gold transition whitespace-nowrap">Showroom</Link>
          <Link to="/used-cars" className="hover:text-gold transition whitespace-nowrap">Used Cars</Link>
          {user && <Link to="/sell-your-car" className="hover:text-gold transition whitespace-nowrap">Sell Your Car</Link>}
          <Link to="/about" className="hover:text-gold transition whitespace-nowrap">About Us</Link>
          <Link to="/contact" className="hover:text-gold transition whitespace-nowrap">Contact</Link>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-gold font-bold text-sm">
                <UserIcon size={16} /> <span className="whitespace-nowrap">{user.name}</span>
              </div>
              <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="text-secondary hover:text-primary font-medium text-sm whitespace-nowrap">Dashboard</Link>
              <button onClick={handleLogout} className="bg-subtle text-primary px-3 py-1.5 rounded font-bold text-sm hover:bg-red-900/50 hover:text-red-400 transition border border-subtle whitespace-nowrap">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-secondary hover:text-primary font-medium text-sm whitespace-nowrap">Login</Link>
              <Link to="/register" className="bg-gold text-main px-5 py-1.5 rounded font-bold text-sm hover:bg-yellow-600 transition shadow-lg whitespace-nowrap">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

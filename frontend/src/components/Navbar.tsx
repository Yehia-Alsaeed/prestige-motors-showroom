import { Link, useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileOpen(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/cars', label: 'Showroom' },
    { to: '/used-cars', label: 'Used Cars' },
    ...(user ? [{ to: '/sell-your-car', label: 'Sell Your Car' }] : []),
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-section border-b border-subtle px-4 py-3 sm:px-6 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-3">
        <Link to="/" onClick={closeMobileMenu} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:flex-none">
          <img src="https://res.cloudinary.com/ddpmrivna/image/upload/v1774280433/prestige-motors-assets/logo.png" alt="Prestige Motors Logo" className="h-9 sm:h-11 md:h-12 w-auto object-contain drop-shadow-lg" />
          <span className="min-w-0 text-sm sm:text-xl md:text-2xl font-bold tracking-normal sm:tracking-widest uppercase text-primary truncate">Prestige Motors</span>
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-secondary font-medium text-[15px]">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-gold transition whitespace-nowrap">{link.label}</Link>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-gold font-bold text-sm">
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
        <button
          type="button"
          className="relative z-10 lg:hidden inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border border-subtle bg-card text-primary transition hover:border-gold hover:text-gold"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden mt-3 border-t border-subtle pt-3">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className="rounded px-3 py-3 text-sm font-bold text-secondary transition hover:bg-card hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-subtle pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gold">
                    <UserIcon size={16} />
                    <span className="truncate">{user.name}</span>
                  </div>
                  <Link
                    to={role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={closeMobileMenu}
                    className="rounded px-3 py-3 text-sm font-bold text-secondary transition hover:bg-card hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="rounded border border-subtle bg-main px-3 py-3 text-left text-sm font-bold text-red-400 transition hover:bg-red-900/30">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={closeMobileMenu} className="rounded border border-subtle px-3 py-3 text-center text-sm font-bold text-secondary transition hover:text-primary">
                    Login
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu} className="rounded bg-gold px-3 py-3 text-center text-sm font-bold text-main transition hover:bg-yellow-600">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

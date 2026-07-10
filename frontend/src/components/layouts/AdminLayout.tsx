import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/cars', label: 'Manage Cars' },
    { to: '/admin/reservations', label: 'Reservations' },
    { to: '/admin/approvals', label: 'Listing Approvals' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `p-3 rounded font-bold transition flex items-center ${isActive ? 'bg-card border border-subtle text-gold' : 'hover:bg-card hover:text-primary'}`;

  return (
    <div className="min-h-screen md:h-screen flex bg-main">
      <div className="w-64 bg-section border-r border-subtle hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Admin Menu</h2>
        </div>
        <nav className="mt-6 px-4 flex flex-col gap-2 text-secondary">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="flex-1 flex min-w-0 flex-col md:h-screen md:overflow-hidden">
        <div className="md:hidden bg-section border-b border-subtle px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded border border-subtle bg-card px-3 py-2 text-left text-sm font-bold text-primary"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close admin navigation menu' : 'Open admin navigation menu'}
          >
            <span>Admin Menu</span>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {mobileOpen && (
            <nav className="mt-3 flex flex-col gap-2 text-secondary">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
        <AdminNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-main overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

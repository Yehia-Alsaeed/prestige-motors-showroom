import { Outlet, NavLink } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-main">
      <div className="w-64 bg-section border-r border-subtle hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Admin Menu</h2>
        </div>
        <nav className="mt-6 px-4 flex flex-col gap-2 text-secondary">
          <NavLink to="/admin" end className={({ isActive }) => `p-3 rounded font-bold transition flex items-center ${isActive ? 'bg-card border border-subtle text-gold' : 'hover:bg-card hover:text-primary'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/cars" className={({ isActive }) => `p-3 rounded font-bold transition flex items-center ${isActive ? 'bg-card border border-subtle text-gold' : 'hover:bg-card hover:text-primary'}`}>
            Manage Cars
          </NavLink>
          <NavLink to="/admin/reservations" className={({ isActive }) => `p-3 rounded font-bold transition flex items-center ${isActive ? 'bg-card border border-subtle text-gold' : 'hover:bg-card hover:text-primary'}`}>
            Reservations
          </NavLink>
          <NavLink to="/admin/approvals" className={({ isActive }) => `p-3 rounded font-bold transition flex items-center ${isActive ? 'bg-card border border-subtle text-gold' : 'hover:bg-card hover:text-primary'}`}>
            Listing Approvals
          </NavLink>
        </nav>
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 p-8 bg-main overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

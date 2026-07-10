import { useState, useEffect } from 'react';
import { Car, Users, CalendarDays, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/apiFetch';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/cars/admin/stats', {}, token)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const formatEGP = (price: number) => price?.toLocaleString('en-EG') + ' EGP';

  if (loading) {
    return <div className="text-secondary text-center py-20">Loading dashboard stats...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 border-b border-subtle pb-4">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 sm:gap-6 mb-10 sm:mb-12">
        <div className="bg-card border border-subtle p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary text-sm">Total Cars</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary">{stats?.cars?.total || 0}</h3>
            </div>
            <div className="bg-main p-3 rounded text-gold"><Car size={24} /></div>
          </div>
          <p className="text-xs text-secondary"><span className="text-green-500 font-bold">{stats?.cars?.available || 0}</span> Available</p>
          <p className="text-xs text-secondary mt-1"><span className="text-purple-400 font-bold">{stats?.cars?.sold || 0}</span> Sold</p>
          <p className="text-xs text-secondary mt-1"><span className="text-yellow-500 font-bold">{stats?.cars?.pendingListings || 0}</span> Pending Listings</p>
        </div>
        
        <div className="bg-card border border-subtle p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary text-sm">Reservations & Offers</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary">{stats?.reservations?.total || 0}</h3>
            </div>
            <div className="bg-main p-3 rounded text-gold"><CalendarDays size={24} /></div>
          </div>
          <p className="text-xs text-secondary"><span className="text-yellow-500 font-bold">{stats?.reservations?.pending || 0}</span> Pending Action</p>
          <p className="text-xs text-secondary mt-1"><span className="text-orange-400 font-bold">{stats?.reservations?.reserved || 0}</span> Reserved</p>
        </div>
        
        <div className="bg-card border border-subtle p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary text-sm">Total Customers</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary">{stats?.users?.total || 0}</h3>
            </div>
            <div className="bg-main p-3 rounded text-gold"><Users size={24} /></div>
          </div>
          <p className="text-xs text-secondary">Registered active users</p>
        </div>
        
        <div className="bg-card border border-subtle p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary text-sm">Pending Pipeline</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary max-w-full overflow-hidden text-ellipsis">
                {stats?.pipeline?.pending ? formatEGP(stats.pipeline.pending) : '0 EGP'}
              </h3>
            </div>
            <div className="bg-main p-3 rounded text-gold"><DollarSign size={24} /></div>
          </div>
          <p className="text-xs text-secondary">Based on pending offers</p>
        </div>

        <div className="bg-card border border-subtle p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary text-sm">Sold Pipeline</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary max-w-full overflow-hidden text-ellipsis">
                {stats?.pipeline?.sold ? formatEGP(stats.pipeline.sold) : '0 EGP'}
              </h3>
            </div>
            <div className="bg-main p-3 rounded text-purple-400"><DollarSign size={24} /></div>
          </div>
          <p className="text-xs text-secondary">
            Based on confirmed sold cars
          </p>
          <p className="text-xs text-secondary mt-1">
            <span className="text-purple-400 font-bold">{stats?.pipeline?.soldTransactions || 0}</span> Closed deals
          </p>
        </div>
      </div>
      
      <div className="bg-card border border-subtle rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link to="/admin/cars" className="bg-gold text-main px-6 py-3 rounded font-bold hover:bg-yellow-600 transition tracking-wide text-sm text-center">
            Manage Inventory
          </Link>
          <Link to="/admin/reservations" className="border border-gold text-gold px-6 py-3 rounded font-bold hover:bg-gold/10 transition tracking-wide text-sm text-center">
            Review Offers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

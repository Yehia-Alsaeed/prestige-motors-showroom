import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Award, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';

const Home = () => {
  const [newCars, setNewCars] = useState<any[]>([]);
  const [usedCars, setUsedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/cars?category=new').then(r => r.json()),
      apiFetch('/api/cars?category=used').then(r => r.json())
    ]).then(([n, u]) => {
      setNewCars(n.slice(0, 3));
      setUsedCars(u.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatEGP = (price: number) => price.toLocaleString('en-EG') + ' EGP';

  const CarCard = ({ car, badge }: { car: any, badge: string }) => (
    <Link to={`/cars/${car._id}`} className="bg-card border border-subtle rounded-lg overflow-hidden group hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5">
      <div className="h-52 overflow-hidden bg-main flex items-center justify-center relative">
        {car.images?.[0] && !car.images[0].includes('placeholder') ? (
          <img src={car.images[car.mainImageIndex || 0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="text-subtle text-center p-4"><p className="text-3xl mb-2">🚗</p><p className="text-sm">Photo coming soon</p></div>
        )}
        <div className={`absolute top-3 left-3 backdrop-blur px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${badge === 'New' ? 'bg-green-900/70 text-green-400 border-green-700' : 'bg-orange-900/70 text-orange-400 border-orange-700'}`}>{badge}</div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-primary">{car.brand} {car.model}</h3>
          <Star size={14} className="text-gold flex-shrink-0 mt-1" fill="currentColor" />
        </div>
        <p className="text-secondary text-sm mb-3">{car.year} • {car.fuelType} • {car.transmission}</p>
        <div className="flex justify-between items-center pt-3 border-t border-subtle">
          <span className="text-xl font-bold text-gold">{formatEGP(car.price)}</span>
          <span className="text-xs text-metallic uppercase tracking-wider font-bold">Details →</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center bg-section overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-main opacity-80 z-10"></div>
          <img src="https://res.cloudinary.com/ddpmrivna/image/upload/v1774280432/prestige-motors-assets/hero-cover.png" alt="Luxury Car Hero" className="w-full h-full object-cover object-center" />
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight">ELEVATE YOUR <span className="text-gold">JOURNEY</span></h1>
          <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl mx-auto">Egypt's premier showroom for brand new and pre-owned vehicles. Browse, reserve, or negotiate — all in one place.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cars" className="bg-gold text-main px-8 py-4 rounded font-bold hover:bg-yellow-600 transition flex items-center justify-center gap-2">
              Explore Showroom <ArrowRight size={20} />
            </Link>
            <Link to="/used-cars" className="border border-gold text-gold px-8 py-4 rounded font-bold hover:bg-gold/10 transition flex items-center justify-center gap-2">
              Browse Used Cars <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-card border-y border-subtle py-8">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Shield size={28} className="text-gold"/>
            <h3 className="font-bold text-primary">Verified Inventory</h3>
            <p className="text-secondary text-sm">Every car inspected and approved by our team</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Award size={28} className="text-gold"/>
            <h3 className="font-bold text-primary">Premium Brands</h3>
            <p className="text-secondary text-sm">From economy to ultra-luxury, all under one roof</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock size={28} className="text-gold"/>
            <h3 className="font-bold text-primary">Easy Reservation</h3>
            <p className="text-secondary text-sm">Reserve online, finalize at the showroom</p>
          </div>
        </div>
      </section>

      {/* New Cars */}
      <section className="py-24 px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Brand New Collection</h2>
            <p className="text-secondary text-lg">Zero-mileage vehicles, factory fresh.</p>
          </div>
          <Link to="/cars" className="text-gold hover:text-primary transition font-medium flex items-center gap-1">View All <ArrowRight size={16}/></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? <div className="text-secondary text-center col-span-3">Loading...</div> :
            newCars.map(car => <CarCard key={car._id} car={car} badge="New" />)}
        </div>
      </section>

      {/* Used Cars */}
      <section className="py-24 px-8 max-w-7xl mx-auto w-full border-t border-subtle">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Used Cars Marketplace</h2>
            <p className="text-secondary text-lg">Pre-owned vehicles. Reserve or negotiate up to 10% off.</p>
          </div>
          <Link to="/used-cars" className="text-gold hover:text-primary transition font-medium flex items-center gap-1">View All <ArrowRight size={16}/></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? <div className="text-secondary text-center col-span-3">Loading...</div> :
            usedCars.map(car => <CarCard key={car._id} car={car} badge="Used" />)}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-card border-y border-subtle py-16 text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Want to Sell Your Car?</h2>
        <p className="text-secondary max-w-xl mx-auto mb-6">List your vehicle on our marketplace. Upload photos, set your price, and reach thousands of buyers.</p>
        <Link to="/sell-your-car" className="inline-block bg-gold text-main px-8 py-4 rounded font-bold hover:bg-yellow-600 transition">
          Start Selling →
        </Link>
      </section>
    </div>
  );
};

export default Home;

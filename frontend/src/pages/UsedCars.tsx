import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Filter, Gauge, MessageSquare, Search } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';

type UsedCar = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  minimumPrice?: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  overview?: string;
  images?: string[];
  mainImageIndex?: number;
};

type Filters = {
  brand: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
};

const bodyTypes = ['Sedan', 'SUV', 'Crossover', 'Hatchback', 'Coupe', 'Convertible', 'Fastback', 'Gran Coupe', 'Roadster', 'Full-size SUV', 'Coupe SUV', 'Off-road SUV'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['Automatic', 'Manual'];

const formatEGP = (price?: number) => `${(price || 0).toLocaleString('en-EG')} EGP`;

const UsedCars = () => {
  const [cars, setCars] = useState<UsedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filters, setFilters] = useState<Filters>({ brand: '', bodyType: '', fuelType: '', transmission: '' });

  useEffect(() => {
    apiFetch('/api/cars/brands')
      .then((res) => res.json())
      .then((data: string[]) => setBrands(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCars = async () => {
      setLoading(true);
      const params = new URLSearchParams({ category: 'used' });
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.bodyType) params.append('bodyType', filters.bodyType);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);
      if (filters.transmission) params.append('transmission', filters.transmission);

      try {
        const res = await apiFetch(`/api/cars?${params}`);
        const data: UsedCar[] = await res.json();
        if (!cancelled) {
          setCars(data);
          setLoadError('');
        }
      } catch {
        if (!cancelled) {
          setCars([]);
          setLoadError('Unable to load used inventory right now.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCars();
    return () => { cancelled = true; };
  }, [filters]);

  const filteredAndSorted = useMemo(() => {
    let result = cars;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((car) =>
        `${car.brand} ${car.model}`.toLowerCase().includes(q) ||
        car.overview?.toLowerCase().includes(q) ||
        car.bodyType?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'name-asc') result = [...result].sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
    if (sortBy === 'name-desc') result = [...result].sort((a, b) => `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`));
    if (sortBy === 'year-desc') result = [...result].sort((a, b) => b.year - a.year);
    if (sortBy === 'year-asc') result = [...result].sort((a, b) => a.year - b.year);
    if (sortBy === 'mileage-asc') result = [...result].sort((a, b) => a.mileage - b.mileage);
    if (sortBy === 'mileage-desc') result = [...result].sort((a, b) => b.mileage - a.mileage);
    return result;
  }, [cars, search, sortBy]);

  const selectClass = 'bg-main border border-subtle rounded-lg p-2.5 text-primary text-sm focus:border-gold outline-none w-full';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 leading-tight">Used Cars Marketplace</h1>
        <p className="text-secondary text-base sm:text-lg leading-7">Pre-owned vehicles. Reserve at full price or negotiate up to 10% off.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search by brand, model, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-subtle rounded-lg pl-10 pr-4 py-2.5 text-primary text-sm focus:border-gold outline-none placeholder:text-secondary/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArrowUpDown size={16} className="text-gold" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full lg:w-auto bg-card border border-subtle rounded-lg p-2.5 text-primary text-sm focus:border-gold outline-none lg:min-w-[180px]">
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="year-desc">Year: Newest First</option>
            <option value="year-asc">Year: Oldest First</option>
            <option value="mileage-asc">Mileage: Low to High</option>
            <option value="mileage-desc">Mileage: High to Low</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-subtle rounded-lg p-4 sm:p-5 mb-8">
        <div className="flex items-center gap-2 text-gold font-bold text-sm mb-4">
          <Filter size={16} /> Filter by
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} className={selectClass}>
            <option value="">All Brands</option>
            {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </select>
          <select value={filters.bodyType} onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })} className={selectClass}>
            <option value="">All Body Types</option>
            {bodyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={filters.fuelType} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })} className={selectClass}>
            <option value="">All Fuel Types</option>
            {fuelTypes.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
          </select>
          <select value={filters.transmission} onChange={(e) => setFilters({ ...filters, transmission: e.target.value })} className={selectClass}>
            <option value="">All Transmissions</option>
            {transmissions.map((transmission) => <option key={transmission} value={transmission}>{transmission}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-secondary text-center py-20">Loading used inventory...</div>
      ) : loadError ? (
        <div className="text-secondary text-center py-20">{loadError}</div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-secondary text-center py-20">No used cars match your search or filters.</div>
      ) : (
        <>
          <p className="text-secondary mb-6">{filteredAndSorted.length} vehicle{filteredAndSorted.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredAndSorted.map((car) => (
              <Link to={`/cars/${car._id}`} key={car._id} className="bg-card border border-subtle rounded-lg overflow-hidden group hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5">
                <div className="h-52 overflow-hidden bg-main flex items-center justify-center relative">
                  {car.images && car.images[0] && !car.images[0].includes('placeholder') ? (
                    <img src={car.images[car.mainImageIndex || 0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="text-subtle text-center p-4">
                      <p className="text-sm">Photo coming soon</p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-orange-900/70 text-orange-400 border border-orange-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider backdrop-blur">Used</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-primary mb-1">{car.brand} {car.model}</h3>
                  <p className="text-secondary text-sm mb-2">{car.year} / {car.fuelType} / {car.transmission} / {car.bodyType}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-secondary mb-3">
                    <span className="flex items-center gap-1"><Gauge size={12} /> {car.mileage > 0 ? `${car.mileage.toLocaleString()} km` : 'N/A'}</span>
                    <span className="flex items-center gap-1 text-green-500"><MessageSquare size={12} /> Negotiable</span>
                  </div>
                  <p className="text-xs text-secondary line-clamp-2 mb-4">{car.overview}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-subtle">
                    <div>
                      <span className="text-xl font-bold text-gold">{formatEGP(car.price)}</span>
                      <p className="text-xs text-green-600">Min: {formatEGP(car.minimumPrice)}</p>
                    </div>
                    <span className="text-xs text-metallic uppercase tracking-wider font-bold">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsedCars;

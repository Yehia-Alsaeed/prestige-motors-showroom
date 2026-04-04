import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Gauge, Fuel, Settings, Calendar, Tag, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';

const CarDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/cars/${id}`)
      .then(res => res.json())
      .then(data => {
        setCar(data);
        if (data.minimumPrice) setOfferPrice(data.price);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const formatEGP = (price: number) => price.toLocaleString('en-EG') + ' EGP';

  const handleOffer = async (overridePrice?: number) => {
    if (!user) { toast.error('Please log in to make an offer'); return; }
    const finalPrice = overridePrice || offerPrice;
    
    // Skip minimum price check for brand new fixed-price reservations
    if (car.category === 'used' && finalPrice < car.minimumPrice) { 
      toast.error(`Minimum offer: ${formatEGP(car.minimumPrice)}`); 
      return; 
    }
    
    setSubmitting(true);
    try {
      // M7: Re-fetch car to verify it's still available before submitting
      const freshRes = await apiFetch(`/api/cars/${car._id}`);
      if (freshRes.ok) {
        const freshCar = await freshRes.json();
        if (freshCar.status !== 'available') {
          toast.error(`This car is no longer available (status: ${freshCar.status}). Please refresh the page.`);
          setCar(freshCar);
          setSubmitting(false);
          return;
        }
      }

      const res = await apiFetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: car._id, offerPrice: finalPrice, message: offerMessage })
      }, token);
      const data = await res.json();
      if (res.ok) { 
        toast.success(data.message || (car.category === 'new' ? 'Reservation submitted!' : 'Offer submitted!'));
      }
      else { toast.error(data.message); }
    } catch { toast.error('Server error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-secondary text-center py-20">Loading...</div>;
  if (!car) return <div className="text-secondary text-center py-20">Car not found</div>;

  const hasRealImages = car.images?.length > 0 && !car.images[0]?.includes('placeholder');

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <Link to={car.category === 'new' ? '/cars' : '/used-cars'} className="text-gold hover:text-primary transition flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-wider">
        <ArrowLeft size={16}/> Back to {car.category === 'new' ? 'Showroom' : 'Used Cars'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div>
          <div className="aspect-video bg-main rounded-lg overflow-hidden mb-3 border border-subtle">
            {hasRealImages ? (
              <img src={car.images[selectedImage]} alt={car.model} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-subtle">
                <div className="text-center"><p className="text-6xl mb-3">🚗</p><p>Photo coming soon</p></div>
              </div>
            )}
          </div>
          {hasRealImages && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition ${selectedImage === i ? 'border-gold' : 'border-subtle opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt={`View ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${car.category === 'new' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-orange-900/30 text-orange-400 border-orange-700'}`}>
              {car.category === 'new' ? 'Brand New' : 'Used'}
            </span>
            {car.status === 'reserved' && <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-red-900/30 text-red-400 border border-red-700">Reserved</span>}
          </div>

          <h1 className="text-3xl font-bold text-primary mb-1">{car.brand} {car.model}</h1>
          <p className="text-gold text-3xl font-bold mb-6">{formatEGP(car.price)}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card border border-subtle rounded-lg p-4 flex items-center gap-3">
              <Calendar size={20} className="text-gold"/>
              <div><p className="text-xs text-secondary uppercase">Year</p><p className="text-primary font-bold">{car.year}</p></div>
            </div>
            <div className="bg-card border border-subtle rounded-lg p-4 flex items-center gap-3">
              <Gauge size={20} className="text-gold"/>
              <div><p className="text-xs text-secondary uppercase">Mileage</p><p className="text-primary font-bold">{car.mileage > 0 ? car.mileage.toLocaleString() + ' km' : 'Zero km'}</p></div>
            </div>
            <div className="bg-card border border-subtle rounded-lg p-4 flex items-center gap-3">
              <Fuel size={20} className="text-gold"/>
              <div><p className="text-xs text-secondary uppercase">Fuel</p><p className="text-primary font-bold">{car.fuelType}</p></div>
            </div>
            <div className="bg-card border border-subtle rounded-lg p-4 flex items-center gap-3">
              <Settings size={20} className="text-gold"/>
              <div><p className="text-xs text-secondary uppercase">Transmission</p><p className="text-primary font-bold">{car.transmission}</p></div>
            </div>
            <div className="bg-card border border-subtle rounded-lg p-4 flex items-center gap-3">
              <Tag size={20} className="text-gold"/>
              <div><p className="text-xs text-secondary uppercase">Body</p><p className="text-primary font-bold">{car.bodyType}</p></div>
            </div>
          </div>

          {/* Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-primary mb-2">Vehicle Overview</h2>
            <p className="text-secondary leading-relaxed">{car.overview || 'No description available.'}</p>
          </div>

          {/* Seller Info */}
          {car.listedBy && (
            <div className="bg-card border border-subtle rounded-lg p-4 mb-6">
              <p className="text-xs text-secondary uppercase mb-1">Listed by</p>
              <p className="text-primary font-bold">{car.listedBy.firstName} {car.listedBy.lastName}</p>
            </div>
          )}

          {/* Action Buttons */}
          {car.status === 'available' && (
            car.category === 'used' ? (
              <div className="bg-card border border-gold/30 rounded-lg p-6">
                <h2 className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
                  <MessageSquare size={20} className="text-gold"/> Make an Offer
                </h2>
                <p className="text-secondary text-sm mb-4">
                  Asking: <span className="text-primary font-bold">{formatEGP(car.price)}</span> • 
                  Minimum: <span className="text-green-400 font-bold">{formatEGP(car.minimumPrice)}</span> (10% off)
                </p>
                <div className="mb-3">
                  <input
                    type="range" min={car.minimumPrice} max={car.price} step={1000}
                    value={offerPrice}
                    onChange={e => setOfferPrice(Number(e.target.value))}
                    className="w-full accent-gold"
                  />
                  <div className="flex justify-between text-xs text-secondary mt-1">
                    <span>{formatEGP(car.minimumPrice)}</span>
                    <span className="text-gold text-lg font-bold">{formatEGP(offerPrice)}</span>
                    <span>{formatEGP(car.price)}</span>
                  </div>
                </div>
                <textarea rows={2} placeholder="Optional message to seller..." value={offerMessage} onChange={e => setOfferMessage(e.target.value)} className="w-full bg-main border border-subtle rounded p-2.5 text-primary text-sm mb-3 outline-none focus:border-gold resize-none" />
                <button onClick={() => handleOffer()} disabled={submitting || !user} className="w-full bg-gold text-main py-3 rounded font-bold hover:bg-yellow-600 transition disabled:opacity-50">
                  {!user ? 'Log in to Make Offer' : submitting ? 'Submitting...' : `Submit Offer — ${formatEGP(offerPrice)}`}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setOfferPrice(car.price); handleOffer(car.price); }} 
                disabled={submitting || !user}
                className="w-full bg-gold text-main py-4 rounded font-bold text-lg hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {!user ? 'Log in to Reserve' : submitting ? 'Processing...' : 'Reserve This Vehicle'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetails;

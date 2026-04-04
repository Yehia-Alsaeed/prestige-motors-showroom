import { User, Calendar, Save, X, MapPin, Car, MessageSquare, Plus, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/apiFetch';

const CustomerDashboard = () => {
  const { user, token, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('reservations');
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [incomingOffers, setIncomingOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [archivingKey, setArchivingKey] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    country: '',
    preferredContact: 'email'
  });

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/api/auth/profile', {}, token);
      const data = await res.json();
      if (!res.ok) return;

      setProfileData(data);
      setEditForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        password: '',
        confirmPassword: '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        preferredContact: data.preferredContact || 'email'
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyListings = async () => {
    try {
      const res = await apiFetch('/api/cars/my-listings', {}, token);
      const data = await res.json();
      if (res.ok) setMyListings(data);
    } catch {}
  };

  const fetchMyOffers = async () => {
    try {
      const res = await apiFetch('/api/offers/my', {}, token);
      const data = await res.json();
      if (res.ok) setMyOffers(data);
    } catch {}
  };

  const fetchIncomingOffers = async () => {
    try {
      const res = await apiFetch('/api/offers/incoming', {}, token);
      const data = await res.json();
      if (res.ok) setIncomingOffers(data);
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchIncomingOffers();
    fetchMyOffers();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (activeTab === 'listings') fetchMyListings();
    if (activeTab === 'offers' || activeTab === 'reservations') fetchMyOffers();
    if (activeTab === 'incoming') fetchIncomingOffers();
  }, [activeTab, token]);

  const formatEGP = (price: number) => price?.toLocaleString('en-EG') + ' EGP';
  const getSellerDecision = (offer: any) => offer.sellerDecision || (offer.car?.listedBy ? 'pending' : 'not_required');
  const needsSellerResponse = (offer: any) => offer.status === 'pending' && getSellerDecision(offer) === 'pending';

  const isShowroomReservation = (offer: any) => offer.car?.category === 'new';
  const reservationOffers = myOffers.filter((offer) => isShowroomReservation(offer) || (offer.reservationStatus && offer.reservationStatus !== 'none'));
  const standardOffers = myOffers.filter((offer) => !isShowroomReservation(offer) && (!offer.reservationStatus || offer.reservationStatus === 'none'));

  const pendingIncomingOffers = incomingOffers.filter((offer) => needsSellerResponse(offer)).length;
  const pendingOffersByCar = incomingOffers.reduce((acc: Record<string, number>, offer: any) => {
    if (needsSellerResponse(offer) && offer.car?._id) {
      acc[offer.car._id] = (acc[offer.car._id] || 0) + 1;
    }
    return acc;
  }, {});

  const canArchiveBuyerOffer = (offer: any) => offer.status === 'rejected' || ['sold', 'relisted'].includes(offer.reservationStatus);
  const canArchiveListing = (car: any) => car.listingStatus === 'rejected' || ['reserved', 'sold', 'hidden'].includes(car.status);
  const canArchiveSellerOffer = (offer: any) => offer.status !== 'pending';

  const handleUpdateProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) return;
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      }, token);
      const data = await res.json();
      if (res.ok) {
        login({ id: data._id, name: `${data.firstName} ${data.lastName}`, email: data.email }, data.role, data.token);
        setProfileData((prev: any) => ({ ...prev, ...editForm }));
        toast.success('Profile updated');
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleSellerResponse = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      const res = await apiFetch(`/api/offers/${offerId}/seller-response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      }, token);
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchIncomingOffers();
        fetchMyListings();
        fetchMyOffers();
      } else {
        toast.error(data.message || 'Failed to update offer');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleArchiveOffer = async (offerId: string, audience: 'buyer' | 'seller') => {
    const key = `${audience}-${offerId}`;
    setArchivingKey(key);
    try {
      const res = await apiFetch(`/api/offers/${offerId}/archive/${audience}`, { method: 'PUT' }, token);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (audience === 'buyer') fetchMyOffers();
        if (audience === 'seller') fetchIncomingOffers();
      } else {
        toast.error(data.message || 'Failed to dismiss item');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setArchivingKey(null);
    }
  };

  const handleArchiveListing = async (carId: string) => {
    const key = `listing-${carId}`;
    setArchivingKey(key);
    try {
      const res = await apiFetch(`/api/cars/${carId}/archive-listing`, { method: 'PUT' }, token);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchMyListings();
      } else {
        toast.error(data.message || 'Failed to dismiss listing');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setArchivingKey(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
      approved: 'bg-green-900/30 text-green-400 border-green-700',
      rejected: 'bg-red-900/30 text-red-400 border-red-700',
      accepted: 'bg-green-900/30 text-green-400 border-green-700',
      available: 'bg-blue-900/30 text-blue-400 border-blue-700',
      reserved: 'bg-orange-900/30 text-orange-400 border-orange-700',
      sold: 'bg-purple-900/30 text-purple-400 border-purple-700',
      relisted: 'bg-cyan-900/30 text-cyan-400 border-cyan-700'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${colors[status] || 'bg-main text-secondary border-subtle'}`}>
        {status}
      </span>
    );
  };

  const buyerOfferSummary = (offer: any) => {
    if (offer.status === 'accepted') {
      if (offer.reservationStatus === 'sold') return 'Admin confirmed the sale.';
      if (offer.reservationStatus === 'relisted') return 'The reservation was cancelled and the car is back on display.';
      return 'Admin accepted the offer and reserved the car.';
    }

    if (offer.status === 'rejected') {
      if (offer.decisionByRole === 'seller') return 'Seller rejected the negotiated price.';
      return 'Admin rejected the offer.';
    }

    const sellerDecision = getSellerDecision(offer);
    if (sellerDecision === 'accepted') return 'Seller accepted the negotiated price. Waiting for admin confirmation.';
    if (sellerDecision === 'pending') return 'Waiting for seller response.';
    return 'Waiting for admin review.';
  };

  const sellerOfferSummary = (offer: any) => {
    if (offer.status === 'accepted') {
      if (offer.reservationStatus === 'sold') return 'Admin confirmed this reservation as sold.';
      if (offer.reservationStatus === 'relisted') return 'Admin returned this car to inventory.';
      return 'Admin accepted the buyer offer and reserved the car.';
    }

    if (offer.status === 'rejected') {
      if (offer.decisionByRole === 'seller') return 'You rejected this negotiated price.';
      return 'Admin rejected this offer.';
    }

    const sellerDecision = getSellerDecision(offer);
    if (sellerDecision === 'accepted') return 'You approved the negotiated price. Admin still needs to reserve the car.';
    return 'Waiting for your response.';
  };

  const renderDismissButton = (onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-secondary hover:text-red-400 transition p-1 disabled:opacity-40 disabled:cursor-not-allowed"
      title="Dismiss"
    >
      <X size={14} />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 border-b border-subtle pb-4">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-card border border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex justify-center mb-4">
            <div className="bg-main p-4 rounded-full"><User size={32} className="text-gold" /></div>
          </div>
          {isEditing ? (
            <div className="w-full space-y-4 h-full flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-secondary font-bold uppercase tracking-wider">First Name</label>
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full bg-main border border-subtle rounded p-2 text-primary focus:border-gold outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs text-secondary font-bold uppercase tracking-wider">Last Name</label>
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full bg-main border border-subtle rounded p-2 text-primary focus:border-gold outline-none mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">New Password (Optional)</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full bg-main border border-subtle rounded p-2 text-primary focus:border-gold outline-none mt-1" placeholder="********" />
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Confirm New Password</label>
                <input type="password" value={editForm.confirmPassword} onChange={e => setEditForm({ ...editForm, confirmPassword: e.target.value })} className="w-full bg-main border border-subtle rounded p-2 text-primary focus:border-gold outline-none mt-1" placeholder="********" />
              </div>
              <div className="flex gap-2 pt-3 border-t border-subtle justify-center mt-auto">
                <button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-green-600/20 text-green-500 border border-green-800 py-2 rounded font-bold text-sm hover:bg-green-600/40 flex justify-center items-center gap-2 transition disabled:opacity-50"><Save size={16} /> Save</button>
              </div>
              <div className="flex justify-center">
                <button onClick={() => setIsEditing(false)} className="text-secondary text-sm hover:text-primary flex items-center gap-1 transition mt-2"><X size={14} /> Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center border-b border-subtle pb-4 mb-4">
                <h2 className="text-2xl font-bold text-primary mb-1">{profileData ? `${profileData.firstName} ${profileData.lastName}` : user?.name}</h2>
                <p className="text-secondary text-sm font-medium">{profileData?.email}</p>
                <p className="text-secondary text-sm mt-1">{profileData?.phone}</p>
                <button onClick={() => setIsEditing(true)} className="mt-4 text-metallic hover:text-gold transition font-bold border border-subtle px-5 py-2 rounded hover:bg-main text-sm w-full">Edit Profile Details</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs text-secondary font-bold uppercase tracking-wider">Location</h4>
                    <p className="text-primary text-sm">
                      {profileData?.address ? `${profileData.address}, ${profileData.city}, ${profileData.country}` : <span className="text-subtle/50 italic">Not provided</span>}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-2 bg-card border border-subtle rounded-lg p-6">
          <div className="flex gap-1 mb-6 border-b border-subtle pb-3 flex-wrap">
            {[
              { key: 'reservations', label: 'Reservations', icon: Calendar },
              { key: 'listings', label: 'My Listings', icon: Car },
              { key: 'offers', label: 'My Offers', icon: MessageSquare },
              { key: 'incoming', label: 'Buyer Offers', icon: MessageSquare }
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t text-sm font-bold transition ${activeTab === tab.key ? 'text-gold border-b-2 border-gold' : 'text-secondary hover:text-primary'}`}>
                <tab.icon size={16} /> {tab.label}
                {tab.key === 'incoming' && pendingIncomingOffers > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {pendingIncomingOffers}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'reservations' && (
            <div className="space-y-4">
              {reservationOffers.length === 0 ? (
                <div className="bg-main border border-subtle rounded p-8 text-center text-secondary">
                  You do not have any active or settled reservations.
                </div>
              ) : (
                reservationOffers.map((offer) => (
                  <div key={offer._id} className="bg-main border border-subtle rounded-lg p-4 flex items-start gap-4">
                    <div className="w-20 h-14 rounded overflow-hidden bg-section flex-shrink-0">
                      {offer.car?.images?.[0] && !offer.car.images[0].includes('placeholder') ? (
                        <img src={offer.car.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-2xl">CAR</div>}
                    </div>
                    <div className="flex-grow">
                      <p className="text-primary font-bold">{offer.car?.brand} {offer.car?.model}</p>
                      <p className="text-secondary text-xs mt-1">{buyerOfferSummary(offer)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {statusBadge(offer.status)}
                        {offer.reservationStatus && offer.reservationStatus !== 'none' && statusBadge(offer.reservationStatus)}
                      </div>
                    </div>
                    {canArchiveBuyerOffer(offer) && renderDismissButton(
                      () => handleArchiveOffer(offer._id, 'buyer'),
                      archivingKey === `buyer-${offer._id}`
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link to="/sell-your-car" className="bg-gold text-main px-4 py-2 rounded font-bold text-sm hover:bg-yellow-600 transition flex items-center gap-2"><Plus size={16} /> List a Car</Link>
              </div>
              {myListings.length === 0 ? (
                <div className="bg-main border border-subtle rounded p-8 text-center text-secondary">
                  You have no active listing notifications. <Link to="/sell-your-car" className="text-gold hover:underline ml-1">Sell your car</Link>
                </div>
              ) : (
                myListings.map((car) => (
                  <div key={car._id} className={`bg-main border rounded-lg p-4 transition-all ${car.listingStatus === 'rejected' ? 'border-red-500/50 bg-red-900/10' : 'border-subtle'}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-14 rounded overflow-hidden bg-section flex-shrink-0">
                        {car.images?.[0] && !car.images[0].includes('placeholder') ? (
                          <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-2xl">CAR</div>}
                      </div>
                      <div className="flex-grow">
                        <p className="text-primary font-bold">{car.brand} {car.model}</p>
                        <p className="text-secondary text-xs">{car.year} - {formatEGP(car.price)}</p>
                        {pendingOffersByCar[car._id] > 0 && (
                          <p className="text-xs text-gold mt-1 font-bold">
                            {pendingOffersByCar[car._id]} pending buyer offer{pendingOffersByCar[car._id] > 1 ? 's' : ''}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {statusBadge(car.listingStatus)}
                          {statusBadge(car.status)}
                        </div>
                        {car.listingStatus === 'rejected' && car.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-600/10 border border-red-500/30 rounded text-xs text-red-400">
                            <div className="flex items-center gap-2 font-bold mb-1 uppercase tracking-wider">
                              <XCircle size={14} /> Rejection Feedback
                            </div>
                            "{car.rejectionReason}"
                          </div>
                        )}
                      </div>
                      {canArchiveListing(car) && renderDismissButton(
                        () => handleArchiveListing(car._id),
                        archivingKey === `listing-${car._id}`
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-4">
              {standardOffers.length === 0 ? (
                <div className="bg-main border border-subtle rounded p-8 text-center text-secondary">
                  You do not have any active offer notifications. <Link to="/used-cars" className="text-gold hover:underline ml-1">Browse used cars</Link>
                </div>
              ) : (
                standardOffers.map((offer) => (
                  <div key={offer._id} className="bg-main border border-subtle rounded-lg p-4 flex items-start gap-4">
                    <div className="w-20 h-14 rounded overflow-hidden bg-section flex-shrink-0">
                      {offer.car?.images?.[0] && !offer.car.images[0].includes('placeholder') ? (
                        <img src={offer.car.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-2xl">CAR</div>}
                    </div>
                    <div className="flex-grow">
                      <p className="text-primary font-bold">{offer.car?.brand} {offer.car?.model}</p>
                      <p className="text-secondary text-xs">
                        Asking: {formatEGP(offer.car?.price)} - Your offer: <span className="text-gold font-bold">{formatEGP(offer.offerPrice)}</span>
                      </p>
                      {offer.message && <p className="text-xs text-secondary mt-1 italic">"{offer.message}"</p>}
                      <p className="text-xs text-secondary mt-1">{buyerOfferSummary(offer)}</p>
                      <div className="mt-2">{statusBadge(offer.status)}</div>
                    </div>
                    {canArchiveBuyerOffer(offer) && renderDismissButton(
                      () => handleArchiveOffer(offer._id, 'buyer'),
                      archivingKey === `buyer-${offer._id}`
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'incoming' && (
            <div className="space-y-4">
              {incomingOffers.length === 0 ? (
                <div className="bg-main border border-subtle rounded p-8 text-center text-secondary">
                  No buyer offer notifications are waiting on your listings.
                </div>
              ) : (
                incomingOffers.map((offer) => (
                  <div key={offer._id} className="bg-main border border-subtle rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-primary font-bold">{offer.car?.brand} {offer.car?.model}</p>
                        <p className="text-secondary text-xs mt-1">
                          Asking: {formatEGP(offer.car?.price)} - Offer: <span className="text-gold font-bold">{formatEGP(offer.offerPrice)}</span>
                        </p>
                        <p className="text-xs text-secondary mt-2">{sellerOfferSummary(offer)}</p>
                        {offer.reservationStatus && offer.reservationStatus !== 'none' && (
                          <div className="mt-2">{statusBadge(offer.reservationStatus)}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {statusBadge(offer.status)}
                        {needsSellerResponse(offer) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSellerResponse(offer._id, 'accept')}
                              className="bg-green-600/15 text-green-400 border border-green-700 px-3 py-1.5 rounded text-sm font-bold hover:bg-green-600/25 transition"
                            >
                              Accept Price
                            </button>
                            <button
                              onClick={() => handleSellerResponse(offer._id, 'reject')}
                              className="bg-red-600/15 text-red-400 border border-red-700 px-3 py-1.5 rounded text-sm font-bold hover:bg-red-600/25 transition"
                            >
                              Reject Price
                            </button>
                          </div>
                        ) : canArchiveSellerOffer(offer) ? (
                          renderDismissButton(
                            () => handleArchiveOffer(offer._id, 'seller'),
                            archivingKey === `seller-${offer._id}`
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

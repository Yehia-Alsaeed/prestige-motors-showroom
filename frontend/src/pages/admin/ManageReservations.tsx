import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, Mail, Phone, Tag, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/apiFetch';

const ManageReservations = () => {
  const { token } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/offers/all', {}, token);
      const data = await res.json();
      if (res.ok) setOffers(data);
      else toast.error(data.message);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load reservations: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [token]);

  const handleUpdate = async (id: string, action: 'accept' | 'reject' | 'confirm-sold' | 'display-again') => {
    try {
      const res = await apiFetch(`/api/offers/${id}/${action}`, {
        method: 'PUT'
      }, token);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchOffers();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Request failed');
    }
  };

  const handleArchive = async (id: string) => {
    setArchivingId(id);
    try {
      const res = await apiFetch(`/api/offers/${id}/archive/admin`, { method: 'PUT' }, token);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchOffers();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Request failed');
    } finally {
      setArchivingId(null);
    }
  };

  const formatEGP = (price: number) => price?.toLocaleString('en-EG') + ' EGP';
  const getSellerDecision = (offer: any) => offer.sellerDecision || (offer.car?.listedBy ? 'pending' : 'not_required');

  const sellerDecisionText = (offer: any) => {
    const sellerDecision = getSellerDecision(offer);
    if (sellerDecision === 'not_required') return 'No seller approval required';
    if (sellerDecision === 'pending') return 'Waiting for seller price approval';
    if (sellerDecision === 'accepted') return `Seller accepted price${offer.sellerDecisionBy ? `: ${offer.sellerDecisionBy.firstName} ${offer.sellerDecisionBy.lastName}` : ''}`;
    return `Seller rejected price${offer.sellerDecisionBy ? `: ${offer.sellerDecisionBy.firstName} ${offer.sellerDecisionBy.lastName}` : ''}`;
  };

  const canAdminAccept = (offer: any) => offer.status === 'pending' && ['accepted', 'not_required'].includes(getSellerDecision(offer));
  const canAdminReject = (offer: any) => offer.status === 'pending';
  const canConfirmSold = (offer: any) => offer.status === 'accepted' && offer.reservationStatus === 'reserved';
  const canDisplayAgain = (offer: any) => offer.status === 'accepted' && offer.reservationStatus === 'reserved';
  const canArchive = (offer: any) => offer.status === 'rejected' || ['sold', 'relisted'].includes(offer.reservationStatus);

  const reservationStateBadge = (offer: any) => {
    if (!offer.reservationStatus || offer.reservationStatus === 'none') return null;

    const colors: any = {
      reserved: 'text-orange-400 bg-orange-900/20 border-orange-800/50',
      sold: 'text-purple-400 bg-purple-900/20 border-purple-800/50',
      relisted: 'text-cyan-400 bg-cyan-900/20 border-cyan-800/50'
    };

    return (
      <span className={`flex items-center gap-1.5 font-bold text-[10px] border px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit mt-2 ${colors[offer.reservationStatus]}`}>
        {offer.reservationStatus}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8 border-b border-subtle pb-4">Manage Reservations & Offers</h1>

      {loading ? (
        <div className="text-secondary text-center py-10 tracking-widest uppercase text-sm animate-pulse">Synchronizing database...</div>
      ) : (
        <div className="bg-card border border-subtle rounded-lg overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-subtle text-secondary bg-main/50">
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Customer</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Vehicle Details</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Pricing</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-primary">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-secondary">
                      <Clock size={32} className="mx-auto mb-2 opacity-20" />
                      <p>No active reservations or offers found.</p>
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr key={offer._id} className="border-b border-subtle hover:bg-main/30 transition group align-top">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-[15px]">{offer.buyer?.firstName} {offer.buyer?.lastName}</span>
                          <span className="flex items-center gap-1 text-[10px] text-secondary lowercase tracking-tight mt-0.5"><Mail size={10} /> {offer.buyer?.email}</span>
                          <span className="flex items-center gap-1 text-[10px] text-secondary tracking-tight"><Phone size={10} /> {offer.buyer?.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded bg-main overflow-hidden border border-subtle flex-shrink-0">
                            {offer.car?.images?.[0] ? (
                              <img src={offer.car.images[0]} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">CAR</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm tracking-tight">{offer.car?.brand} {offer.car?.model}</div>
                            <div className="text-[10px] text-secondary flex items-center gap-1 uppercase font-bold tracking-tighter">
                              <Calendar size={10} /> {offer.car?.year} - {offer.car?.category}
                            </div>
                            {offer.car?.listedBy && (
                              <div className="text-[10px] text-secondary mt-1">
                                Seller: {offer.car.listedBy.firstName} {offer.car.listedBy.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs text-secondary line-through opacity-50">{formatEGP(offer.car?.price)}</span>
                          <span className="text-gold font-bold text-sm flex items-center gap-1"><Tag size={12} /> {formatEGP(offer.offerPrice)}</span>
                          {offer.message && (
                            <div className="text-[10px] text-secondary mt-1 max-w-[220px]">
                              Buyer message: <span className="italic">"{offer.message}"</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {offer.status === 'accepted' ? (
                          <span className="flex items-center gap-1.5 text-green-500 font-bold text-[10px] bg-green-900/20 border border-green-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit">
                            <CheckCircle size={12} /> Reserved
                          </span>
                        ) : offer.status === 'rejected' ? (
                          <span className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] bg-red-900/20 border border-red-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit">
                            <XCircle size={12} /> Rejected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-yellow-500 font-bold text-[10px] bg-yellow-900/20 border border-yellow-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit animate-pulse">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        <div className="text-[10px] text-secondary mt-2 max-w-[220px]">
                          {sellerDecisionText(offer)}
                        </div>
                        {(offer.wasUpdated || offer.needsAdminReview) && (
                          <div className="flex flex-wrap gap-1 mt-2 max-w-[220px]">
                            {offer.needsAdminReview && (
                              <span className="text-[10px] text-cyan-300 bg-cyan-900/20 border border-cyan-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                New update
                              </span>
                            )}
                            {offer.wasUpdated && (
                              <span className="text-[10px] text-secondary bg-main/50 border border-subtle px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Updated
                              </span>
                            )}
                          </div>
                        )}
                        {reservationStateBadge(offer)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {(canAdminAccept(offer) || canAdminReject(offer)) && (
                          <div className="flex justify-end gap-2 mb-2 flex-wrap">
                            {canAdminAccept(offer) && (
                              <button
                                onClick={() => handleUpdate(offer._id, 'accept')}
                                className="bg-green-600/10 text-green-500 border border-green-800 p-1.5 rounded hover:bg-green-600/20 transition"
                                title="Reserve"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {canAdminReject(offer) && (
                              <button
                                onClick={() => handleUpdate(offer._id, 'reject')}
                                className="bg-red-600/10 text-red-500 border border-red-800 p-1.5 rounded hover:bg-red-600/20 transition"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        )}

                        {(canConfirmSold(offer) || canDisplayAgain(offer)) && (
                          <div className="flex justify-end gap-2 mb-2 flex-wrap">
                            {canConfirmSold(offer) && (
                              <button
                                onClick={() => handleUpdate(offer._id, 'confirm-sold')}
                                className="bg-purple-600/10 text-purple-400 border border-purple-800 px-2 py-1 rounded hover:bg-purple-600/20 transition text-[11px] font-bold"
                              >
                                Confirm Sold
                              </button>
                            )}
                            {canDisplayAgain(offer) && (
                              <button
                                onClick={() => handleUpdate(offer._id, 'display-again')}
                                className="bg-cyan-600/10 text-cyan-400 border border-cyan-800 px-2 py-1 rounded hover:bg-cyan-600/20 transition text-[11px] font-bold flex items-center gap-1"
                              >
                                <RotateCcw size={12} />
                                Display Again
                              </button>
                            )}
                          </div>
                        )}

                        {canArchive(offer) && (
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={() => handleArchive(offer._id)}
                              disabled={archivingId === offer._id}
                              className="text-secondary hover:text-red-400 transition p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        <span className="text-[10px] text-secondary font-mono tracking-tighter opacity-50">#ID-{offer._id.slice(-6)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservations;

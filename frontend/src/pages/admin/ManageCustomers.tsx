import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, User, Tag, Calendar, Fuel, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/apiFetch';

const ManageApprovals = () => {
  const { token } = useAuth();
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/cars/pending', {}, token);
      const data = await res.json();
      if (res.ok) setPending(data);
    } catch {
      toast.error('Failed to load pending listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      const res = await apiFetch(`/api/cars/${id}/approve`, {
        method: 'PUT'
      }, token);
      if (res.ok) {
        toast.success('Listing approved and published!');
        fetchPending();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Approval failed');
      }
    } catch {
      toast.error('Server error during approval');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error('Please provide a reason for rejection');
    setProcessing(true);
    try {
      const res = await apiFetch(`/api/cars/${selectedListing._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      }, token);
      if (res.ok) {
        toast.success('Listing rejected and customer notified');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedListing(null);
        fetchPending();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Rejection failed');
      }
    } catch {
      toast.error('Server error during rejection');
    } finally {
      setProcessing(false);
    }
  };

  const formatEGP = (price: number) => price?.toLocaleString('en-EG') + ' EGP';

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8 border-b border-subtle pb-4 flex items-center gap-3">
        Listing Approvals <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">{pending.length} Pending</span>
      </h1>
      
      {loading ? (
        <div className="text-secondary text-center py-10 uppercase tracking-widest text-sm animate-pulse">Checking for new requests...</div>
      ) : (
        <div className="space-y-6">
          {pending.length === 0 ? (
            <div className="bg-card border border-subtle rounded-xl p-12 text-center text-secondary">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">All caught up! No pending listings for approval.</p>
            </div>
          ) : (
            pending.map(listing => (
              <div key={listing._id} className="bg-card border border-subtle rounded-xl overflow-hidden shadow-xl hover:border-gold/30 transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail & Key Info */}
                  <div className="lg:w-72 h-56 lg:h-auto bg-main relative overflow-hidden flex-shrink-0">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                      <Clock size={10}/> Pending Since {new Date(listing.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-primary">{listing.brand} {listing.model} {listing.year}</h2>
                        <span className="text-gold font-bold text-xl">{formatEGP(listing.price)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Tag size={14} className="text-gold" /> {listing.bodyType}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Settings size={14} className="text-gold" /> {listing.transmission}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Fuel size={14} className="text-gold" /> {listing.fuelType}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Calendar size={14} className="text-gold" /> {listing.mileage?.toLocaleString()} km
                        </div>
                      </div>

                      <div className="bg-main/50 p-3 rounded text-sm text-secondary italic border-l-2 border-gold/30 mb-4 line-clamp-2">
                        "{listing.overview}"
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pt-4 border-t border-subtle/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                          <User size={14} />
                        </div>
                        <div className="text-xs">
                          <div className="text-primary font-bold">{listing.listedBy?.firstName} {listing.listedBy?.lastName}</div>
                          <div className="text-secondary">{listing.listedBy?.email}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(listing._id)}
                          disabled={processing}
                          className="flex items-center gap-2 bg-green-600/10 text-green-500 border border-green-800/50 px-4 py-2 rounded font-bold text-xs hover:bg-green-600/20 transition-all active:scale-95"
                        >
                          <CheckCircle size={16} /> Approve Listing
                        </button>
                        <button 
                          onClick={() => { setSelectedListing(listing); setShowRejectModal(true); }}
                          disabled={processing}
                          className="flex items-center gap-2 bg-red-600/10 text-red-500 border border-red-800/50 px-4 py-2 rounded font-bold text-xs hover:bg-red-600/20 transition-all active:scale-95"
                        >
                          <XCircle size={16} /> Reject with Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-subtle shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-subtle flex justify-between items-center bg-section">
              <h2 className="font-bold text-primary text-xl flex items-center gap-2">
                <MessageSquare size={20} className="text-red-500" /> Reject Listing
              </h2>
              <button onClick={() => setShowRejectModal(false)} className="text-secondary hover:text-primary transition"><XCircle size={20}/></button>
            </div>
            <div className="p-6">
              <div className="mb-4 text-sm text-secondary">
                Provide a reason for rejecting <span className="text-primary font-bold">{selectedListing?.brand} {selectedListing?.model}</span>. This will be sent to the customer to help them correct their listing.
              </div>
              <textarea 
                rows={4} 
                className="w-full bg-main border border-subtle rounded-lg p-3 text-primary outline-none focus:border-red-500 transition-colors resize-none mb-4"
                placeholder="e.g. Photos are blurry, price is too high for the condition, or missing vehicle details..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-main border border-subtle text-secondary py-3 rounded font-bold hover:bg-card transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApprovals;

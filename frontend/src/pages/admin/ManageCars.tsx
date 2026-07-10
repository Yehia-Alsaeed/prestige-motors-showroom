import { useState, useEffect, useRef } from 'react';
import { Trash2, Tag, ImagePlus, X, UploadCloud, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/apiFetch';

interface StagedPhoto {
  id: string;
  type: 'existing' | 'new';
  url: string; // CDN URL for existing, blob URL for new
  file?: File;  // Only for new
}

const ManageCars = () => {
  const { token } = useAuth();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Image Management State
  const [editingCar, setEditingCar] = useState<any>(null);
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    setLoading(true);
    apiFetch('/api/cars/admin/all', {}, token)
      .then(r => r.json())
      .then(allCars => {
        setCars(allCars.filter((car: any) => car.status === 'available' && car.listingStatus === 'approved'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(fetchData, [token]);

  const openPhotoModal = (car: any) => {
    const existing = (car.images || []).map((url: string, i: number) => ({
      id: `existing-${i}-${Date.now()}`,
      type: 'existing',
      url
    }));
    setEditingCar(car);
    setStagedPhotos(existing);
  };

  const formatEGP = (price: number) => price?.toLocaleString('en-EG') + ' EGP';

  const handleAction = async (url: string, method: string = 'PUT') => {
    try {
      const res = await apiFetch(url, { method }, token);
      const data = await res.json();
      if (res.ok) { toast.success(data.message || 'Action completed'); fetchData(); }
      else toast.error(data.message);
    } catch { toast.error('Server error'); }
  };

  const handleDeleteCar = async (car: any) => {
    const confirmed = window.confirm(`Delete ${car.brand} ${car.model}? This will also remove related offers and reservations.`);
    if (!confirmed) return;

    setDeletingId(car._id);
    try {
      const res = await apiFetch(`/api/cars/${car._id}`, { method: 'DELETE' }, token);
      const data = await res.json();

      if (res.ok) {
        setCars((current) => current.filter((item) => item._id !== car._id));
        toast.success(data.message || 'Car removed');
      } else {
        toast.error(data.message || 'Failed to delete car');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (stagedPhotos.length + files.length > 6) {
        toast.error('Maximum 6 photos allowed');
        return;
      }
      
      const newEntries: StagedPhoto[] = files.map(file => ({
        id: `new-${Math.random()}-${Date.now()}`,
        type: 'new',
        url: URL.createObjectURL(file),
        file
      }));

      setStagedPhotos([...stagedPhotos, ...newEntries]);
      e.target.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setStagedPhotos(stagedPhotos.filter(p => p.id !== id));
  };

  const movePhoto = (index: number, direction: 'left' | 'right') => {
    const newPos = direction === 'left' ? index - 1 : index + 1;
    if (newPos < 0 || newPos >= stagedPhotos.length) return;
    
    const updated = [...stagedPhotos];
    [updated[index], updated[newPos]] = [updated[newPos], updated[index]];
    setStagedPhotos(updated);
  };

  const handleUpdatePhotos = async () => {
    if (stagedPhotos.length === 0) return toast.error('At least 1 photo is required');
    setUploading(true);
    
    try {
      // 1. Prepare the final list of URLs
      // We need to upload 'new' ones and keep 'existing' ones in the correct order
      const finalImageUrls: string[] = [];
      
      for (const photo of stagedPhotos) {
        if (photo.type === 'existing') {
          finalImageUrls.push(photo.url);
        } else if (photo.file) {
          // Upload this specific file
          const formData = new FormData();
          formData.append('images', photo.file);
          
          const uploadRes = await apiFetch('/api/upload', {
            method: 'POST',
            body: formData
          }, token);
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');
          finalImageUrls.push(uploadData.urls[0]);
        }
      }

      // 2. Update Car
      const updateRes = await apiFetch(`/api/cars/${editingCar._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: finalImageUrls })
      }, token);

      if (updateRes.ok) {
        toast.success('Photos updated and reordered!');
        setEditingCar(null);
        fetchData();
      } else {
        throw new Error('Failed to update car');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating photos');
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: any = {
      available: 'text-green-500 border-green-800 bg-green-900/40',
      reserved: 'text-yellow-500 border-yellow-800 bg-yellow-900/40',
      sold: 'text-red-500 border-red-800 bg-red-900/40',
      hidden: 'text-secondary border-subtle bg-main',
      pending: 'text-yellow-500 border-yellow-800 bg-yellow-900/40',
      approved: 'text-green-500 border-green-800 bg-green-900/40',
      rejected: 'text-red-500 border-red-800 bg-red-900/40',
    };
    return <span className={`font-bold text-xs border px-2 py-1 rounded uppercase ${colors[status] || ''}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-10 border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Inventory Management</h1>
        <div className="bg-card px-4 py-2 rounded border border-subtle text-xs text-secondary font-bold uppercase tracking-widest">
          {cars.length} Total Vehicles
        </div>
      </div>

      {loading ? <div className="text-secondary text-center py-10">Loading...</div> : (
        <>
          <div className="bg-card border border-subtle rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-subtle text-secondary bg-main/50">
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Vehicle</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Brand & Model</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Category</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Price</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest">Status</th>
                    <th className="py-4 px-6 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-primary">
                  {cars.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-secondary">No vehicles found in inventory.</td></tr>
                  ) : (
                    cars.map(car => (
                      <tr key={car._id} className="border-b border-subtle hover:bg-main/30 transition group">
                        <td className="py-4 px-6">
                          <div className="w-16 h-11 rounded overflow-hidden bg-section border border-subtle flex items-center justify-center relative group/img cursor-pointer" onClick={() => openPhotoModal(car)}>
                            {car.images?.[0] && !car.images[0].includes('placeholder') ?
                              <img src={car.images[0]} className="w-full h-full object-cover group-hover/img:brightness-50 transition" alt="" /> :
                              <span className="text-lg group-hover/img:opacity-50 transition">🚗</span>}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition bg-black/50">
                              <ImagePlus size={16} className="text-white" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-[15px]">{car.brand} {car.model}</div>
                          <div className="text-xs text-secondary">{car.year} • {car.mileage?.toLocaleString()} km</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border ${car.category === 'new' ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-orange-900/20 text-orange-400 border-orange-800/50'}`}>{car.category}</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-sm text-gold">{formatEGP(car.price)}</td>
                        <td className="py-4 px-6">{statusBadge(car.status)}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openPhotoModal(car)} className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-800/50 px-3 py-1.5 rounded hover:bg-blue-600/20 transition-all active:scale-95"><ImagePlus size={14}/> Photos</button>
                            {car.status === 'available' && (
                              <button onClick={() => handleAction(`/api/cars/${car._id}/mark-sold`)} className="flex items-center gap-1.5 text-[10px] font-bold bg-gold/10 text-gold border border-gold/50 px-3 py-1.5 rounded hover:bg-gold/20 transition-all active:scale-95"><Tag size={14}/> Sold</button>
                            )}
                            <button
                              onClick={() => handleDeleteCar(car)}
                              disabled={deletingId === car._id}
                              className="text-red-500/60 hover:text-red-500 transition-all p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={deletingId === car._id ? 'Deleting...' : 'Delete car'}
                            >
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Photo Reordering & Upload Modal */}
      {editingCar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-lg border border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between gap-3 p-4 border-b border-subtle bg-section">
              <h2 className="font-bold text-primary text-base sm:text-lg leading-tight">Manage Gallery: {editingCar.brand} {editingCar.model}</h2>
              <button onClick={() => setEditingCar(null)} className="text-secondary hover:text-primary transition"><X size={20}/></button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div 
                className="border-2 border-dashed border-subtle rounded-lg p-6 text-center hover:bg-main hover:border-gold transition cursor-pointer mb-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={32} className="mx-auto text-gold mb-2" />
                <p className="text-primary font-bold text-sm">Add New Photos</p>
                <input 
                  type="file" multiple accept="image/*" className="hidden" 
                  ref={fileInputRef} onChange={handleImageSelect}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {stagedPhotos.map((photo, i) => (
                  <div key={photo.id} className="flex flex-col gap-2">
                    <div className="aspect-[4/3] rounded-lg border border-subtle overflow-hidden relative group/item bg-main">
                      <img src={photo.url} className={`w-full h-full object-cover ${photo.type === 'new' ? 'opacity-70' : ''}`} alt="" />
                      
                      {/* Badge */}
                      <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${i === 0 ? 'bg-gold text-main' : 'bg-black/60 text-white'}`}>
                        {i === 0 ? 'Main' : `#${i + 1}`}
                      </span>
                      {photo.type === 'new' && <span className="absolute bottom-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>}

                      {/* Remove Button */}
                      <button 
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition shadow-lg"
                      >
                        <X size={14} />
                      </button>

                      {/* Hover Controls */}
                      <div className="absolute inset-x-0 bottom-0 p-2 flex justify-between bg-black/40 opacity-0 group-hover/item:opacity-100 transition">
                        <button disabled={i === 0} onClick={() => movePhoto(i, 'left')} className="p-1 bg-primary/20 hover:bg-primary/40 text-white rounded disabled:opacity-30">
                          <ArrowLeft size={16} />
                        </button>
                        <button disabled={i === stagedPhotos.length - 1} onClick={() => movePhoto(i, 'right')} className="p-1 bg-primary/20 hover:bg-primary/40 text-white rounded disabled:opacity-30">
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-subtle bg-section flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <p className="text-xs text-secondary font-medium">Reorder photos using arrows. First photo is used as thumbnail.</p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button disabled={uploading} onClick={() => setEditingCar(null)} className="px-4 py-2 rounded text-sm font-bold border border-subtle text-secondary hover:bg-main transition">Cancel</button>
                <button 
                  disabled={uploading || stagedPhotos.length === 0} 
                  onClick={handleUpdatePhotos} 
                  className="px-6 py-2 rounded text-sm font-bold bg-gold text-main hover:bg-yellow-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? 'Updating Gallery...' : 'Save Gallery Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageCars;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';

const SubmitListing = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    brand: '', model: '', year: 2024, price: 0, mileage: 0,
    fuelType: '', transmission: '', bodyType: '', overview: ''
  });

  const brandList = ['Nissan','Hyundai','Kia','MG','Chery','BYD','Jetour','Toyota','Skoda','GAC','BMW','Audi','Mercedes-Benz','Ferrari','Bentley','Aston Martin','Lamborghini','Rolls-Royce','Other'];
  const bodyTypes = ['Sedan','SUV','Crossover','Hatchback','Coupe','Convertible','Fastback','Gran Coupe','Roadster','Full-size SUV','Off-road SUV'];
  const fuelTypes = ['Petrol','Diesel','Electric','Hybrid'];
  const transmissions = ['Automatic','Manual'];
  const years = Array.from({length: 20}, (_, i) => 2026 - i);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 photos allowed');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData
      }, token);
      const data = await res.json();
      if (res.ok) {
        setImages(prev => [...prev, ...data.urls]);
        toast.success(`${data.urls.length} photo(s) uploaded!`);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch { toast.error('Upload error'); }
    finally { setUploading(false); }
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please agree to the commission terms first'); return; }
    if (images.length < 3) { toast.error('Please upload at least 3 photos'); return; }
    if (!form.brand || !form.model || !form.fuelType || !form.transmission || !form.bodyType || !form.overview) {
      toast.error('Please fill in all required fields'); return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/cars/submit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images })
      }, token);
      const data = await res.json();
      if (res.ok) {
        toast.success('Listing submitted for admin approval!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch { toast.error('Server error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-primary mb-4 tracking-tight">Sell Your Car with Us</h1>
        <p className="text-secondary text-lg leading-relaxed">Join Egypt's most trusted luxury car network. We handle the marketing, the negotiation, and the paperwork while you sit back and wait for the best offer.</p>
      </div>

      {/* Why Sell with Us? Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: '💎', title: 'Quality Guaranteed', desc: 'Every car we list goes through a prestige check, ensuring higher trust from buyers.' },
          { icon: '⚡', title: 'Fast Selling', desc: 'Our targeted network of luxury car enthusiasts ensures your car sells 3x faster than traditional apps.' },
          { icon: '🛡️', title: 'Secure Transactions', desc: 'We handle the financial escrow and paperwork to protect both buyer and seller.' }
        ].map((item, i) => (
          <div key={i} className="bg-card border border-subtle p-6 rounded-xl hover:border-gold transition-colors duration-500">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-primary font-bold mb-2">{item.title}</h3>
            <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Commission Notice */}
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-grow">
          <h3 className="text-gold font-bold text-xl mb-1 flex items-center gap-2">Showroom Service Fee: 6%</h3>
          <p className="text-secondary text-sm">To provide premium photography, marketing, and negotiation support, we charge a fixed <span className="text-primary font-bold">6% commission</span> on the final agreed sale price of your vehicle. You only pay when your car sells!</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-4 rounded-lg border border-subtle whitespace-nowrap">
          <input 
            type="checkbox" 
            id="agreement" 
            className="w-5 h-5 accent-gold cursor-pointer" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
          />
          <label htmlFor="agreement" className="text-primary font-bold text-sm cursor-pointer">I agree to the commission</label>
        </div>
      </div>

      <div className={!agreed ? 'opacity-30 pointer-events-none grayscale transition-all duration-700' : 'transition-all duration-700'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-card border border-subtle rounded-lg p-6">
            <h2 className="text-lg font-bold text-primary mb-1 flex items-center gap-2"><Camera size={20} className="text-gold"/> Vehicle Photos</h2>
            <p className="text-secondary text-sm mb-4">Upload 3–6 high-quality photos. The first photo will be your main listing image.</p>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-video bg-main rounded overflow-hidden border border-subtle group">
                  <img src={url} alt={`Car ${i+1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-gold text-main text-[10px] font-bold px-1.5 py-0.5 rounded">MAIN</span>}
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-900/80 text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X size={14}/></button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="aspect-video bg-main border-2 border-dashed border-subtle rounded flex flex-col items-center justify-center cursor-pointer hover:border-gold transition text-secondary hover:text-gold">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs">{uploading ? 'Uploading...' : 'Add Photo'}</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
            <p className="text-xs text-secondary">{images.length}/6 photos • Min 3 required</p>
          </div>

          {/* Vehicle Details */}
          <div className="bg-card border border-subtle rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-primary mb-2">Vehicle Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Brand *</label>
                <select required value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1">
                  <option value="">Select Brand</option>
                  {brandList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Model *</label>
                <input required value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1" placeholder="e.g. Corolla 2023" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Year *</label>
                <select required value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Price (EGP) *</label>
                <input type="number" required min={1} value={form.price || ''} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1" />
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Mileage (km) *</label>
                <input type="number" required min={0} value={form.mileage || ''} onChange={e => setForm({...form, mileage: Number(e.target.value)})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Fuel Type *</label>
                <select required value={form.fuelType} onChange={e => setForm({...form, fuelType: e.target.value})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1">
                  <option value="">Select</option>
                  {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Transmission *</label>
                <select required value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1">
                  <option value="">Select</option>
                  {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary font-bold uppercase tracking-wider">Body Type *</label>
                <select required value={form.bodyType} onChange={e => setForm({...form, bodyType: e.target.value})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1">
                  <option value="">Select</option>
                  {bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-secondary font-bold uppercase tracking-wider">Vehicle Overview *</label>
              <textarea required rows={4} value={form.overview} onChange={e => setForm({...form, overview: e.target.value})} className="w-full bg-main border border-subtle rounded p-2.5 text-primary focus:border-gold outline-none mt-1 resize-none" placeholder="Describe your car's condition, features, history..." />
            </div>
          </div>

          <button type="submit" disabled={loading || images.length < 3} className="w-full bg-gold text-main py-4 rounded font-bold text-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Submit Listing for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitListing;

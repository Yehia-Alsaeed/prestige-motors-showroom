import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-subtle bg-section/95">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/ddpmrivna/image/upload/v1774280433/prestige-motors-assets/logo.png"
                alt="Prestige Motors Logo"
                className="h-11 w-auto object-contain"
              />
              <div>
                <h3 className="text-2xl font-bold tracking-[0.25em] uppercase text-primary">Prestige Motors</h3>
                <p className="text-[11px] uppercase tracking-[0.35em] text-gold/80">Luxury. Trust. Precision.</p>
              </div>
            </div>

            <p className="max-w-xl text-secondary leading-7">
              Prestige Motors is a modern Egyptian showroom for premium brand-new and carefully selected pre-owned vehicles.
              We combine verified inventory, transparent pricing, and guided reservations so every customer can buy with confidence.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-bold text-gold transition hover:bg-gold hover:text-main"
              >
                Visit Showroom
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/sell-your-car"
                className="inline-flex items-center gap-2 rounded-full border border-subtle px-4 py-2 text-sm font-bold text-primary transition hover:border-gold/40 hover:text-gold"
              >
                Sell Your Car
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-primary">Explore</h4>
            <ul className="space-y-3 text-secondary">
              <li><Link to="/" className="transition hover:text-gold">Home</Link></li>
              <li><Link to="/cars" className="transition hover:text-gold">Our Showroom</Link></li>
              <li><Link to="/used-cars" className="transition hover:text-gold">Used Cars</Link></li>
              <li><Link to="/about" className="transition hover:text-gold">About Us</Link></li>
              <li><Link to="/contact" className="transition hover:text-gold">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-primary">Contact</h4>
            <div className="space-y-4 text-secondary">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-gold" />
                <span>Prestige Motors Showroom, New Cairo, Egypt</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-1 flex-shrink-0 text-gold" />
                <span>+20 100 000 0000</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-1 flex-shrink-0 text-gold" />
                <span>info@prestigemotors.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-subtle pt-6 text-xs text-secondary md:flex-row md:items-center md:justify-between">
          <p>Prestige Motors. Premium buying, premium selling, premium aftercare.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

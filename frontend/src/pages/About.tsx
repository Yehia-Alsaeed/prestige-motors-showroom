import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';

const aboutHeroImage = 'https://res.cloudinary.com/ddpmrivna/image/upload/v1774384020/prestige-motors/about/prestige-motors-about-hero.png';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-16 md:py-20">
      <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-stretch">
        <div className="relative overflow-hidden rounded-[28px] border border-subtle bg-card p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
          <div className="relative z-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-gold">About Prestige Motors</p>
            <h1 className="max-w-2xl text-4xl md:text-5xl font-bold text-primary leading-tight">
              A showroom built for customers who want premium cars without a messy buying process.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary">
              Prestige Motors brings together brand-new vehicles, verified pre-owned listings, and a cleaner reservation flow in one place.
              Our focus is simple: present quality cars properly, protect both buyer and seller, and make every step feel clear and professional.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-subtle bg-main/50 p-4">
                <p className="text-2xl font-bold text-primary">Brand New</p>
                <p className="mt-1 text-sm text-secondary">Factory-fresh inventory for direct reservation.</p>
              </div>
              <div className="rounded-2xl border border-subtle bg-main/50 p-4">
                <p className="text-2xl font-bold text-primary">Used Market</p>
                <p className="mt-1 text-sm text-secondary">Verified listings with structured price negotiation.</p>
              </div>
              <div className="rounded-2xl border border-subtle bg-main/50 p-4">
                <p className="text-2xl font-bold text-primary">Admin Review</p>
                <p className="mt-1 text-sm text-secondary">Controlled approvals, reservations, and sold confirmations.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-bold text-main transition hover:bg-yellow-600"
              >
                Explore Showroom
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-3 font-bold text-gold transition hover:bg-gold/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-gold/20 bg-main shadow-2xl shadow-gold/5">
          <img
            src={aboutHeroImage}
            alt="Prestige Motors showroom"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-main via-main/20 to-transparent" />
          <div className="absolute left-6 right-6 bottom-6 rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Prestige Motors</p>
            <p className="mt-2 text-lg font-bold text-primary">A premium showroom identity designed to feel modern, bold, and unmistakable.</p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-subtle bg-card p-7">
          <BadgeCheck className="text-gold mb-4" size={26} />
          <h2 className="text-xl font-bold text-primary mb-3">Curated Inventory</h2>
          <p className="text-secondary leading-7">
            Every vehicle on Prestige Motors is presented with the details customers actually care about, from price and condition to the path for reservation or negotiation.
          </p>
        </div>
        <div className="rounded-3xl border border-subtle bg-card p-7">
          <ShieldCheck className="text-gold mb-4" size={26} />
          <h2 className="text-xl font-bold text-primary mb-3">Protected Workflow</h2>
          <p className="text-secondary leading-7">
            Seller review, admin control, reservation status, and sold confirmation are separated clearly so the platform stays organized and fair for everyone involved.
          </p>
        </div>
        <div className="rounded-3xl border border-subtle bg-card p-7">
          <Sparkles className="text-gold mb-4" size={26} />
          <h2 className="text-xl font-bold text-primary mb-3">Luxury Experience</h2>
          <p className="text-secondary leading-7">
            From the visual presentation to the customer journey, the goal is to make buying or listing a premium car feel elevated instead of stressful.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-[28px] border border-subtle bg-card p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold mb-4">Our Mission</p>
            <h2 className="text-3xl font-bold text-primary mb-4">Make premium car buying feel direct, transparent, and worth the trust it asks for.</h2>
            <p className="text-secondary leading-8">
              Prestige Motors was shaped around a simple standard: a premium showroom should look premium, communicate clearly, and protect the decision-making process.
              That means clean listings, real status updates, and a controlled deal flow from first offer to final sold confirmation.
            </p>
          </div>

          <div className="rounded-3xl border border-gold/20 bg-main/60 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold mb-4">Why Customers Choose Us</p>
            <div className="space-y-4 text-secondary leading-7">
              <p>Clear separation between available, reserved, and sold vehicles.</p>
              <p>Used-car negotiations that stay structured instead of chaotic.</p>
              <p>Admin-reviewed reservations that keep showroom inventory accurate.</p>
              <p>A brand presentation that fits the level of the cars being sold.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <div className="max-w-3xl mx-auto bg-card border border-subtle rounded-lg p-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Contact Us</h1>
        <p className="text-secondary mb-8">Have a question or looking for a specific vehicle? Send us a message.</p>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-secondary mb-2">Full Name</label>
              <input type="text" className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-2">Email Address</label>
              <input type="email" className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary mb-2">Message</label>
            <textarea rows={5} className="w-full bg-main border border-subtle rounded p-3 text-primary focus:outline-none focus:border-gold transition" placeholder="How can we help you?"></textarea>
          </div>
          <button type="button" className="bg-gold text-main font-bold py-3 px-8 rounded hover:bg-yellow-600 transition">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;

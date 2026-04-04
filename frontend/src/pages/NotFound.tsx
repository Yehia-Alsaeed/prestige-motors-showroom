import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary mb-6">Page Not Found</h2>
        <p className="text-subtle mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="bg-primary text-background px-8 py-3 rounded-md font-medium hover:bg-gold transition-colors inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

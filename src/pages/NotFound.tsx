import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-secondary">Page not found</p>
      <Link to="/" className="mt-8 text-accent hover:underline">
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;

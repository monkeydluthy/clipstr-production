import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
    </div>
  );
};

export default HomePage;
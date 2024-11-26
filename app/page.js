'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image 
              src="/icons/research.png" 
              alt="Log Analytics Platform" 
              width={80} 
              height={80} 
            />
          </div>
          <h1 className="text-5xl font-bold mb-6">Log Analytics Platform</h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Real-time monitoring and analysis of application logs across multiple services. 
            Track performance, detect errors, and gain insights instantly.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
          >
            Launch Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            title="Real-time Monitoring"
            description="Track logs and metrics in real-time with automatic updates every 10 seconds"
            icon="📊"
          />
          <FeatureCard 
            title="Multi-project Support"
            description="Monitor logs across different projects and services from a single dashboard"
            icon="🔍"
          />
          <FeatureCard 
            title="Advanced Analytics"
            description="Comprehensive error tracking and performance metrics with visual insights."
            icon="📈"
          />
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors duration-300">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

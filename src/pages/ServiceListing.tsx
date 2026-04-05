import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, User, ShieldCheck, ArrowLeft, MessageSquare, Play } from 'lucide-react';
import { formatSats, satsToUsd, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { MOCK_LISTINGS } from '../constants';

const MOCK_SERVICE_DETAILS = {
  requirements: 'Please provide a detailed description of the task, any input files (CSV, JSON), and the desired output format.',
  sampleOutput: 'A fully functional .py script and a sample output file demonstrating the automation.',
  reviews: [
    { id: 'r1', user: 'BitStacker', rating: 5, text: 'Amazing work, saved me hours of manual data entry!' },
    { id: 'r2', user: 'SatsLover', rating: 4, text: 'Great script, minor bug fixed quickly.' },
  ]
};

export default function ServiceListing() {
  const { id } = useParams();
  const baseService = MOCK_LISTINGS.find(s => s.id === id) || MOCK_LISTINGS[0];
  
  const service = {
    ...baseService,
    vendor: {
      name: baseService.vendor,
      avatar: baseService.vendor[0],
      rating: baseService.rating,
      tasksCompleted: 142, // Mocked
    },
    ...MOCK_SERVICE_DETAILS
  };

  return (
    <div className="space-y-8 pb-10">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        <span>Back to marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h1 className="text-4xl font-black">{service.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white">
                  {service.vendor.avatar}
                </div>
                <div>
                  <p className="font-bold">{service.vendor.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Star size={12} className="fill-accent text-accent" />
                    <span>{service.vendor.rating}</span>
                    <span>•</span>
                    <span>{service.vendor.tasksCompleted} tasks</span>
                  </div>
                </div>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
                  {service.type}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Play size={20} className="text-accent" /> Service Preview
            </h2>
            <div className="aspect-video bg-muted rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5 shadow-2xl">
              <img 
                src={`https://picsum.photos/seed/${service.id}/1280/720`} 
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent/50">
                  <Play className="text-white fill-white ml-1" size={36} />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  Preview Video
                </span>
                <span className="text-xs font-mono text-white/80">0:45</span>
              </div>
            </div>
          </section>

          <section className="glass p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold">Description</h2>
            <div className="text-gray-400 whitespace-pre-line leading-relaxed">
              {service.description}
            </div>
          </section>

          <section className="glass p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold">Requirements</h2>
            <p className="text-gray-400">{service.requirements}</p>
          </section>

          <section className="glass p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold">Sample Output</h2>
            <p className="text-gray-400">{service.sampleOutput}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold">Reviews ({service.reviews.length})</h2>
            <div className="space-y-4">
              {service.reviews.map((review) => (
                <div key={review.id} className="glass p-6 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{review.user}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={cn(i < review.rating ? "fill-accent text-accent" : "text-gray-600")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Order Card */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-[2.5rem] sticky top-24 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-4xl font-black text-accent">{formatSats(service.price)} sats</p>
              <p className="text-gray-400">~{satsToUsd(service.price)} USD</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Clock size={16} /> Delivery Time
                </span>
                <span className="font-bold">{service.delivery}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <ShieldCheck size={16} /> Escrow Protection
                </span>
                <span className="font-bold text-green-400">Active</span>
              </div>
            </div>

            <Link to={`/order/${service.id}`} className="block">
              <button className="btn-primary w-full py-4 text-lg">Order Now</button>
            </Link>

            <button className="btn-secondary w-full flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Contact Vendor
            </button>

            <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
              Instant Lightning Payment Required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

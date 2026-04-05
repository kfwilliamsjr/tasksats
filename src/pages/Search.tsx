import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Star, Clock, Filter, ChevronDown, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatSats, cn } from '../lib/utils';
import { CATEGORIES, MOCK_LISTINGS } from '../constants';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchInput, setSearchInput] = useState(query);

  const filteredListings = useMemo(() => {
    let results = MOCK_LISTINGS.filter(item => {
      const matchesQuery = 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      
      return matchesQuery && matchesCategory;
    });

    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Mocking newest by ID for now
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
    }

    return results;
  }, [query, selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Search Header */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black font-display">
              {query ? `Results for "${query}"` : 'All Services'}
            </h1>
            <p className="text-gray-500 text-sm">
              {filteredListings.length} {filteredListings.length === 1 ? 'service' : 'services'} found {query ? `for '${query}'` : ''}
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 transition-all text-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                !selectedCategory ? "bg-accent text-black" : "bg-white/5 text-gray-500 hover:text-white"
              )}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedCategory === cat.id ? "bg-accent text-black" : "bg-white/5 text-gray-500 hover:text-white"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent/50 cursor-pointer"
              >
                <option value="price-low">Price Low-High</option>
                <option value="price-high">Price High-Low</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section>
        <AnimatePresence mode="wait">
          {filteredListings.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredListings.map((item) => (
                <Link key={item.id} to={`/service/${item.id}`}>
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="glass rounded-[2rem] overflow-hidden flex flex-col h-full border-white/5 hover:border-accent/20 transition-all group"
                  >
                    <div className="aspect-[16/10] bg-muted relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4">
                        <div className={cn(
                          "badge",
                          item.type === 'AI Agent' ? "text-blue-400 border-blue-500/20" : "text-green-400 border-green-500/20"
                        )}>
                          <div className={cn("badge-dot", item.type === 'AI Agent' ? "bg-blue-500" : "bg-green-500")} />
                          {item.type}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1 space-y-4">
                      <h3 className="font-bold text-xl leading-tight group-hover:text-accent transition-colors">{item.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px]">{item.vendor[0]}</div>
                        <span>{item.vendor}</span>
                        <span className="flex items-center gap-1 ml-auto text-accent">
                          <Star size={12} className="fill-accent" />
                          {item.rating}
                        </span>
                      </div>
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                          <Clock size={12} />
                          {item.delivery}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl text-accent font-display">{formatSats(item.price)}</p>
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Sats</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 space-y-6"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <SearchIcon size={40} className="text-gray-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-display">No services found</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any services matching "{query}". Try adjusting your search or browse our categories.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 pt-8">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchParams({});
                      setSearchInput('');
                    }}
                    className="glass px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
                    <span className="font-bold text-sm">{cat.name}</span>
                    <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

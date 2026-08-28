import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FileItem, CategoryType } from '../types';
import { FileCard } from '../components/FileCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const CATEGORIES: CategoryType[] = ['Apps', 'Games', 'Tools', 'Open Source', 'Templates', 'Documents', 'Other Files'];

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'latest';

  useEffect(() => {
    const fetchAllFiles = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'files'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileItem));
        setFiles(list);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFiles();
  }, []);

  // Filter & Sort Logic
  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory ? file.category === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        file.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popular' || sortBy === 'downloads') {
      return b.downloadCount - a.downloadCount;
    }
    // Default latest
    return b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.() || 0;
  });

  const handleCategoryChange = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat) newParams.set('category', cat);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    setSearchParams(newParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) newParams.set('search', e.target.value);
    else newParams.delete('search');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Explore File Repository</h1>
        <p className="text-sm text-gray-400 mt-1">Browse, filter, and download verified open-source and freeware files.</p>
      </div>

      {/* Controls Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-gray-200 focus:outline-none focus:border-accent-blue"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-blue"
          >
            <option value="latest">Latest Uploads</option>
            <option value="popular">Most Popular</option>
            <option value="downloads">Highest Downloads</option>
          </select>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedCategory 
              ? 'bg-accent-blue text-dark-950 shadow-glow-blue' 
              : 'glass-card text-gray-300 hover:bg-dark-800'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-accent-blue text-dark-950 shadow-glow-blue' 
                : 'glass-card text-gray-300 hover:bg-dark-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="glass-card h-48 rounded-2xl animate-pulse bg-dark-800/50" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-2xl space-y-3">
          <Filter className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No files found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search query or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFiles.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};
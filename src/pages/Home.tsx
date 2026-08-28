import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadCloud, ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FileItem, CategoryType } from '../types';
import { FileCard } from '../components/FileCard';

const CATEGORIES: CategoryType[] = ['Apps', 'Games', 'Tools', 'Open Source', 'Templates', 'Documents', 'Other Files'];

export const Home: React.FC = () => {
  const [featuredFiles, setFeaturedFiles] = useState<FileItem[]>([]);
  const [latestFiles, setLatestFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch Featured Files
        const featuredQuery = query(collection(db, 'files'), where('isFeatured', '==', true), limit(4));
        const featuredSnap = await getDocs(featuredQuery);
        const featuredList = featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileItem));

        // Fetch Latest Files
        const latestQuery = query(collection(db, 'files'), orderBy('createdAt', 'desc'), limit(8));
        const latestSnap = await getDocs(latestQuery);
        const latestList = latestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileItem));

        setFeaturedFiles(featuredList);
        setLatestFiles(latestList);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent-red/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Legal Digital File Repository</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            TYNEX TOP <span className="bg-gradient-to-r from-accent-blue via-indigo-400 to-accent-red bg-clip-text text-transparent">FILE STORE</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Secure, rapid, direct downloads for open-source apps, freeware software, documents, and user-crafted development templates.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/explore"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-cyan-500 text-dark-950 font-bold hover:shadow-glow-blue transition-all flex items-center space-x-2"
            >
              <span>Explore All Files</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Highlights bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 border-t border-white/10 mt-12 text-left">
            <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-accent-blue/10 text-accent-blue"><Zap className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">Direct Downloads</h4>
                <p className="text-xs text-gray-400">Zero redirection or external loops</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-accent-red/10 text-accent-red"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Legal & Safe</h4>
                <p className="text-xs text-gray-400">Verified open-source & freeware</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400"><Globe className="w-5 h-5" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">PWA Ready</h4>
                <p className="text-xs text-gray-400">Installable on Android & Desktop</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
          <span>Categories</span>
          <Link to="/explore" className="text-xs text-accent-blue hover:underline">View All</Link>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/explore?category=${encodeURIComponent(cat)}`}
              className="glass-card glass-card-hover p-4 rounded-xl text-center flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-dark-800 border border-white/10 flex items-center justify-center text-accent-blue group-hover:bg-accent-blue group-hover:text-dark-950 transition-colors">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-300 group-hover:text-white">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Files */}
      {featuredFiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-ping" />
              <span>Featured Files</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Uploads */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Latest Files</h2>
          <Link to="/explore" className="text-xs font-medium text-accent-blue hover:underline">Browse repository</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="glass-card h-48 rounded-2xl animate-pulse bg-dark-800/50" />
            ))}
          </div>
        ) : latestFiles.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl text-gray-400">
            No files available yet. Check back soon or visit the admin panel to upload content.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
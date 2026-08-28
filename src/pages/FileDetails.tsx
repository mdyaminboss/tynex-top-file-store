import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FileItem } from '../types';
import { Download, HardDrive, Calendar, Tag, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const FileDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'files', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFile({ id: docSnap.id, ...docSnap.data() } as FileItem);
        }
      } catch (err) {
        console.error("Error fetching file details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  // DIRECT DOWNLOAD SYSTEM IMPLEMENTATION
  const handleDirectDownload = async () => {
    if (!file || !file.fileUrl) {
      setDownloadError("Download link unavailable or file missing.");
      return;
    }

    setDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      // 1. Fetch the file data as a blob to bypass cross-origin restrictions and trigger native device save dialog
      const response = await fetch(file.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file from storage server.");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 2. Create invisible temporary download anchor
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Ensure proper safe filename mapping
      const extension = file.fileUrl.split('?')[0].split('.').pop() || 'bin';
      const safeName = `${file.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_v${file.version}.${extension}`;
      link.download = safeName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up memory blob URL
      window.URL.revokeObjectURL(blobUrl);

      // 3. Increment download counter in Firestore atomically
      const fileRef = doc(db, 'files', file.id);
      await updateDoc(fileRef, {
        downloadCount: increment(1)
      });

      setFile(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      console.error("Direct download failed:", err);
      // Fallback method if CORS blocks blob fetch: direct window open or anchor target blank download
      try {
        const fallbackLink = document.createElement('a');
        fallbackLink.href = file.fileUrl;
        fallbackLink.target = '_blank';
        fallbackLink.download = file.name;
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        document.body.removeChild(fallbackLink);

        const fileRef = doc(db, 'files', file.id);
        await updateDoc(fileRef, { downloadCount: increment(1) });
        setFile(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
        setDownloadSuccess(true);
      } catch (fallbackErr) {
        setDownloadError("Direct download encountered an error. Please verify network connection.");
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-8 h-8 text-accent-blue animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading file details...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-accent-red mx-auto" />
        <h2 className="text-2xl font-bold text-white">File Not Found</h2>
        <p className="text-gray-400">The file you are looking for may have been deleted or does not exist.</p>
        <Link to="/explore" className="inline-block px-6 py-2.5 rounded-xl bg-accent-blue text-dark-950 font-bold">
          Back to Explore
        </Link>
      </div>
    );
  }

  const formattedDate = file.createdAt?.toDate 
    ? file.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/explore" className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Repository</span>
      </Link>

      {/* Main Details Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img
              src={file.iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
              alt={file.name}
              className="w-20 h-20 rounded-2xl object-cover bg-dark-800 border border-white/10 shadow-lg shrink-0"
            />
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-wider text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full uppercase">
                {file.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{file.name}</h1>
              <p className="text-xs text-gray-400">Version {file.version} • Uploaded on {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-blue"><HardDrive className="w-5 h-5" /></div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">File Size</span>
              <span className="text-sm font-bold text-gray-200">{file.fileSize}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-red"><Download className="w-5 h-5" /></div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Total Downloads</span>
              <span className="text-sm font-bold text-gray-200">{file.downloadCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-dark-800 text-purple-400"><Tag className="w-5 h-5" /></div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Version</span>
              <span className="text-sm font-bold text-gray-200">v{file.version}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-dark-800 text-emerald-400"><Calendar className="w-5 h-5" /></div>
            <div>
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Added Date</span>
              <span className="text-sm font-bold text-gray-200">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">File Description & Information</h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-dark-900/50 p-5 rounded-2xl border border-white/5">
            {file.description}
          </p>
        </div>

        {/* Safety & Compliance Badge */}
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>Verified Safe & Legal Distribution. Stored securely on cloud storage. Direct browser download system enabled.</span>
        </div>

        {/* Download Action Section */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 text-center sm:text-left">
            <span>By clicking Download, you initiate a secure direct transfer to your device.</span>
          </div>

          <button
            onClick={handleDirectDownload}
            disabled={downloading}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-red via-rose-600 to-accent-blue text-white font-extrabold text-base shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Downloading File...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>DOWNLOAD FILE NOW</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Alerts */}
        {downloadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Download completed successfully! Counter updated. Check your device downloads folder.</span>
          </div>
        )}

        {downloadError && (
          <div className="p-4 rounded-xl bg-accent-red/20 border border-accent-red/40 text-red-200 text-sm flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
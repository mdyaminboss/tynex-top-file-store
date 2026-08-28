import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { FileItem, CategoryType } from '../types';
import { Shield, Plus, Trash2, Edit3, LogOut, Upload, Star, CheckCircle, Loader2, FileText, Lock } from 'lucide-react';

const CATEGORIES: CategoryType[] = ['Apps', 'Games', 'Tools', 'Open Source', 'Templates', 'Documents', 'Other Files'];

export const AdminDashboard: React.FC = () => {
  const { currentUser, login, logout } = useAuth();
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('Apps');
  const [formVersion, setFormVersion] = useState('1.0.0');
  const [formFileSize, setFormFileSize] = useState('10 MB');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [existingIconUrl, setExistingIconUrl] = useState('');
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [existingStoragePath, setExistingStoragePath] = useState('');

  const fetchAdminFiles = async () => {
    setLoadingFiles(true);
    try {
      const q = query(collection(db, 'files'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileItem));
      setFiles(list);
    } catch (err) {
      console.error("Error fetching admin files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAdminFiles();
    }
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setLoginError("Invalid credentials or unauthorized access.");
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('Apps');
    setFormVersion('1.0.0');
    setFormFileSize('10 MB');
    setFormIsFeatured(false);
    setIconFile(null);
    setActualFile(null);
    setExistingIconUrl('');
    setExistingFileUrl('');
    setExistingStoragePath('');
    setEditingFileId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (file: FileItem) => {
    setEditingFileId(file.id);
    setFormName(file.name);
    setFormDescription(file.description);
    setFormCategory(file.category);
    setFormVersion(file.version);
    setFormFileSize(file.fileSize);
    setFormIsFeatured(file.isFeatured);
    setExistingIconUrl(file.iconUrl);
    setExistingFileUrl(file.fileUrl);
    setExistingStoragePath(file.storagePath);
    setIconFile(null);
    setActualFile(null);
    setIsModalOpen(true);
  };

  const handleSaveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg('');

    try {
      let iconUrl = existingIconUrl;
      let fileUrl = existingFileUrl;
      let storagePath = existingStoragePath;

      // 1. Upload Icon if new file selected
      if (iconFile) {
        const iconRef = ref(storage, `icons/${Date.now()}_${iconFile.name}`);
        const iconSnap = await uploadBytes(iconRef, iconFile);
        iconUrl = await getDownloadURL(iconSnap.ref);
      }

      // 2. Upload Actual File if new file selected
      if (actualFile) {
        storagePath = `files/${Date.now()}_${actualFile.name}`;
        const fileRef = ref(storage, storagePath);
        const fileSnap = await uploadBytes(fileRef, actualFile);
        fileUrl = await getDownloadURL(fileSnap.ref);
      }

      if (!fileUrl) {
        alert("Please upload the actual distributable file.");
        setActionLoading(false);
        return;
      }

      const fileData = {
        name: formName,
        description: formDescription,
        category: formCategory,
        version: formVersion,
        fileSize: formFileSize,
        isFeatured: formIsFeatured,
        iconUrl: iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        fileUrl,
        storagePath,
        updatedAt: serverTimestamp(),
      };

      if (editingFileId) {
        // Update
        await updateDoc(doc(db, 'files', editingFileId), fileData);
        setSuccessMsg("File updated successfully!");
      } else {
        // Create
        await addDoc(collection(db, 'files'), {
          ...fileData,
          downloadCount: 0,
          createdAt: serverTimestamp(),
        });
        setSuccessMsg("File uploaded successfully!");
      }

      setIsModalOpen(false);
      fetchAdminFiles();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error("Error saving file:", err);
      alert(`Error saving file: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      // Delete storage file if path exists
      if (file.storagePath) {
        try {
          const fileRef = ref(storage, file.storagePath);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn("Could not delete physical storage file:", storageErr);
        }
      }

      // Delete firestore document
      await deleteDoc(doc(db, 'files', file.id));
      setFiles(files.filter(f => f.id !== file.id));
      setSuccessMsg("File deleted successfully.");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error("Error deleting file:", err);
      alert(`Failed to delete file: ${err.message}`);
    }
  };

  // If not logged in, show secure login screen
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="glass-card rounded-3xl p-8 space-y-6 shadow-glow-blue border border-white/10">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mx-auto text-accent-blue">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-xs text-gray-400">Restricted secure entry for authorized file store administrators.</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-accent-red/20 border border-accent-red/40 text-red-200 text-xs text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tynex.store"
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent-blue text-dark-950 font-bold hover:shadow-glow-blue transition-all"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalDownloads = files.reduce((acc, curr) => acc + curr.downloadCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-red/10 border border-accent-red/30 flex items-center justify-center text-accent-red">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Logged in as {currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-accent-blue text-dark-950 font-bold text-sm hover:shadow-glow-blue transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
          <button
            onClick={() => logout()}
            className="px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-gray-300 hover:text-white text-sm transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/45 text-emerald-300 text-sm flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-gray-400 font-semibold uppercase">Total Repository Files</span>
          <h3 className="text-2xl font-extrabold text-white mt-1">{files.length}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-gray-400 font-semibold uppercase">Total Platform Downloads</span>
          <h3 className="text-2xl font-extrabold text-accent-blue mt-1">{totalDownloads}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs text-gray-400 font-semibold uppercase">Featured Files Count</span>
          <h3 className="text-2xl font-extrabold text-accent-red mt-1">{files.filter(f => f.isFeatured).length}</h3>
        </div>
      </div>

      {/* Files Management Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Manage Files</h2>
          <span className="text-xs text-gray-400">{files.length} items total</span>
        </div>

        {loadingFiles ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-accent-blue" />
            <span>Loading store files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No files uploaded yet. Click "Upload New File" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/80 text-gray-400 text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Version / Size</th>
                  <th className="px-6 py-4">Downloads</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={file.iconUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-dark-800 border border-white/10 shrink-0" />
                      <div>
                        <span className="font-bold text-white block truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-gray-500 truncate max-w-xs block">{file.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-full">
                        {file.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>v{file.version}</div>
                      <div className="text-xs text-gray-500">{file.fileSize}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {file.downloadCount}
                    </td>
                    <td className="px-6 py-4">
                      {file.isFeatured ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-accent-red font-semibold bg-accent-red/10 px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-accent-red" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(file)}
                        className="p-2 rounded-lg bg-dark-800 text-gray-300 hover:text-accent-blue hover:bg-dark-700 transition-colors inline-flex items-center"
                        title="Edit File"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file)}
                        className="p-2 rounded-lg bg-dark-800 text-gray-300 hover:text-accent-red hover:bg-dark-700 transition-colors inline-flex items-center"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 my-8 border border-white/15">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingFileId ? 'Edit File Information' : 'Upload New Distributable File'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveFile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. VS Code Extension Template"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as CategoryType)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={formVersion}
                    onChange={e => setFormVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">File Size Label</label>
                  <input
                    type="text"
                    required
                    value={formFileSize}
                    onChange={e => setFormFileSize(e.target.value)}
                    placeholder="15.4 MB"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Provide precise details, license type (MIT, Apache, Freeware), and features..."
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Thumbnail / Icon File (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setIconFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-800 file:text-accent-blue hover:file:bg-dark-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Actual Distributable File {editingFileId ? '(Leave blank to keep current)' : '*'}</label>
                  <input
                    type="file"
                    required={!editingFileId}
                    onChange={e => setActualFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-800 file:text-accent-blue hover:file:bg-dark-700"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formIsFeatured}
                  onChange={e => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-accent-red rounded"
                />
                <label htmlFor="featuredCheck" className="text-sm font-medium text-gray-300">Feature this file on homepage</label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-dark-800 text-gray-300 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-accent-blue text-dark-950 font-bold text-sm hover:shadow-glow-blue transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{editingFileId ? 'Save Changes' : 'Upload & Publish'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
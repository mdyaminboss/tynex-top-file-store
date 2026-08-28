import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Star, HardDrive } from 'lucide-react';
import { FileItem } from '../types';

interface FileCardProps {
  file: FileItem;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      {file.isFeatured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-accent-red to-rose-600 text-[10px] font-bold text-white px-3 py-1 rounded-bl-xl shadow-md uppercase tracking-wider flex items-center space-x-1">
          <Star className="w-3 h-3 fill-white" />
          <span>Featured</span>
        </div>
      )}

      <div>
        <div className="flex items-start space-x-4">
          <img
            src={file.iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
            alt={file.name}
            className="w-14 h-14 rounded-xl object-cover bg-dark-800 border border-white/10 shrink-0 shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-block text-[10px] font-semibold tracking-wider text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full uppercase mb-1">
              {file.category}
            </span>
            <Link to={`/file/${file.id}`}>
              <h3 className="font-bold text-base text-gray-100 truncate hover:text-accent-blue transition-colors">
                {file.name}
              </h3>
            </Link>
            <span className="text-xs text-gray-400">v{file.version}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
          {file.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5 text-gray-500" />
            <span>{file.fileSize}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>{file.downloadCount}</span>
          </span>
        </div>

        <Link
          to={`/file/${file.id}`}
          className="px-3.5 py-1.5 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-semibold hover:bg-accent-blue hover:text-dark-950 transition-all shadow-sm"
        >
          Details
        </Link>
      </div>
    </div>
  );
};
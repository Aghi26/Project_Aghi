import React, { useState } from 'react';
import galeriImages from '@/utils/data/galeri';
import { X } from 'lucide-react';

export default function Galeri() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 py-12 px-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-10">
        Galeri
      </h1>

      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {galeriImages.map((img) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-white rounded-full cursor-pointer p-2 shadow hover:bg-gray-100"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="w-full object-contain rounded-lg"
            />
            <div className="p-4 text-center text-gray-600 text-sm">
              {selectedImage.alt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { news } from '@/utils/data/news';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function NewsList() {
  const categoryColors = {
    // "Theater": "bg-gradient-to-r from-red-500 to-red-400",
    // "Other": "bg-gradient-to-r from-blue-500 to-blue-400",
    // "Comedy": "bg-gradient-to-r from-green-500 to-green-400",
    // "Music": "bg-gradient-to-r from-purple-500 to-purple-400",
    // "Event": "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black"
    "Comedy": "bg-gradient-to-r from-red-500 to-red-400",
    "Concert": "bg-gradient-to-r from-blue-500 to-blue-400",
    "Theater": "bg-gradient-to-r from-green-500 to-green-400",
  };

  return (
    <div className="flex justify-center min-h-screen py-12 px-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-10">
          News
        </h1>

        <div className="space-y-6">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="block bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-200 hover:border-blue-400"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${categoryColors[item.category]}`}>
                  {item.category}
                </span>
                <div className="flex items-center text-gray-500 text-sm gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h2>
              <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{item.konten}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

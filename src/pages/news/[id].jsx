import { useRouter } from 'next/router';
import { news } from '@/utils/data/news';
import Link from 'next/link';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;

  const newsItem = news.find(item => item.id === Number(id));

  if (!newsItem) {
    return <p className="text-center mt-10">Berita tidak ditemukan.</p>;
  }

  const categoryColors = {
    "Comedy": "bg-gradient-to-r from-red-500 to-red-400",
    "Concert": "bg-gradient-to-r from-blue-500 to-blue-400",
    "Theater": "bg-gradient-to-r from-green-500 to-green-400",
  };

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-4xl px-4">
        <Link href="/news" className="inline-flex items-center text-blue-600 font-semibold mb-6">
          ← Kembali ke Daftar Berita
        </Link>

        <div className={`${categoryColors[newsItem.category]} text-white font-bold py-1 px-3 rounded-full text-sm w-fit mb-4`}>
          {newsItem.category}
        </div>

        <h1 className="text-3xl font-bold mb-4">{newsItem.title}</h1>
        <p className="text-gray-500 mb-8">{newsItem.date}</p>

        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{newsItem.konten}</p>
        </div>

        <div className="mt-8">
          <img src={newsItem.gambar} alt={newsItem.title} className="w-full rounded-lg shadow-md" />
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import { getEventStatus } from "@/utils/eventStatus";
import { Calendar, MapPin, Tickets } from "lucide-react";

const categoryColors = {
  Concert: { bg: "bg-blue-100", text: "text-blue-700" },
  Comedy: { bg: "bg-red-100", text: "text-red-700" },
  Theater: { bg: "bg-green-100", text: "text-green-700" },
  Festival: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

export default function EventCard({ event }) {
  if (!event) return null;
  const catColor = categoryColors[event.category] || categoryColors.Concert;
  const isUpcoming = getEventStatus(event) === "upcoming";

  const formatDate = (dateStr) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        {/* Image */}
        <div className="aspect-video bg-gray-200 overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://placehold.co/600x400/2563EB/FFFFFF?text=Event";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <Tickets className="w-12 h-12 text-white/60" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text}`}
            >
              {event.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isUpcoming
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <><span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isUpcoming ? "bg-green-500" : "bg-gray-400"}`} />{isUpcoming ? "Akan Datang" : "Sudah Lewat"}</>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          {/* Info */}
          <div className="space-y-1 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {formatDate(event.date)}
                {event.endDate ? ` - ${formatDate(event.endDate)}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {event.venue}, {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default function StatsCard({ icon, value, label, color = "blue" }) {
  if (!icon || value === undefined) return null;
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
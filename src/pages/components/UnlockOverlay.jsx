export default function UnlockOverlay({ event, onBeli, onClose }) {
  if (!event) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Lock */}
        <div className="text-6xl mb-4">🔒</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Foto Terkunci
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4">
          Beli foto untuk melihat semua foto event ini!
        </p>

        {/* Price */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">Harga per foto</p>
          <p className="text-3xl font-bold text-blue-600">
            Rp {event.photoPrice?.toLocaleString() || "0"}
          </p>
        </div>

        {/* Beli Button */}
        <button
          onClick={onBeli}
          className="btn-primary w-full py-4 text-lg mb-4"
        >
          🛒 Beli Foto
        </button>

        {/* Close hint */}
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Klik di luar untuk tutup
        </button>
      </div>
    </div>
  );
}
export default function WhatsAppButton({ phone, message, label = "📤 Kirim via WhatsApp", className = "" }) {
  const handleClick = () => {
    // Format nomor: pastikan 628xxx (tanpa +, spasi, tanda kurung)
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    
    // Format pesan
    const encodedMessage = encodeURIComponent(message);
    
    // Buat URL WhatsApp
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Redirect ke WhatsApp
    window.open(waUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-whatsapp w-full flex items-center justify-center gap-2 ${className}`}
    >
      {label}
    </button>
  );
}
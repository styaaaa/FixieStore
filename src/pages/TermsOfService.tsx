const TermsOfService = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Ketentuan Layanan</p>
          <h1 className="text-3xl font-bold">Syarat & Ketentuan FixieStore</h1>
          <p className="max-w-3xl text-muted-foreground">
            Membeli di FixieStore berarti Anda setuju dengan kebijakan pemesanan, pembayaran, dan pengiriman kami.
            Kami menjaga keterbukaan untuk memastikan pengalaman berbelanja yang aman dan nyaman.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Pemesanan & Pembayaran</h2>
            <ul className="list-disc space-y-2 pl-4 text-muted-foreground">
              <li>Pemesanan dianggap berhasil setelah pembayaran terkonfirmasi.</li>
              <li>Pembatalan dapat dilakukan sebelum barang dikirim dengan konfirmasi tim support.</li>
              <li>Promo atau voucher berlaku sesuai periode yang tertera.</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Pengiriman</h2>
            <ul className="list-disc space-y-2 pl-4 text-muted-foreground">
              <li>Estimasi pengiriman mengikuti jasa ekspedisi yang dipilih saat checkout.</li>
              <li>Nomor resi dikirim otomatis lewat email setelah pesanan dikirim.</li>
              <li>Kerusakan saat pengiriman akan dibantu klaim asuransi sesuai ketentuan ekspedisi.</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Pengembalian Barang</h2>
            <ul className="list-disc space-y-2 pl-4 text-muted-foreground">
              <li>Pengajuan retur maksimal 7 hari setelah barang diterima.</li>
              <li>Produk harus dalam kondisi asli dan disertai bukti pembelian.</li>
              <li>Biaya kirim retur mengikuti kebijakan yang berlaku per kategori produk.</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Akun & Privasi</h2>
            <ul className="list-disc space-y-2 pl-4 text-muted-foreground">
              <li>Anda bertanggung jawab menjaga kerahasiaan akun dan kata sandi.</li>
              <li>Data pribadi digunakan untuk memproses pesanan dan pengalaman personalisasi.</li>
              <li>Kami tidak membagikan data pelanggan tanpa izin kecuali diwajibkan hukum.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsOfService;

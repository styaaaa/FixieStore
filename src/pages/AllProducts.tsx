import { Link } from "react-router-dom";

const AllProducts = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Katalog Lengkap</p>
          <h1 className="text-3xl font-bold">Semua Produk FixieStore</h1>
          <p className="max-w-3xl text-muted-foreground">
            Jelajahi rangkaian fixie, komponen, dan apparel pilihan. Gunakan filter di halaman utama untuk menyaring
            berdasarkan kategori, brand, atau harga.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
            <li>Mulai dari halaman <Link to="/" className="font-semibold text-primary">Beranda</Link> dan pilih kategori yang Anda inginkan.</li>
            <li>Gunakan kolom pencarian untuk menemukan brand atau model tertentu.</li>
            <li>Tambahkan ke keranjang dan checkout dengan metode pembayaran yang Anda sukai.</li>
          </ol>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {["Frame & Fork", "Wheelset", "Apparel", "Aksesori", "Parts Performance", "Special Edition"].map(
            (item) => (
              <div key={item} className="rounded-lg border bg-muted/30 p-4">
                <h3 className="font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Lihat koleksi terbaru dan stok ready.</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
};

export default AllProducts;

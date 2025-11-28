import { Link } from "react-router-dom";

const NewArrivals = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Koleksi Terbaru</p>
          <h1 className="text-3xl font-bold">New Arrivals</h1>
          <p className="max-w-3xl text-muted-foreground">
            Temukan rilisan terbaru dan edisi terbatas untuk menunjang gaya berkendara urban Anda. Kami memperbarui
            koleksi secara berkala setiap minggu.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Frame Titanium", "Wheelset Aero", "Helm Urban", "Footstrap", "Handlebar Bullhorn", "Lighting"].map(
            (item) => (
              <div key={item} className="rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Tersedia dalam stok terbatas, segera amankan.</p>
              </div>
            )
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Ingin mencoba langsung? Kunjungi showroom atau pesan online melalui halaman <Link to="/" className="font-semibold text-primary">Beranda</Link> untuk
            melihat detail produk dan stok real-time.
          </p>
        </div>
      </div>
    </main>
  );
};

export default NewArrivals;

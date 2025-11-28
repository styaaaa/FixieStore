import { Link } from "react-router-dom";

const Blog = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Insight Komunitas</p>
          <h1 className="text-3xl font-bold">Blog FixieStore</h1>
          <p className="max-w-3xl text-muted-foreground">
            Artikel seputar tips merakit, tren fixed-gear, dan cerita komunitas. Dapatkan inspirasi sebelum menentukan
            komponen berikutnya.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Setup Harian", "Panduan Upgrade", "Event Komunitas", "Perawatan", "Lookbook", "Review Produk"].map(
            (item) => (
              <div key={item} className="rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Baca artikel kurasi tim dan kontributor komunitas.</p>
              </div>
            )
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Ingin berbagi tulisan? Hubungi kami lewat halaman <Link to="/contact" className="font-semibold text-primary">Kontak</Link> dan sertakan draft atau topik yang ingin dibahas.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Blog;

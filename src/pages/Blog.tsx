import { Link } from "react-router-dom";

const Blog = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.18),transparent_42%),radial-gradient(circle_at_60%_80%,rgba(16,185,129,0.15),transparent_40%)]" />
            <div className="relative space-y-4 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>Insight Komunitas</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Good vibes only</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Blog FixieStore</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Tips merakit, tren fixed-gear, sampai cerita jalanan. Semua ditulis santai dengan bahasa anak komunitas.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["Tutorial singkat", "Foto keren", "Playlists ride", "Event recap"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Setup Harian", "Panduan Upgrade", "Event Komunitas", "Perawatan", "Lookbook", "Review Produk"].map((item) => (
            <div
              key={item}
              className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-sky-500/10" />
              <div className="relative space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Bacaan seru</p>
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Baca artikel kurasi tim dan kontributor komunitas.</p>
                <p className="text-sm text-muted-foreground">Baca artikel kurasi tim dan kontributor komunitas.</p>
              </div>
           </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Ingin berbagi tulisan? Hubungi kami lewat halaman <Link to="/contact" className="font-semibold text-primary">Kontak</Link> dan sertakan draft atau topik yang ingin dibahas.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Blog;

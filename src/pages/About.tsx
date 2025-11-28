import { Link } from "react-router-dom";

const About = () => {
  const stacks = [
    {
      title: "Frontend",
      vibe: "Pixel-perfect UI dengan interaksi yang playful",
      highlights: ["React + TypeScript", "Tailwind + Radial gradients", "Micro-interactions untuk UX cepat"],
      tone: "from-primary/20 via-pink-500/10 to-sky-500/10",
    },
    {
      title: "Backend",
      vibe: "Stabil, aman, dan siap scale bareng komunitas",
      highlights: ["Supabase & PostgreSQL", "Realtime API untuk live inventory", "Auth + webhooks buat otomasi order"],
      tone: "from-emerald-500/15 via-primary/15 to-indigo-500/10",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_40%)]" />
            <div className="relative space-y-4 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>About FixieStore</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Built for riders who love good vibes</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Tim kecil, ide besar, energi anak muda</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                FixieStore lahir dari komunitas pesepeda kota yang doyan ngulik gear. Kami nge-build produk digital
                dengan semangat yang sama: cepat, fun, dan selalu mendengar feedback riders.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["UI responsif", "Checkout aman", "Realtime stok", "Konten komunitas"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {stacks.map((stack) => (
            <div
              key={stack.title}
              className={`relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stack.tone}`} />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{stack.title}</span>
                </div>
                <h3 className="text-xl font-bold">{stack.vibe}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {stack.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-primary">★</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">Ping us anytime</p>
              <h2 className="text-2xl font-bold">Kolaborasi atau mau kasih feedback?</h2>
              <p className="text-muted-foreground">
                DM kami soal fitur baru, ide konten, atau masalah teknis. Tim tech & komunitas selalu online.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                Hubungi tim
    
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:border-primary"
              >
                Lihat cerita dev
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;
const brandLogos = [
  { name: "Lader Bikes", src: "/brand-1.png" },
  { name: "Tokyobike", src: "/brand-2.png" },
  { name: "Pasific", src: "/brand-3.png" },
  { name: "State Bicycle", src: "/brand-4.png" },
  { name: "6KU", src: "/brand-5.png" },
  { name: "Aventon", src: "/brand-6.png" },
];


export const BrandPartners = () => {


  return (
    <section className="border-t border-b bg-slate-950 text-slate-50">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Brand Partner
          </p>
         <h2 className="text-3xl md:text-4xl font-semibold">Brand Kece</h2>
          <p className="text-base text-slate-300">
            Brand yang bikin makin kece pas Riding.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brandLogos.map((logo) => (
            <div
              key={logo.name}
              className="flex h-20 w-32 items-center justify-center rounded-xl bg-white/5 p-4 shadow-lg shadow-slate-900/50 ring-1 ring-white/10 backdrop-blur"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="max-h-12 w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

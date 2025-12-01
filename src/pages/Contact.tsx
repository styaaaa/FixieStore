import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function Contact() {
  const [contact, setContact] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!contact.name || !contact.email || !contact.message) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const { error } = await supabase.from("contact_messages").insert({
      name: contact.name,
      email: contact.email,
      message: contact.message,
    });

    if (error) {
      toast.error("Gagal mengirim pesan");
      return;
    }

    toast.success("Pesan terkirim");
    setContact({ name: "", email: "", message: "" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Bantuan Pelanggan</p>
          <h1 className="text-3xl font-bold">Hubungi Tim FixieStore</h1>
          <p className="max-w-2xl text-muted-foreground">
            Kami siap membantu Anda menemukan fixie terbaik, menjawab pertanyaan pesanan,
            dan memberi dukungan purna jual. Silakan pilih cara terbaik untuk terhubung
            dengan kami.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">WhatsApp & Telepon</h2>
            <p className="mt-2 text-muted-foreground">Setiap hari, 09.00 - 21.00 WIB</p>
            <p className="mt-4 text-2xl font-bold text-primary">+62 858-0665-3602</p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Email Support</h2>
            <p className="mt-2 text-muted-foreground">Balasan maksimal 1x24 jam kerja</p>
            <a href="mailto:support@fixiestore.com" className="mt-4 inline-block font-semibold text-primary">
              fixiestore@gmail.com
            </a>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Showroom</h2>
            <p className="mt-2 text-muted-foreground">Senin - Sabtu, 10.00 - 19.00 WIB</p>
            <p className="mt-4 text-primary">Jl. Patua Ginie Pelajar</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Pesan singkat</h2>
          <p className="text-muted-foreground">Tinggalkan pesan Anda, tim kami akan merespons secepatnya.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Nama</span>
              <input
                name="name"
                value={contact.name}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="Nama lengkap"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input
                name="email"
                value={contact.email}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium">Pesan</span>
            <textarea
              name="message"
              value={contact.message}
              onChange={handleChange}
              className="min-h-[140px] w-full rounded-md border bg-background px-3 py-2"
              placeholder="Ceritakan kebutuhan Anda"
            />
          </label>

          <button
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
          >
            Kirim Pesa
          </button>
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>Jika Anda baru saja menyelesaikan pembayaran.</p>
        </div>
      </div>
    </main>
  );
}

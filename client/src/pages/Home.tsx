import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="h-7 w-7 rounded-md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,201,167,0.95) 0%, rgba(0,201,167,0.55) 55%, rgba(10,22,40,0.0) 100%)",
              }}
            />
            <span className="text-[15px] font-semibold tracking-tight text-gray-900">Veridia</span>
          </div>

          <a
            href="/login"
            className="inline-flex h-9 items-center rounded-md px-3 text-[13px] font-medium text-gray-700 hover:text-gray-900"
          >
            Sign in
          </a>
        </div>
      </header>

      <main>
        <section className="bg-[#0A1628]">
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium tracking-wide text-white/75">
                UK CRE diligence, compressed
              </p>

              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-6xl">
                Detect{" "}
                <span className="whitespace-nowrap">
                  <span style={{ color: "#00C9A7" }}>stranded asset risk</span>
                </span>{" "}
                before you commit.
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/75 md:text-[17px]">
                Veridia screens UK commercial properties for MEES compliance, retrofit capex, and regulatory risk. Built for lenders and acquisition teams.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/deal-screen"
                  className="inline-flex h-11 items-center rounded-lg px-6 text-[13px] font-semibold text-white"
                  style={{ backgroundColor: "#00C9A7" }}
                >
                  Screen a Property
                </a>
              </div>

              <div className="mt-12 grid gap-4 border-t border-white/10 pt-10 md:grid-cols-3">
                {[
                  { title: "Fast EPC screening", detail: "Pull rating + certificate context in seconds." },
                  { title: "Flood risk overlay", detail: "Surface exposure alongside compliance risk." },
                  { title: "Retrofit capex estimates", detail: "Model upgrade cost ranges for MEES paths." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#00C9A7" }} />
                      <div className="text-[13px] font-semibold tracking-wide text-white">{item.title}</div>
                    </div>
                    <div className="mt-2 text-[13px] leading-relaxed text-white/65">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

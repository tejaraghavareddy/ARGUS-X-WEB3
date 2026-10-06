import {
  BadgeCheck,
  Blocks,
  GraduationCap,
  Link2,
  Lock,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(198,161,91,0.18),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(27,54,93,0.12),_transparent_36%)]" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700 shadow-sm">
              <ShieldCheck size={14} />
              Soulbound credentials
            </p>
            <h1 className="font-display text-5xl leading-tight text-navy-900 sm:text-6xl">
              SoulCert
            </h1>
            <p className="mt-5 text-2xl font-medium text-navy-800">
              Credentials you can trust. Verify instantly.
            </p>
            <p className="mt-4 max-w-xl text-lg text-navy-700/75">
              Blockchain-backed, non-transferable certificates for the future of education.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/issue"
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-card hover:bg-navy-800"
              >
                Issue a Certificate
              </Link>
              <Link
                to="/verify"
                className="rounded-full border border-navy-900/15 bg-white px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-navy-50"
              >
                Verify a Certificate
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.2rem] bg-gradient-to-br from-gold-300/30 via-white to-navy-200/30 blur-2xl" />
            <article className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/90 p-6 shadow-card cert-grid">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gold-500">Digital Certificate</p>
                  <h2 className="mt-2 font-display text-2xl text-navy-900">Full Stack Web Development</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  <BadgeCheck size={14} />
                  Verified
                </span>
              </div>
              <dl className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-navy-900/8 pb-3">
                  <dt className="text-navy-700/60">Student</dt>
                  <dd className="font-semibold text-navy-900">Rahul Sharma</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-navy-900/8 pb-3">
                  <dt className="text-navy-700/60">Course</dt>
                  <dd className="font-semibold text-navy-900">Full Stack Web Development</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-navy-900/8 pb-3">
                  <dt className="text-navy-700/60">Issuer</dt>
                  <dd className="font-semibold text-navy-900">SoulCert Academy</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-navy-700/60">Certificate ID</dt>
                  <dd className="font-mono text-navy-900">#SC-1042</dd>
                </div>
              </dl>
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-navy-900 px-4 py-3 text-white">
                <div className="flex items-center gap-2 text-sm">
                  <Blocks size={16} className="text-gold-400" />
                  Anchored on Sepolia
                </div>
                <span className="text-xs text-white/70">Soulbound NFT</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Lock,
              title: "Tamper Resistant",
              body: "Certificates are anchored to blockchain infrastructure.",
            },
            {
              icon: ScanSearch,
              title: "Instant Verification",
              body: "Anyone can verify credentials without contacting the issuing institution.",
            },
            {
              icon: GraduationCap,
              title: "Non-Transferable",
              body: "Credentials remain permanently connected to the recipient wallet.",
            },
            {
              icon: Link2,
              title: "IPFS Powered",
              body: "Certificate metadata is stored through decentralized storage.",
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-navy-900/8 bg-white p-6 shadow-glass"
            >
              <feature.icon className="text-gold-500" size={22} />
              <h3 className="mt-4 font-display text-xl text-navy-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-navy-700/75">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-4xl text-navy-900">How it works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-navy-700/70">
          Issue once. Secure on IPFS. Verify from anywhere.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Issue",
              body: "Authorized institutions issue certificates to student wallets.",
            },
            {
              step: "2",
              title: "Secure",
              body: "Certificate metadata is stored on IPFS and referenced on-chain.",
            },
            {
              step: "3",
              title: "Verify",
              body: "Anyone can independently verify the credential.",
            },
          ].map((item) => (
            <article key={item.step} className="rounded-3xl bg-navy-900 p-6 text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 font-semibold text-navy-900">
                {item.step}
              </span>
              <h3 className="mt-4 font-display text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

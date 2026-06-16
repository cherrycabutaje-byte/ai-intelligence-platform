"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

function PricingButton({ plan, label, className }: { plan: string; label: string; className: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = `/signup?plan=${plan}`;
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error: " + (data.error ?? "Something went wrong"));
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : label}
    </button>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">AI</div>
            <span className="font-bold text-white text-lg">Jarvis</span>
            <span className="text-gray-500 text-xs ml-1">by AI Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 font-medium mb-6">
            🤖 AI Business Manager for Creators & Sellers
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Stop Guessing.
            <span className="text-cyan-400"> Start Growing.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Jarvis analyzes your YouTube channel, TikTok, Amazon store, or Etsy shop — then tells you <strong className="text-white">exactly what to do</strong> to grow faster, rank higher, and earn more.
          </p>
          <p className="text-gray-500 text-sm mb-10">
            Replaces TubeBuddy + VidIQ + a content strategist. For less than $20/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors">
              Start Free — No Credit Card
            </Link>
            <a href="#features" className="bg-[#1a1d27] hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-xl text-lg border border-gray-700 transition-colors">
              See How It Works →
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-4">Free forever • No credit card required • Setup in 2 minutes</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-6 border-y border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 text-sm mb-6">Works for creators and sellers on every platform</p>
          <div className="flex flex-wrap justify-center gap-8">
            {["YouTube", "TikTok", "Instagram", "Amazon", "Etsy", "Shopify"].map(p => (
              <span key={p} className="text-gray-400 font-semibold text-sm">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Most creators post and pray.</h2>
          <p className="text-gray-400 text-lg mb-12">They spend hours creating content, then wonder why nobody sees it. The problem is not the content — it is the strategy.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "😤", title: "Wrong Keywords", desc: "Your titles and tags are not matching what people search. Your content is invisible." },
              { icon: "📉", title: "No Strategy", desc: "Posting randomly without a content roadmap. The algorithm ignores inconsistent channels." },
              { icon: "💸", title: "Leaving Money", desc: "No monetization plan. No idea when or how to start earning from your content." },
            ].map(item => (
              <div key={item.title} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-[#0d0f17]" id="features">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Jarvis tells you exactly what to do.</h2>
            <p className="text-gray-400 text-lg">Not just data. Not just suggestions. Step-by-step coaching with copy-paste ready outputs.</p>
          </div>
          <div className="space-y-6">
            {[
              { icon: "🔍", title: "12 Copy-Paste SEO Tags", desc: "Jarvis generates 12 perfectly targeted tags for your exact content — numbered and ready to paste into YouTube, Etsy, or Amazon. No guessing which keywords to use." },
              { icon: "🎬", title: "Hook Script Word For Word", desc: "Get the first 30 seconds of your next video written for you — second by second. 0-3s: pattern interrupt. 3-10s: agitate the pain. 10-30s: promise the transformation." },
              { icon: "🖼️", title: "Thumbnail Formula That Gets Clicks", desc: "Exact thumbnail instructions: background color, text overlay (3 words max), facial expression, and 2 versions to split test. Designed to hit 5-10% CTR." },
              { icon: "📈", title: "12-Week Content Roadmap", desc: "Never run out of content ideas. Jarvis builds a 12-week roadmap around your exact niche and audience — with specific topics for each week." },
              { icon: "📊", title: "Growth Dashboard & Milestones", desc: "Track subscribers, views, and engagement daily. See your progress toward milestones like YouTube Partner Program. Celebrate every win." },
              { icon: "💰", title: "Revenue Projections", desc: "See exactly what you can earn in 30, 60, and 90 days if you follow the plan. AdSense, sponsorships, courses, products — all mapped out." },
            ].map(item => (
              <div key={item.title} className="flex gap-5 bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">How Jarvis Works</h2>
          <p className="text-gray-400 mb-12">From zero to a complete growth strategy in under 60 seconds.</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Add Your Source", desc: "Paste your YouTube channel URL, TikTok, Amazon store, or Etsy shop link." },
              { step: "2", title: "Tell Jarvis Your Goal", desc: "Enter your keyword, target audience, competitors, and current stats." },
              { step: "3", title: "Jarvis Analyzes", desc: "AI analyzes your content and generates a complete growth strategy in seconds." },
              { step: "4", title: "Copy & Implement", desc: "Copy your SEO tags, hook script, thumbnail formula, and action plan. Execute today." },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-4">{item.step}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="px-6 py-20 bg-[#0d0f17]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Replace 4 tools with 1</h2>
            <p className="text-gray-400">For less than the price of any single competitor.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="py-3 px-4 text-cyan-400 font-bold">Jarvis $19</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">TubeBuddy $19</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">VidIQ $49</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Jasper $49</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["YouTube SEO", true, true, true, false],
                  ["TikTok / Instagram", true, false, false, false],
                  ["Amazon / Etsy", true, false, false, false],
                  ["AI Coaching Voice", true, false, false, false],
                  ["Hook Script Writing", true, false, false, true],
                  ["12-Week Roadmap", true, false, false, false],
                  ["Growth Dashboard", true, false, true, false],
                  ["Revenue Projections", true, false, false, false],
                  ["Step-by-Step How-To", true, false, false, false],
                  ["Milestone Tracking", true, false, false, false],
                ].map(([feature, ...checks]) => (
                  <tr key={feature as string} className="border-b border-gray-800/50">
                    <td className="py-3 px-4 text-gray-300">{feature as string}</td>
                    {checks.map((check, i) => (
                      <td key={i} className="py-3 px-4 text-center">
                        {check ? <span className="text-green-400 font-bold">✓</span> : <span className="text-gray-700">✗</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20" id="pricing">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-gray-400 mb-12">Start free. Upgrade when you are ready to grow faster.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Free */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-white text-lg mb-1">Free</h3>
              <p className="text-gray-400 text-sm mb-4">Try Jarvis risk-free</p>
              <div className="text-3xl font-bold text-white mb-6">$0<span className="text-gray-500 text-base font-normal">/month</span></div>
              <ul className="space-y-2 mb-8">
                {["1 source", "3 analyses per month", "Basic SEO tags", "Content gap analysis", "Limited action plan"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#1a1d27] border-2 border-cyan-500 rounded-2xl p-6 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Pro</h3>
              <p className="text-gray-400 text-sm mb-4">For serious creators & sellers</p>
              <div className="text-3xl font-bold text-white mb-1">$19<span className="text-gray-500 text-base font-normal">/month</span></div>
              <p className="text-cyan-400 text-xs mb-6">or $190/year (save 2 months)</p>
              <ul className="space-y-2 mb-8">
                {["5 sources", "Unlimited analyses", "12 copy-paste SEO tags", "Hook script word for word", "Thumbnail formula", "12-week content roadmap", "Growth dashboard + charts", "Milestone tracker", "Revenue projections", "All copy buttons", "Email support"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-cyan-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <PricingButton plan="pro" label="Start Pro Free Trial" className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-3 rounded-xl text-sm transition-colors disabled:opacity-50" />
            </div>

            {/* Agency */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-white text-lg mb-1">Agency</h3>
              <p className="text-gray-400 text-sm mb-4">For agencies and power users</p>
              <div className="text-3xl font-bold text-white mb-6">$49<span className="text-gray-500 text-base font-normal">/month</span></div>
              <ul className="space-y-2 mb-8">
                {["Unlimited sources", "Unlimited analyses", "Everything in Pro", "Multiple client accounts", "Priority analysis", "White label reports", "API access", "Priority support"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <PricingButton plan="agency" label="Get Agency Plan" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors disabled:opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-[#0d0f17]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What platforms does Jarvis support?", a: "Jarvis works for YouTube, TikTok, Instagram, Amazon, Etsy, and Shopify. More platforms coming soon." },
              { q: "Do I need technical knowledge to use Jarvis?", a: "No. Jarvis is built for creators and sellers, not developers. Everything is copy-paste ready with step-by-step instructions." },
              { q: "How is Jarvis different from TubeBuddy or VidIQ?", a: "TubeBuddy and VidIQ only work for YouTube and give you data. Jarvis works for all platforms, speaks like a coach, writes your hook scripts, builds your roadmap, and teaches you exactly HOW to implement every recommendation." },
              { q: "How long does an analysis take?", a: "About 15-30 seconds. Jarvis analyzes your content and generates a complete growth strategy including SEO tags, hook script, thumbnail formula, 12-week roadmap, and revenue projections." },
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments. Cancel anytime from your account settings." },
              { q: "Is there a free trial?", a: "Yes! The Free plan lets you analyze 1 source 3 times per month — forever. No credit card required." },
            ].map(item => (
              <div key={item.q} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">Stop guessing. Start growing.</h2>
          <p className="text-gray-400 text-lg mb-8">Join creators and sellers using Jarvis to grow faster, rank higher, and earn more — starting today.</p>
          <Link href="/signup" className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-colors">
            Start Free — No Credit Card
          </Link>
          <p className="text-gray-600 text-sm mt-4">Free forever • Setup in 2 minutes • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-black font-bold text-xs">AI</div>
            <span className="text-gray-400 text-sm">Jarvis by AI Intelligence Platform</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="text-gray-500 hover:text-white text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-gray-500 hover:text-white text-sm transition-colors">Pricing</a>
            <Link href="/login" className="text-gray-500 hover:text-white text-sm transition-colors">Login</Link>
            <Link href="/signup" className="text-gray-500 hover:text-white text-sm transition-colors">Sign Up</Link>
          </div>
          <p className="text-gray-600 text-xs">© 2026 AI Intelligence Platform. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}


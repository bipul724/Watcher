import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Eye, Github } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function PricingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const plans = [
    {
      name: "Starter",
      description: "Perfect for trying Watcher",
      price: "Free",
      period: "Forever",
      badge: "Popular",
      features: [
        "Up to 5 repositories",
        "Basic bug detection",
        "Weekly reports",
        "Community support",
        "Auto PR creation",
        "Public repositories only",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      description: "For growing teams",
      price: "$29",
      period: "per month",
      badge: "Most Popular",
      features: [
        "Unlimited repositories",
        "Advanced bug detection",
        "Real-time notifications",
        "Priority email support",
        "Auto PR creation",
        "Private repositories",
        "Custom rules & filters",
        "Team collaboration",
        "Weekly analytics",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: "Custom",
      period: "per month",
      badge: null,
      features: [
        "Everything in Professional",
        "Unlimited everything",
        "24/7 phone & email support",
        "Custom integration",
        "SSO & advanced security",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom bug detection models",
        "Audit logs & compliance",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes! You can change your plan at any time. Changes take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "Absolutely. Start a 14-day free trial of any paid plan with your full GitHub integration.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data is yours. You can export all your repositories, PRs, and analytics data at any time before canceling.",
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer: "Yes! Pay annually and save 20% on Professional and Enterprise plans.",
    },
    {
      question: "Is there a limit to how many bugs I can detect?",
      answer: "No limits! Detect and fix as many bugs as you need. It's unlimited across all plans.",
    },
    {
      question: "Do you offer educational or open source discounts?",
      answer: "Yes, open source projects get Professional plan features for free. Email us for educational discounts.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0b1c30] font-sans selection:bg-[#4b41e1]/20">
      {/* Navigation */}
      <nav className="border-b border-[#e5eeff] bg-white relative z-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#4b41e1]" />
              <span className="text-xl font-bold tracking-tight">Watcher</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="/#solutions" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Solutions</a>
              <a href="/#documentation" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Documentation</a>
              <Link href="/pricing" className="text-sm font-medium text-[#4b41e1] hover:text-[#0b1c30] transition-colors">Pricing</Link>
              <a href="/#enterprise" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Enterprise</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-[#0b1c30] hover:bg-[#131b2e] text-white text-sm font-medium h-9 px-4 rounded-md">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button className="bg-[#0b1c30] hover:bg-[#131b2e] text-white text-sm font-medium h-9 px-4 rounded-md">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-12 text-center max-w-[1440px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] text-[#4b41e1] rounded-full border border-[#dce9ff] mb-8">
          <div className="w-2 h-2 rounded-full bg-[#4b41e1]"></div>
          <span className="text-[10px] font-bold tracking-widest uppercase">Pricing Plans</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-[#45464d] max-w-2xl mx-auto mb-10 leading-relaxed">
          Start free. Scale as you grow. No hidden fees.
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="text-sm text-[#45464d] font-medium">Monthly billing</span>
          <div className="relative inline-flex items-center bg-[#f8f9ff] rounded-full p-1 border border-[#e5eeff]">
            <button className="px-4 py-2 rounded-full bg-white text-[#0b1c30] shadow-sm border border-[#e5eeff] text-sm font-semibold transition-all">Monthly</button>
            <button className="px-4 py-2 text-sm text-[#76777d] font-medium hover:text-[#0b1c30] transition-colors">Annual</button>
          </div>
          <span className="text-sm text-[#4b41e1] font-bold">Save 20%</span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6 lg:px-12 bg-[#f8f9ff] border-y border-[#e5eeff]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border bg-white p-8 transition-all ${
                  plan.highlighted
                    ? "border-[#4b41e1] shadow-[0px_8px_30px_rgba(75,65,225,0.12)] transform md:-translate-y-2"
                    : "border-[#e5eeff] shadow-[0px_4px_20px_rgba(11,28,48,0.02)] hover:border-[#c6c6cd]"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-6 px-4 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full ${plan.highlighted ? 'bg-[#4b41e1] text-white' : 'bg-[#e5eeff] text-[#0b1c30]'}`}>
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-2xl font-bold tracking-tight text-[#0b1c30] mb-2">{plan.name}</h3>
                <p className="text-[#76777d] text-sm mb-6 h-10">{plan.description}</p>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-[#0b1c30]">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-[#76777d] font-medium">{plan.period}</span>}
                </div>

                <Button
                  className={`w-full mb-8 h-12 text-base font-semibold rounded-md ${
                    plan.highlighted
                      ? "bg-[#4b41e1] hover:bg-[#3930d8] text-white"
                      : "bg-white border border-[#c6c6cd] text-[#0b1c30] hover:bg-[#f8f9ff]"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta} {plan.highlighted && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-4">What's included</div>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlighted ? 'bg-[#eff4ff]' : 'bg-[#f8f9ff]'}`}>
                        <Check className={`w-3.5 h-3.5 ${plan.highlighted ? 'text-[#4b41e1]' : 'text-[#0b1c30]'}`} />
                      </div>
                      <span className="text-sm text-[#45464d] font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-[#0b1c30]">Feature Comparison</h2>
            <p className="text-[#45464d] text-lg">Detailed breakdown of what's included in every tier.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e5eeff]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#e5eeff]">
                  <th className="py-4 px-6 font-bold text-[#0b1c30] w-1/3">Feature</th>
                  <th className="py-4 px-6 font-bold text-[#0b1c30] text-center w-2/9">Starter</th>
                  <th className="py-4 px-6 font-bold text-[#0b1c30] text-center w-2/9">Professional</th>
                  <th className="py-4 px-6 font-bold text-[#0b1c30] text-center w-2/9">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff]">
                {[
                  { feature: "Repositories", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Bug Detection", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
                  { feature: "Auto PR Creation", starter: "Yes", pro: "Yes", enterprise: "Yes" },
                  { feature: "Real-time Alerts", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Private Repos", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Team Members", starter: "1", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Custom Rules", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "API Access", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Support", starter: "Community", pro: "Email", enterprise: "24/7 Phone" },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-[#f8f9ff]/50"}>
                    <td className="py-4 px-6 font-medium text-[#0b1c30]">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-[#76777d]">{row.starter}</td>
                    <td className="py-4 px-6 text-center text-sm font-bold text-[#4b41e1]">{row.pro}</td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-[#0b1c30]">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 lg:px-12 bg-[#f8f9ff] border-y border-[#e5eeff]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-[#0b1c30]">Frequently Asked Questions</h2>
            <p className="text-[#45464d] text-lg">Everything you need to know about Watcher's pricing.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#e5eeff] rounded-lg p-6 shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
                <h3 className="text-lg font-bold mb-2 text-[#0b1c30]">{faq.question}</h3>
                <p className="text-[#45464d] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight text-[#0b1c30]">Ready to Start?</h2>
          <p className="text-lg text-[#45464d] mb-10 leading-relaxed">
            Choose your plan and connect your GitHub repositories in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-[#4b41e1] hover:bg-[#3930d8] text-white px-8 h-14 text-base font-semibold w-full sm:w-auto flex items-center justify-center gap-2 rounded-md shadow-[0px_4px_14px_rgba(75,65,225,0.25)]">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="bg-white border-[#c6c6cd] text-[#0b1c30] hover:bg-[#f8f9ff] px-8 h-14 text-base font-semibold w-full sm:w-auto rounded-md">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-[#76777d] mt-6 font-medium">
            No credit card required. Start with Starter plan free forever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5eeff] bg-white pt-16 pb-8 px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Eye className="w-6 h-6 text-[#4b41e1]" />
                <span className="text-2xl font-bold tracking-tight text-[#0b1c30]">Watcher</span>
              </Link>
              <p className="text-[#45464d] mb-6 max-w-sm leading-relaxed">
                The autonomous AI agent that detects technical debt, catches bugs, and raises fixes directly to your repositories.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[#f8f9ff] border border-[#e5eeff] flex items-center justify-center text-[#45464d] hover:text-[#4b41e1] hover:border-[#4b41e1] transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#0b1c30] mb-6 uppercase tracking-wider text-xs">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-[#45464d]">
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Integrations</a></li>
                <li><a href="#" className="text-[#4b41e1] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#0b1c30] mb-6 uppercase tracking-wider text-xs">Resources</h4>
              <ul className="space-y-4 text-sm font-medium text-[#45464d]">
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#0b1c30] mb-6 uppercase tracking-wider text-xs">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-[#45464d]">
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#4b41e1] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#e5eeff] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#76777d] font-medium">
            <div>© {new Date().getFullYear()} Watcher AI. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

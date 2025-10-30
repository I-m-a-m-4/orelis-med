'use client';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Footer } from '@/components/layout/footer';
import { OrelisLogo } from '@/components/layout/orelis-logo';
import { Button } from '@/components/ui/button';
import { AnimatedLegalBackground } from '@/components/layout/animated-legal-background';

const AnimatedHamburgerIcon = ({ open }: { open: boolean }) => (
  <div className="w-6 h-6 flex flex-col justify-around">
    <div
      className={`bg-white h-0.5 w-full transform transition-transform duration-300 ${
        open ? 'rotate-45 translate-y-[5px]' : ''
      }`}
    />
    <div
      className={`bg-white h-0.5 w-full transform transition-transform duration-300 ${
        open ? '-rotate-45 -translate-y-[5px]' : ''
      }`}
    />
  </div>
);

export default function TermsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
  ];

  return (
    <div className="bg-gradient-to-br from-black via-zinc-900 to-black text-zinc-300 selection:bg-zinc-700 selection:text-white">
      <header className="fixed top-0 z-50 w-full bg-black/60 backdrop-blur-lg border-b border-dashed border-white/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="inline-flex items-center justify-center">
                 <OrelisLogo />
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`transition hover:text-white hover:underline ${pathname === link.href ? 'nav-link-active' : ''}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
                <Link href="/login" className="px-4 py-2 text-sm text-zinc-300 transition hover:text-white">
                    Login
                </Link>
                <Button asChild className="contact-button">
                  <Link href="/signup">Sign Up</Link>
                </Button>
            </div>

            <button
              id="mobileMenuBtn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatedHamburgerIcon open={mobileMenuOpen} />
            </button>
          </div>
          {mobileMenuOpen && (
            <div id="mobileMenu" className="flex flex-col gap-4 py-4 md:hidden">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`text-zinc-300 transition hover:text-white hover:underline ${pathname === link.href ? 'nav-link-active' : ''}`}>
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="contact-button mt-2">
                Login
              </Link>
              <Button asChild className="contact-button w-full justify-center">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="relative pt-16 overflow-hidden">
        <AnimatedLegalBackground />
        <div className="relative z-10">
            <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-semibold my-2">
                <span className="legal-word" style={{animationDelay: '100ms'}}>Terms</span>{' '}
                <span className="legal-word" style={{animationDelay: '300ms'}}>of</span>{' '}
                <span className="legal-word" style={{animationDelay: '500ms'}}>Service</span>
                </h1>
                <p className="font-mono my-2 text-lg sm:text-xl text-zinc-400 opacity-80 legal-word" style={{animationDelay: '700ms'}}>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            </section>

            <section className="py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 prose prose-invert prose-lg prose-headings:font-headline prose-headings:font-semibold prose-headings:text-primary prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:text-zinc-400 prose-p:leading-relaxed prose-h2:mb-4 prose-h2:mt-12 prose-h2:text-3xl">
                <h2>1. Agreement to Terms</h2>
                <p>
                By accessing or using our services, you agree to be bound by these <u>Terms of Service</u> and all applicable laws and regulations. If you do not agree to these terms, you are prohibited from using the services. The materials contained in this service are protected by applicable copyright and trademark law.
                </p>

                <h2 className="mt-12">2. Description of Service</h2>
                <p>
                Orelis provides a clinic management software platform that includes features such as patient record management, appointment scheduling, and AI-powered reminders (the "Service"). You agree to use the Service only for lawful purposes and in compliance with all applicable laws.
                </p>

                <h2 className="mt-12">3. User Accounts</h2>
                <p>
                You are responsible for <u>safeguarding the password</u> that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any <u>breach of security or unauthorized use</u> of your account.
                </p>

                <h2 className="mt-12">4. Content</h2>
                <p>
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). <u>You are responsible for the Content</u> that you post on or through the Service, including its legality, reliability, and appropriateness. By posting Content, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.
                </p>
                
                <h2 className="mt-12">5. Subscriptions</h2>
                <p>
                Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a subscription. At the end of each Billing Cycle, your Subscription will <u>automatically renew</u> under the exact same conditions unless you cancel it or Orelis cancels it.
                </p>

                <h2 className="mt-12">6. Termination</h2>
                <p>
                We may terminate or suspend your account and bar access to the Service <u>immediately, without prior notice or liability</u>, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the Service.
                </p>

                <h2 className="mt-12">7. Limitation of Liability</h2>
                <p>
                In no event shall Orelis, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                </p>
                
                <h2 className="mt-12">8. Governing Law</h2>
                <p>
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is established, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
                
                <h2 className="mt-12">9. Changes</h2>
                <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least <u>30 days' notice</u> prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>

                <h2 className="mt-12">Contact Us</h2>
                <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:legal@orelis.com">legal@orelis.com</a>.
                </p>
            </div>
            </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

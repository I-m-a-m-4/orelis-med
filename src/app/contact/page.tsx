
'use client';
import { Menu, Mail, Phone, MapPin, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Footer } from '@/components/layout/footer';
import { OrelisLogo } from '@/components/layout/orelis-logo';
import { ContactForm } from '@/components/contact-form';
import { Button } from '@/components/ui/button';

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

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
  ];

  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }, []);

  const contactOptions = [
      { id: 'form', label: 'General Inquiry', icon: Mail },
      { id: 'sales', label: 'Sales & Demos', icon: Phone },
      { id: 'support', label: 'Support', icon: Phone },
      { id: 'location', label: 'Our Office', icon: MapPin },
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-white overflow-x-hidden">
      
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

      <section className="relative min-h-screen grid noisy-bg place-content-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8">
            <div className="relative col-span-full flex flex-col lg:col-span-5">
                <div className="flex flex-col gap-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-zinc-800/40 ring-1 ring-inset ring-zinc-700/40 rounded-full text-sm font-medium text-zinc-300 w-fit">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Contact Us
                    </div>
                    <h1 className="text-4xl md:text-5xl font-headline font-semibold tracking-tight text-white text-balance">
                        Let's build the future of healthcare, together.
                    </h1>
                    <p className="text-lg text-zinc-400 text-balance">
                        Whether you're interested in a demo, have a question about pricing, or want to explore a partnership, we're here to talk.
                    </p>
                </div>
                <div className="mt-auto pt-12">
                    <ul className="flex flex-col gap-1.5">
                        {contactOptions.map(option => (
                            <li key={option.id}>
                                <button
                                    onClick={() => setActiveTab(option.id)}
                                    className={`w-full text-left p-3 rounded-md transition-colors duration-200 text-zinc-400 hover:bg-white/5 ${activeTab === option.id ? '!text-primary' : ''}`}>
                                <span className="font-mono text-sm uppercase flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full transition-colors ${activeTab === option.id ? 'bg-primary' : 'bg-zinc-600'}`}></span>
                                    {option.label}
                                </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="relative flex items-center justify-center pt-16 lg:col-span-7 lg:pt-0">
                <div className="relative w-full max-w-2xl">
                    {contactOptions.map(option => (
                        <div key={option.id} className={`transition-all duration-500 ease-in-out ${activeTab === option.id ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-0'}`}>
                            {option.id === 'form' && (
                                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-dashed border-zinc-800/80 backdrop-blur-sm">
                                    <h2 className="text-2xl font-headline font-semibold text-white mb-6">Send us a Message</h2>
                                    <ContactForm />
                                </div>
                            )}
                            {option.id === 'sales' && (
                                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-dashed border-zinc-800/80 backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-white font-headline">Sales & Demos</h3>
                                            <p className="text-zinc-400 mt-2">Interested in seeing Orelis in action? Let's talk.</p>
                                            <p className="text-lg text-white mt-4 font-medium"><a href="mailto:sales@orelis.com" className="hover:text-primary transition-colors">sales@orelis.com</a></p>
                                            <Button asChild className="mt-6">
                                                <Link href="#">Schedule a Demo <ArrowRight /></Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {option.id === 'support' && (
                                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-dashed border-zinc-800/80 backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-white font-headline">Technical Support</h3>
                                            <p className="text-zinc-400 mt-2">Need help with your account? Our team is here for you.</p>
                                            <p className="text-lg text-white mt-4 font-medium"><a href="mailto:support@orelis.com" className="hover:text-primary transition-colors">support@orelis.com</a></p>
                                            <Button asChild className="mt-6" variant="secondary">
                                                <Link href="#">Visit Help Center <ArrowRight /></Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {option.id === 'location' && (
                                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-dashed border-zinc-800/80 backdrop-blur-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                        <h3 className="text-2xl font-semibold text-white font-headline">Our Office</h3>
                                        <p className="text-zinc-300 mt-4 text-lg leading-relaxed">123 Health Tech Ave, Suite 100<br/>San Francisco, CA 94107</p>
                                        <p className="text-zinc-400 mt-2 text-sm">Visits are by appointment only.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>
      </section>

      <Footer />
    </div>
  );
}

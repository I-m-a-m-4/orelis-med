
'use client';
import { Menu, ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { Footer } from '@/components/layout/footer';
import { OrelisLogo } from '@/components/layout/orelis-logo';
import useEmblaCarousel from 'embla-carousel-react';
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

const blogPosts = [
  {
    id: 1,
    category: 'Technology',
    title: 'The Future of AI in Healthcare: Predictive Analytics',
    excerpt: 'Explore how artificial intelligence is revolutionizing patient outcomes through predictive modeling and data-driven insights.',
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1600&auto=format&fit=crop',
    author: 'Dr. Evelyn Reed',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc2MTE0NzUzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    date: 'Oct 15, 2024',
    readTime: '7 min read',
  },
  {
    id: 2,
    category: 'Patient Care',
    title: 'Streamlining Clinic Workflows for Better Patient Engagement',
    excerpt: 'Discover practical strategies and tools to optimize your clinic’s operations, reduce wait times, and enhance the patient experience.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1600&auto=format&fit=crop',
    author: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=320&auto=format&fit=crop',
    date: 'Oct 10, 2024',
    readTime: '5 min read',
  },
  {
    id: 3,
    category: 'Data Security',
    title: 'HIPAA Compliance in the Digital Age: Protecting Patient Data',
    excerpt: 'A deep dive into the best practices for securing patient information and ensuring your clinic meets all regulatory requirements.',
    imageUrl: 'https://images.unsplash.com/photo-1550684376-ef16af215985?q=80&w=1600&auto=format&fit=crop',
    author: 'David Park',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=320&auto=format&fit=crop',
    date: 'Oct 05, 2024',
    readTime: '9 min read',
  },
  {
    id: 4,
    category: 'Innovation',
    title: 'Orelis Case Study: How We Reduced No-Shows by 40%',
    excerpt: 'Learn how our AI-powered reminder system helped a multi-location clinic dramatically decrease missed appointments.',
    imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1600&auto=format&fit=crop',
    author: 'Dr. Emily Roberts',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=320&auto=format&fit=crop',
    date: 'Sep 28, 2024',
    readTime: '6 min read',
  },
];

const jobOpenings = [
  {
    category: 'Engineering',
    title: 'Health AI Engineer',
    location: 'San Francisco, CA',
    type: 'Full time',
    href: '#'
  },
  {
    category: 'Operations',
    title: 'Clinical Operations Specialist',
    location: 'San Francisco, CA',
    type: 'Full time',
    href: '#'
  },
  {
    category: 'Engineering',
    title: 'Senior Frontend Engineer (Health Tech)',
    location: 'San Francisco, CA',
    type: 'Full time',
    href: '#'
  },
  {
    category: 'Engineering',
    title: 'Fullstack Engineer (EHR/EMR Focus)',
    location: 'San Francisco, CA',
    type: 'Full time',
    href: '#'
  },
  {
    category: 'Sales',
    title: 'Clinic Success Manager',
    location: 'San Francisco, CA or New York, NY',
    type: 'Full time',
    href: '#'
  },
];


const BlogCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi]);

    return (
        <section className="relative noisy-bg border-zinc-800/50 border-dashed border p-8 rounded-lg">
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold my-4 font-headline">From the Orelis Team</h2>
                <p className="font-sans my-2 text-lg sm:text-xl text-zinc-300 opacity-80">
                Latest insights, case studies, and innovations in healthcare technology.
                </p>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                    {blogPosts.map((post) => (
                        <div key={post.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4" >
                            <a href="#" className="h-full block border border-dashed border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50 hover:border-primary/50 transition-all duration-300 group">
                                <div className="flex flex-col h-full">
                                    <div className="overflow-hidden relative z-10">
                                        <Image
                                            alt={post.title}
                                            src={post.imageUrl}
                                            width={800}
                                            height={444}
                                            className="mb-0 object-cover self-center w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-0 right-0 m-3 rounded-lg px-2 py-1 bg-black/50 backdrop-blur-sm">
                                            <p className="font-sans text-xs text-white">{post.category}</p>
                                        </div>
                                    </div>
                                    <div className="relative flex-grow flex flex-col justify-between p-4 md:p-6">
                                        <div className="flex flex-col gap-2 mb-4">
                                            <h3 className="font-sans text-xl font-medium text-white">{post.title}</h3>
                                            <p className="font-sans text-base relative text-zinc-400">{post.excerpt}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Image src={post.authorAvatar} alt={post.author} width={40} height={40} className="rounded-full object-cover" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{post.author}</p>
                                                <p className="text-xs text-zinc-400">{post.date} &middot; {post.readTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center gap-5 mt-8 md:mt-10">
                <button onClick={scrollPrev} className="p-2 rounded-full aspect-square transition-all bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-white ring-1 ring-zinc-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </button>
                <button onClick={scrollNext} className="p-2 rounded-full aspect-square transition-all bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-white ring-1 ring-zinc-800">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </button>
            </div>
        </section>
    );
};

export function BlogClientPage() {
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
    <div className="bg-black text-white selection:bg-zinc-700 selection:text-white">
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

      <main className="pt-16">
        <section className="py-24 sm:py-32 noisy-bg">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold my-2 group font-headline">
              The Orelis Blog
            </h1>
            <p className="font-sans my-2 text-lg sm:text-xl text-zinc-300 opacity-80">
              News, updates, and stories on the future of patient care.
            </p>
          </div>
        </section>

        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <BlogCarousel />
        </div>

        <section className="relative mx-auto my-20 grid h-auto w-full max-w-7xl auto-rows-max grid-cols-4 gap-x-4 bg-transparent px-4 first:mt-4 lg:my-32 lg:grid-cols-12 lg:gap-x-6 lg:px-8">
          <div className="col-span-full border-t border-dashed border-zinc-800 pt-4">
            <div className="flex w-full justify-between md:items-start">
              <div className="inline-flex items-center gap-3 font-mono text-[14px] uppercase leading-[100%] tracking-[-0.0175rem]">
                <div className="size-2 transform-gpu rounded-full border border-primary bg-primary/50" />
                <p className="whitespace-nowrap font-mono text-[12px] uppercase leading-[100%] tracking-[-0.015rem] text-zinc-400">Job Openings</p>
              </div>
              <Link href="#" className="group relative hidden h-[25px] w-max cursor-pointer items-center justify-center overflow-clip rounded-sm border border-zinc-700 bg-zinc-950 px-3 text-white transition-colors duration-150 hover:bg-zinc-800 focus-visible:bg-zinc-800 focus-visible:outline-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex">
                <span className="relative z-10 flex items-center gap-1 uppercase">
                  <p className="font-mono text-[12px] uppercase leading-[100%] tracking-[-0.015rem]">See all</p>
                  <ArrowRight className="size-3" />
                </span>
                <div className="pointer-events-none absolute inset-0 opacity-0 will-change-transform group-hover:animate-delayedFadeIn group-focus-visible:animate-delayedFadeIn">
                  <div className="paused absolute inset-0 animate-slidePattern opacity-100 group-hover:running group-focus-visible:running" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0px, transparent 2px, hsl(var(--primary) / 0.5) 2px, hsl(var(--primary) / 0.5) 3px, transparent 3px, transparent 5px)", backgroundSize: "7.07px 7.07px" }} />
                </div>
              </Link>
            </div>
            <div className="flex flex-col gap-y-6">
              <h2 className="pt-5 font-normal text-foreground text-[26px] leading-[100%] tracking-[-0.0325rem] lg:text-[36px] lg:tracking-[-0.045rem]">Join us</h2>
              <Link href="#" className="group relative mt-4 inline-flex h-[25px] w-max cursor-pointer items-center justify-center overflow-clip rounded-sm border border-zinc-700 bg-zinc-950 px-3 text-white transition-colors duration-150 hover:bg-zinc-800 focus-visible:bg-zinc-800 focus-visible:outline-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 md:hidden">
                <span className="relative z-10 flex items-center gap-1 uppercase">
                  <p className="font-mono text-[12px] uppercase leading-[100%] tracking-[-0.015rem]">See all</p>
                  <ArrowRight className="size-3" />
                </span>
                <div className="pointer-events-none absolute inset-0 opacity-0 will-change-transform group-hover:animate-delayedFadeIn group-focus-visible:animate-delayedFadeIn">
                  <div className="paused absolute inset-0 animate-slidePattern opacity-100 group-hover:running group-focus-visible:running" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0px, transparent 2px, hsl(var(--primary) / 0.5) 2px, hsl(var(--primary) / 0.5) 3px, transparent 3px, transparent 5px)", backgroundSize: "7.07px 7.07px" }} />
                </div>
              </Link>
            </div>
          </div>
          <ul className="col-span-full mt-7 flex flex-col lg:mt-20">
            {jobOpenings.map((job) => (
              <li key={job.title} className="last:[&>a]:border-b-zinc-800 last:[&>a]:hover:border-b-primary hover:[&_li_a]:border-t-transparent [&:has(+li:hover)>a]:border-b-transparent">
                <Link href={job.href} className="group relative -mb-px grid gap-4 border-b border-t border-dashed border-b-transparent border-t-zinc-800 py-4 duration-0 hover:z-10 hover:border-t-primary hover:border-b-primary md:grid-cols-[150px_1fr_auto] md:gap-12 lg:py-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="grid h-5 w-fit place-content-center rounded-sm border border-zinc-700 bg-zinc-950 px-1">
                      <p className="font-mono text-[12px] uppercase leading-[100%] tracking-[-0.015rem] text-zinc-300">{job.category}</p>
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-[14px] leading-[120%] tracking-[-0.0175rem] text-foreground transition-colors duration-200 group-hover:text-primary lg:text-[16px] lg:tracking-[-0.02rem]">{job.title}</p>
                    <p className="font-mono text-[14px] leading-[120%] tracking-[-0.0175rem] text-zinc-500 transition-colors duration-200 group-hover:text-zinc-300 lg:text-[16px] lg:tracking-[-0.02rem]">{job.location} - {job.type}</p>
                  </div>
                  <div className="pointer-events-none relative hidden h-[25px] w-max cursor-pointer items-center justify-center overflow-clip rounded-sm border border-transparent bg-zinc-950 px-3 text-white transition-colors duration-150 group-hover:bg-zinc-800 group-hover:text-white md:ml-auto md:inline-flex">
                    <span className="relative z-10 flex items-center gap-1 uppercase">
                      <p className="font-mono text-[12px] uppercase leading-[100%] tracking-[-0.015rem]">Apply</p>
                      <ArrowRight className="size-3" />
                    </span>
                     <div className="pointer-events-none absolute inset-0 opacity-0 will-change-transform group-hover:animate-delayedFadeIn">
                        <div className="paused absolute inset-0 animate-slidePattern opacity-100 group-hover:running" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0px, transparent 2px, hsl(var(--primary) / 0.5) 2px, hsl(var(--primary) / 0.5) 3px, transparent 3px, transparent 5px)", backgroundSize: "7.07px 7.07px" }} />
                      </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </main>
      <Footer />
    </div>
  );
}

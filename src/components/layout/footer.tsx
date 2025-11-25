
import {
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OrelisLogo } from './orelis-logo';


export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative mt-6 overflow-hidden border border-dashed border-white/20 p-8 sm:p-12 noisy-bg">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_50%_-10%,rgba(16,185,129,0.25),transparent),radial-gradient(1200px_600px_at_50%_120%,rgba(59,130,246,0.2),transparent)] opacity-70 [mask-image:radial-gradient(65%_65%_at_50%_50%,black,transparent)] card-glow"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.18] [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black"></div>
                    </div>
                    <div className="relative">
                        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <div className="flex flex-col items-start">
                            <div className="inline-flex items-center justify-center">
                                <OrelisLogo />
                            </div>
                            <p className="mt-4 mb-6 text-left text-sm leading-relaxed text-zinc-400">
                                The future of healthcare management. Streamlined,
                                secure, and intelligent.
                            </p>
                            <div className="flex items-center gap-3">
                                <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-300 transition hover:bg-white/10"
                                >
                                <Twitter fill="currentColor" size={18} />
                                </a>
                                <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-300 transition hover:bg-white/10"
                                >
                                <Github fill="currentColor" size={18} />
                                </a>
                                <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-300 transition hover:bg-white/10"
                                >
                                <Linkedin fill="currentColor" size={18} />
                                </a>
                            </div>
                            </div>
                        </div>
                        <div className="text-left">
                            <h4 className="mb-4 text-sm font-semibold tracking-tight text-white font-headline">
                            Product
                            </h4>
                            <ul className="space-y-3">
                            <li>
                                <Link
                                href="/features"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="/pricing"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="/pitch"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Pitch Deck
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="#"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Changelog
                                </Link>
                            </li>
                            </ul>
                        </div>
                        <div className="text-left">
                            <h4 className="mb-4 text-sm font-semibold tracking-tight text-white font-headline">
                            Resources
                            </h4>
                            <ul className="space-y-3">
                            <li>
                                <Link
                                href="#"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="#"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Support
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="#"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                API Reference
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="#"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Community
                                </Link>
                            </li>
                            </ul>
                        </div>
                        <div className="text-left">
                            <h4 className="mb-4 text-sm font-semibold tracking-tight text-white font-headline">
                            Company
                            </h4>
                            <ul className="space-y-3">
                            <li>
                                <Link
                                href="/about"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                About
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="/blog"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="#"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="/contact"
                                className="text-sm text-zinc-400 transition hover:text-white"
                                >
                                Contact
                                </Link>
                            </li>
                            </ul>
                        </div>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
                        <p className="text-sm text-zinc-500">
                            © {currentYear} Orelis. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link
                            href="/privacy"
                            className="text-sm text-zinc-500 transition hover:text-white"
                            >
                            Privacy Policy
                            </Link>
                            <Link
                            href="/terms"
                            className="text-sm text-zinc-500 transition hover:text-white"
                            >
                            Terms of Service
                            </Link>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

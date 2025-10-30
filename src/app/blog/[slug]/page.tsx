
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';
import type { BlogPost } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Footer } from '@/components/layout/footer';
import { PublicHeader } from '@/components/layout/public-header';
import Link from 'next/link';

async function getPost(slug: string) {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);
    const postsRef = firestore.collection('blogPosts');
    const snapshot = await postsRef.where('slug', '==', slug).where('status', '==', 'published').limit(1).get();

    if (snapshot.empty) {
        return null;
    }

    const postDoc = snapshot.docs[0];
    return { id: postDoc.id, ...postDoc.data() } as BlogPost;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: post.title,
        description: post.metaDescription,
        openGraph: {
            title: post.title,
            description: post.metaDescription,
            type: 'article',
            images: post.featuredImage ? [post.featuredImage] : [],
        },
    };
}


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
         <div className="bg-black text-white selection:bg-zinc-700 selection:text-white">
             <PublicHeader />
            <main className="pt-16">
                 <article className="py-24 sm:py-32 noisy-bg">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold my-2 font-headline">
                                {post.title}
                            </h1>
                             <p className="font-sans my-4 text-lg text-zinc-400">
                                Published by <Link href="/" className="hover:text-primary hover:underline">{post.authorName}</Link> on {new Date(post.publishedAt!).toLocaleDateString()}
                            </p>
                        </div>

                        {post.featuredImage && (
                            <div className="relative w-full h-96 mb-12 border border-dashed border-zinc-800">
                                <Image
                                    src={post.featuredImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        
                        <div className="prose prose-invert prose-lg mx-auto max-w-none prose-p:text-zinc-300 prose-headings:text-primary prose-headings:font-headline prose-a:text-primary prose-strong:text-white">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
}

// This function tells Next.js which slugs to pre-render at build time.
export async function generateStaticParams() {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);
    const postsRef = firestore.collection('blogPosts');
    const snapshot = await postsRef.where('status', '==', 'published').get();
    
    return snapshot.docs.map(doc => ({
        slug: doc.data().slug,
    }));
}


import type { Metadata } from 'next';
import type { BlogPost } from '@/lib/types';
import { BlogClientPage } from './client-page';
import { blogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'The Orelis Blog. Latest news, updates, case studies, and stories on the future of patient care and healthcare technology.',
};

async function getPosts(): Promise<BlogPost[]> {
    // For now, we return the hardcoded posts.
    // This function can be updated later to fetch dynamic posts from a CMS or Firestore
    // and merge them with the hardcoded posts.
    return blogPosts.sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
}

export default async function BlogPage() {
    const posts = await getPosts();

    return <BlogClientPage posts={posts} />;
}

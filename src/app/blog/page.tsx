
import type { Metadata } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';
import type { BlogPost } from '@/lib/types';
import { BlogClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'The Orelis Blog. Latest news, updates, case studies, and stories on the future of patient care and healthcare technology.',
};

async function getPosts(): Promise<BlogPost[]> {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);
        const postsRef = firestore.collection('blogPosts');
        // To avoid needing a composite index, we fetch all posts and filter/sort in code.
        const snapshot = await postsRef.orderBy('updatedAt', 'desc').get();

        if (snapshot.empty) {
            return [];
        }

        const posts: BlogPost[] = [];
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            // Filter for published posts here
            if (data.status === 'published') {
                posts.push({
                    id: doc.id,
                    ...data,
                    // Ensure date fields are serializable
                    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
                    updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : null,
                } as BlogPost);
            }
        });
        
        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return []; // Return empty array on error
    }
}

export default async function BlogPage() {
    const posts = await getPosts();

    return <BlogClientPage posts={posts} />;
}

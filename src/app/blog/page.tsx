
import type { Metadata } from 'next';
import { BlogClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'The Orelis Blog. Latest news, updates, case studies, and stories on the future of patient care and healthcare technology.',
};

export default function BlogPage() {
  return <BlogClientPage />;
}

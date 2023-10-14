import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatDate';
import { BreadCrumb } from '@/components/BreadCrumb';
import { env } from '@/lib/env';
import { getPosts } from '@/data-access/getPosts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 86400;

type PageParams = {
  slug: string;
};

export async function generateStaticParams() {
  return (await getPosts())
    .filter((post) => !post.draft)
    .map((post) => ({
      slug: post._id,
    })) satisfies PageParams[];
}

export async function generateMetadata({ params: { slug } }: { params: PageParams }) {
  const post = (await getPosts()).find((post) => post.slug === slug);
  if (post === undefined) return null;

  return {
    metadataBase: new URL(env.WEBSITE_URL),
    title: post.title,
    openGraph: {
      type: 'article',
      title: `${post.title} | blog.yoiw.dev`,
      url: `/posts/${slug}`,
      images: [{ url: `/posts/${slug}/thumbnail.png` }],
      locale: 'ja',
      siteName: 'blog.yoiw.dev',
    },
    twitter: {
      card: 'summary',
      title: `${post.title} | blog.yoiw.dev`,
    },
  } satisfies Metadata;
}

export default async function Page({ params: { slug } }: { params: PageParams }) {
  const post = (await getPosts()).find((post) => post.slug === slug);
  if (post === undefined) {
    notFound();
  }
  const {
    title,
    _sys: {
      raw: { firstPublishedAt },
    },
    body,
    tags,
  } = post;

  return (
    <div className='px-4 py-10'>
      <div className='mx-auto max-w-[735px]'>
        <nav className='mb-6'>
          <BreadCrumb nodes={[{ title, url: `/posts/${slug}` }]} />
        </nav>

        <article>
          <div className='mb-12'>
            <h1 className='mb-4 text-2xl font-bold md:text-3xl xl:text-4xl'>{title}</h1>
            <div className='flex items-center gap-2'>
              <time dateTime={firstPublishedAt}>{formatDate(firstPublishedAt)}</time>
              <span className='flex gap-2'>
                {tags.map((tag) => (
                  <Link
                    key={tag._id}
                    className='rounded-md bg-neutral-900 px-2 py-1 text-sm text-white hover:bg-neutral-700'
                    href={`/tags/${tag.slug}`}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'prose-code:unset prose prose-sm mx-auto md:prose-lg prose-code:font-normal prose-code:before:hidden prose-code:after:hidden',
              'prose-h1:text-xl prose-pre:p-2 prose-pre:text-sm md:prose-h1:text-3xl md:prose-pre:text-base',
              'mb-20'
            )}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </article>

        <footer className='mx-auto max-w-[735px]'>
          <nav>
            <BreadCrumb nodes={[{ title, url: `/posts/${slug}` }]} />
          </nav>
        </footer>
      </div>
    </div>
  );
}

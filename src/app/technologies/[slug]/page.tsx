import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/site/detail-page";
import { technologies } from "@/data/content";

export function generateStaticParams() {
  return technologies.map((tech) => ({ slug: tech.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tech = technologies.find((t) => t.slug === slug);
  if (!tech) return {};

  return {
    title: { absolute: tech.seoTitle },
    description: tech.metaDescription,
    openGraph: {
      title: tech.seoTitle,
      description: tech.metaDescription,
    },
  };
}

export default async function TechnologyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tech = technologies.find((t) => t.slug === slug);
  if (!tech) notFound();

  return <DetailPage item={tech} basePath="/technologies" backLabel="Back to Technologies" />;
}

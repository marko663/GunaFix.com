import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/site/detail-page";
import { industries } from "@/data/content";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return {};

  return {
    title: { absolute: industry.seoTitle },
    description: industry.metaDescription,
    openGraph: {
      title: industry.seoTitle,
      description: industry.metaDescription,
    },
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) notFound();

  return <DetailPage item={industry} basePath="/industries" backLabel="Back to Industries" />;
}

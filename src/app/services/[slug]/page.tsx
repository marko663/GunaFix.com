import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/site/detail-page";
import { services } from "@/data/content";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  return {
    title: { absolute: service.seoTitle },
    description: service.metaDescription,
    openGraph: {
      title: service.seoTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return <DetailPage item={service} basePath="/services" backLabel="Back to Services" />;
}

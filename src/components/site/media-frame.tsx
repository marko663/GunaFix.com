import Image from "next/image";

import { CarportVisual } from "@/components/brand/illustrations";
import type { CarportVisual as Variant, SiteImage } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Shows the photograph uploaded through the CMS when there is one, and the
 * schematic line drawing when there is not. Every model, project and article
 * therefore looks finished before a single photo has been supplied.
 */
export function MediaFrame({
  image,
  variant,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  image?: SiteImage;
  variant?: Variant;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (image) {
    return (
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden border border-white/10 bg-surface",
          className
        )}
      >
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  if (!variant) return null;

  return (
    <div className={cn("border border-white/10 bg-surface p-6 sm:p-8", className)}>
      <CarportVisual variant={variant} />
    </div>
  );
}

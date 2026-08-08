import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/section-heading";

export function FaqSection({
  items,
  title = "Häufige Fragen",
  eyebrow = "FAQ",
  subtitle,
}: {
  items: { question: string; answer: string }[];
  title?: string;
  eyebrow?: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-white/10 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <Accordion type="single" collapsible className="mt-12 border-t border-white/10">
          {items.map((item) => (
            <AccordionItem key={item.question} value={item.question} className="border-white/10">
              <AccordionTrigger className="py-5 text-left text-base font-medium text-white hover:text-solar">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 leading-relaxed text-white/60">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

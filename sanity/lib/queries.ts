import { groq } from "next-sanity";

/** Every field the website renders, fetched in a single round trip. */
export const siteQuery = groq`{
  "settings": *[_type == "siteSettings"][0]{
    claim, description, hero, heroImage, stats, certifications, valueProps,
    processSteps, email, phone, street, city, countryName, openingHours,
    contactSubtitle, needFromYou, faq, impressum, datenschutz
  },
  "groundForce": *[_type == "groundForce"][0]{
    title, subtitle, intro, image, benefits, process, comparisonRows, specs
  },
  "carports": *[_type == "carport"] | order(order asc){
    "slug": slug.current, name, family, teaser, intro, image, visual, highlights,
    types, specs, applications, body, seoTitle, metaDescription
  },
  "projects": *[_type == "project"] | order(order asc){
    "slug": slug.current, title, sector, location, year, model, image, gallery,
    metrics, summary, challenge, solution
  },
  "articles": *[_type == "article"] | order(order asc){
    "slug": slug.current, title, category, readingTime, teaser, image, sections,
    seoTitle, metaDescription
  }
}`;

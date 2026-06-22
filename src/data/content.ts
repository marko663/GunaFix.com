export type ContentItem = {
  slug: string;
  title: string;
  teaser: string;
  seoTitle: string;
  metaDescription: string;
  features: string[];
  body: string;
  tags?: string[];
};

export const siteConfig = {
  name: "GunaFix",
  url: "https://gunafix.com",
  email: "markoguna9@gmail.com",
  tagline: "Your website, fixed by AI.",
  description:
    "We diagnose, repair, and reimagine business websites using proprietary AI agents, delivering blazing-fast experiences your customers will love.",
  timezone: "Europe/Berlin",
  bookingHours: "Afternoons only, 14:00–21:00 (Europe/Berlin)",
};

export const trustBadges = [
  "GDPR Compliant",
  "SSL Secured",
  "AI Accelerated",
  "EU Hosted",
];

export const heroScores = [
  { label: "Performance", value: 98 },
  { label: "SEO", value: 95 },
  { label: "Accessibility", value: 100 },
];

export const stats = [
  { value: "200+", label: "Sites shipped worldwide" },
  { value: "99.9%", label: "Average uptime SLA" },
  { value: "0.4s", label: "Average load time" },
  { value: "24/7", label: "AI monitoring & support" },
];

export const pipelineStats = [
  { value: "11 min", label: "Avg build time" },
  { value: "12", label: "Agents in pipeline" },
  { value: "1,400+", label: "Auto-fixes / week" },
  { value: "0", label: "Human handoffs" },
];

export const pipelineStages = [
  { name: "discovery-agent", description: "parsing brief & brand", progress: 100 },
  { name: "design-agent", description: "generating layout system", progress: 100 },
  { name: "code-agent", description: "shipping React + Tailwind", progress: 86 },
  { name: "qa-agent", description: "running 312 checks", progress: 64 },
  { name: "deploy-agent", description: "edge rollout · global", progress: 22 },
];

export const buildLog = [
  { cmd: "ai.discover brand=acme scope=marketing-site", result: "extracted 14 brand tokens" },
  { cmd: "ai.design layout=bento motion=cinematic", result: "6 sections · 24 components" },
  { cmd: "ai.code framework=react ssr=edge", result: "1,284 LOC · 0 type errors" },
  { cmd: "ai.qa lighthouse + a11y + seo", result: "perf 98 · seo 100 · a11y 100" },
  { cmd: "ai.deploy region=global cdn=edge", result: "main · pushed · 11 min" },
];

export const whyUs = [
  "Fix critical issues in days, not months",
  "Modern, accessible, mobile-first design",
  "Transparent pricing & honest timelines",
  "AI-powered features baked in",
];

export const howItWorks = [
  {
    step: "1",
    title: "Tell us your goals",
    body: "Share what's broken or what you want to build. Send your URL, goals and pain points, we reply within one business day with a clear scope, timeline and transparent fixed price. No sales calls required.",
  },
  {
    step: "2",
    title: "AI-powered audit",
    body: "Our AI agents analyze your site for performance, SEO, UX, accessibility and security issues, benchmark you against top competitors and surface the highest-leverage fixes first, all in plain English.",
  },
  {
    step: "3",
    title: "Build & fix",
    body: "Our engineers ship clean, modern, fully-typed code with AI features baked in where they make sense. You see staging previews daily and approve every change before it goes live.",
  },
  {
    step: "4",
    title: "Launch & grow",
    body: "We deploy to a global edge network, monitor uptime, SEO and conversions 24/7 and keep evolving your site so it stays ahead of Google's algorithm, and ahead of your competitors.",
  },
];

export const services: ContentItem[] = [
  {
    slug: "ai-website-audits",
    title: "AI Website Audits",
    teaser:
      "Our AI-driven audit pinpoints exactly what's slowing your site down, Core Web Vitals, broken SEO tags, accessibility gaps, conversion leaks and security issues. You get a prioritized, plain-English report with the exact fixes that move the needle for your business.",
    seoTitle: "AI Website Audits | Core Web Vitals, SEO & UX Report | GunaFix",
    metaDescription:
      "AI-powered website audits covering Core Web Vitals, technical SEO, accessibility and conversion. Get a prioritized fix list in 3–5 days.",
    features: [
      "Core Web Vitals & Lighthouse",
      "Technical SEO crawl",
      "Accessibility (WCAG 2.2)",
      "Conversion & UX heuristics",
    ],
    body: "We crawl every page of your site using a combination of proprietary AI agents and industry-standard tools like Lighthouse, PageSpeed Insights, Screaming Frog and axe-core. Our audit goes beyond scores, we map issues to revenue impact, showing you which fixes will boost conversions and which are just nice-to-have. You'll receive a 30+ page report with screenshots, priority rankings, competitor benchmarking and a fixed-price quote for every recommended fix. Typical audits are delivered within 3–5 business days and include a 30-minute walkthrough call with our lead engineer.",
    tags: ["Core Web Vitals", "SEO Audit", "Conversion Map"],
  },
  {
    slug: "rapid-website-fixes",
    title: "Rapid Website Fixes",
    teaser:
      "From CSS bugs and broken layouts to outdated WordPress, Wix, Shopify or custom React sites, we ship clean, modern code in days, not months. Most fixes go live within 48–72 hours with full QA and a rollback safety net.",
    seoTitle: "Rapid Website Fixes | WordPress, Shopify, React | GunaFix",
    metaDescription:
      "Fast, reliable website fixes for WordPress, Shopify, Wix, Webflow and custom React. Most fixes ship in 48–72 hours with a 30-day warranty.",
    features: [
      "Bug & layout fixes",
      "Mobile responsiveness",
      "Form & checkout repairs",
      "SEO & schema fixes",
    ],
    body: "Our engineers work across every major platform and framework, React, Next.js, Vue, WordPress, Shopify, Webflow, Wix, Squarespace and custom PHP or Python backends. Each fix is tested across real devices (iPhone, Android, tablets, desktop) and major browsers (Chrome, Safari, Firefox, Edge) before deployment. We use staging environments for all changes, so your live site is never at risk. Every fix comes with a 30-day warranty: if something breaks, we repair it free of charge.",
  },
  {
    slug: "performance-optimization",
    title: "Performance Optimization",
    teaser:
      "We turn slow sites into sub-second experiences. Image optimization, edge caching, code-splitting, font tuning and lazy hydration, engineered to maximize Google PageSpeed scores and Core Web Vitals on real-world devices and networks.",
    seoTitle: "Website Performance Optimization | Sub-second Load Times | GunaFix",
    metaDescription:
      "Boost PageSpeed and Core Web Vitals with edge caching, image optimization and code-splitting. Typical 2–5x faster load times.",
    features: ["LCP < 1.2s", "CLS near zero", "Edge CDN delivery", "Image & font tuning"],
    body: "We deploy to Cloudflare, Vercel Edge and AWS CloudFront for global sub-100ms cache hits. Images are converted to next-gen formats (AVIF, WebP) with responsive srcsets, fonts are subsetted and preloaded, and JavaScript bundles are split by route. We also implement service workers for offline support, HTTP/3 for faster handshakes and critical-CSS inlining for instant first paint. Typical results: 60–80% reduction in page weight and load time improvements of 2–5x.",
  },
  {
    slug: "ai-integrations",
    title: "AI Integrations",
    teaser:
      "Add AI chatbots, smart search, content generation, lead-qualification agents and personalized product recommendations powered by GPT-class models, wired safely into your existing site, CRM and data sources.",
    seoTitle: "AI Integrations for Websites | Chatbots, Search & Agents | GunaFix",
    metaDescription:
      "Add GPT-class chatbots, semantic search, content automation and lead-scoring agents to your site. GDPR-compliant, CRM-ready.",
    features: ["AI chat & support", "Semantic search", "Content automation", "Lead scoring agents"],
    body: "We integrate OpenAI GPT-4o, Claude, Gemini and open-source models (Llama, Mistral) via secure APIs with zero data leakage. Our AI chatbots are trained on your knowledge base and escalate to humans when needed. Smart search uses vector embeddings for natural-language product and content discovery. Content automation generates SEO-optimized blog posts, product descriptions and email sequences in your brand voice. All AI features are GDPR-compliant, with opt-in consent flows and clear data-processing disclosures.",
  },
  {
    slug: "full-website-redesigns",
    title: "Full Website Redesigns",
    teaser:
      "Modern, conversion-focused websites that look like the future and convert like a sales team. Strategy, branding, copywriting, design and engineering, delivered as one accountable package built for SEO, speed and growth.",
    seoTitle: "Full Website Redesigns | Conversion-focused & SEO-safe | GunaFix",
    metaDescription:
      "Modern website redesigns with strategy, branding, copy and engineering. Built for SEO, speed, conversion and long-term growth.",
    features: ["Brand & UX strategy", "Modern UI systems", "SEO-first architecture", "Analytics & A/B ready"],
    body: "Every redesign starts with a discovery workshop where we map your business goals, user personas and competitive landscape. We then produce wireframes, high-fidelity mockups and an interactive prototype for your approval. Engineering uses React, Next.js or TanStack Start with Tailwind CSS and shadcn/ui for a maintainable design system. We migrate all existing content, set up 301 redirects, preserve SEO equity and integrate analytics, heatmaps and A/B testing tools. Post-launch, we provide 60 days of free support and optimization.",
  },
  {
    slug: "ongoing-care-maintenance",
    title: "Ongoing Care & Maintenance",
    teaser:
      "We monitor uptime, security, SEO rankings and performance 24/7, push updates, patch vulnerabilities and continuously evolve your site so it never falls behind competitors or Google's algorithm changes.",
    seoTitle: "Website Care & Maintenance Plans | 24/7 Monitoring | GunaFix",
    metaDescription:
      "24/7 uptime monitoring, security patching, monthly SEO reports and continuous improvements. Care plans from €199/month.",
    features: ["24/7 uptime monitoring", "Security patching", "Monthly SEO reports", "Content & feature updates"],
    body: "Our Care plans include automated uptime monitoring via Pingdom and UptimeRobot with SMS/email alerts, weekly security scans, dependency updates and patch management for CMS plugins and frameworks. Each month you receive a detailed SEO report covering rankings, traffic, backlinks and technical health, plus a prioritized list of improvement opportunities. Plan holders also get discounted rates on new features and a dedicated Slack channel for fast support. Plans start at €199/month and scale with your traffic and complexity.",
  },
];

export const industries: ContentItem[] = [
  {
    slug: "ecommerce-shopify",
    title: "E-commerce & Shopify",
    teaser:
      "Storefronts, checkout repairs, product feeds and conversion optimization for Shopify, WooCommerce and custom carts.",
    seoTitle: "E-commerce & Shopify Web Development | GunaFix",
    metaDescription:
      "Shopify, WooCommerce and headless storefronts built for conversion. Checkout fixes, product feeds and global scale.",
    features: ["Shopify Liquid & headless", "WooCommerce optimization", "Multi-currency storefronts", "Abandoned-cart recovery"],
    body: "We handle everything from abandoned-cart recovery and one-click checkout upgrades to multi-currency and multi-language storefronts. Our Shopify expertise includes Liquid theme customization, app integration, headless Shopify with React frontends and Shopify Markets setup. For WooCommerce, we optimize database queries, fix plugin conflicts and implement caching strategies that keep your store fast at scale.",
  },
  {
    slug: "saas-startups",
    title: "SaaS & Startups",
    teaser:
      "Marketing sites, pricing pages, onboarding flows and AI-powered dashboards for fast-moving SaaS teams.",
    seoTitle: "SaaS & Startup Website Development | GunaFix",
    metaDescription:
      "High-converting marketing sites, pricing pages, onboarding and AI dashboards for fast-moving SaaS teams.",
    features: ["Conversion-focused marketing sites", "Interactive pricing pages", "AI-assisted onboarding", "Real-time dashboards"],
    body: "We build marketing sites that convert free-tier visitors into paid users, with interactive pricing calculators, ROI demos and case study libraries. Our onboarding flows reduce time-to-value with progressive disclosure, interactive tutorials and AI-assisted setup wizards. For dashboards, we implement real-time data visualization, role-based access control and responsive data tables that work on mobile.",
  },
  {
    slug: "local-businesses",
    title: "Local Businesses",
    teaser:
      "Restaurants, clinics, salons, gyms and trades, fast, mobile-first sites that rank locally and convert visitors into bookings.",
    seoTitle: "Local Business Websites | Local SEO & Bookings | GunaFix",
    metaDescription:
      "Mobile-first sites for restaurants, clinics, salons, gyms and trades that rank locally and drive bookings.",
    features: ["Google Business Profile SEO", "Local schema markup", "Booking integrations", "3G-fast mobile design"],
    body: "Local SEO is our specialty: Google Business Profile optimization, local schema markup, citation building and review-generation widgets. We integrate booking systems (Calendly, Acuity, custom) directly into your site with real-time availability. Our mobile-first designs load instantly on 3G networks, with click-to-call buttons, map embeds and directions that drive foot traffic.",
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    teaser:
      "Listing sites, IDX integrations, lead-capture funnels and AI property assistants for agencies and brokers.",
    seoTitle: "Real Estate Websites | IDX & AI Assistants | GunaFix",
    metaDescription:
      "MLS/IDX-integrated listings, lead-capture funnels and 24/7 AI property assistants for brokers and agencies.",
    features: ["MLS/IDX property search", "Mortgage calculators", "24/7 AI listing assistant", "Agent trust signals"],
    body: "We build MLS/IDX-integrated property search with advanced filters (price, beds, baths, school district, commute time) and map-based exploration. Lead capture includes mortgage calculators, neighborhood guides and AI chatbots that answer questions about listings 24/7. Our designs emphasize trust signals, agent profiles, testimonials, sold-data proof points, to convert browsers into qualified leads.",
  },
  {
    slug: "agencies-consultancies",
    title: "Agencies & Consultancies",
    teaser: "Portfolio sites, case studies and lead-gen funnels designed to win premium clients.",
    seoTitle: "Websites for Agencies & Consultancies | GunaFix",
    metaDescription: "Portfolio sites, case studies and lead-gen funnels engineered to win premium B2B clients.",
    features: ["Narrative case studies", "Lead-gen funnels", "Diagnostic quizzes", "LinkedIn-optimized sharing"],
    body: "Your website is your #1 sales tool. We create narrative-driven case studies with before/after metrics, process breakdowns and client video testimonials. Lead-gen funnels include content upgrades, webinar registrations and diagnostic quizzes that segment visitors by need. Every page is optimized for LinkedIn sharing, with compelling open-graph images and persuasive meta descriptions.",
  },
  {
    slug: "healthcare-wellness",
    title: "Healthcare & Wellness",
    teaser: "GDPR/HIPAA-aware websites, appointment booking and patient-friendly content.",
    seoTitle: "Healthcare & Wellness Websites | GDPR/HIPAA | GunaFix",
    metaDescription: "Patient-friendly, compliant healthcare websites with secure forms, booking and telehealth onboarding.",
    features: ["HIPAA-aware hosting", "Encrypted patient forms", "Practice management integrations", "WCAG-compliant content"],
    body: "We implement end-to-end encryption for patient forms, HIPAA-compliant hosting and granular access controls for staff portals. Appointment booking integrates with your practice management system (Halaxy, Cliniko, custom EHR). Content is written at a 6th-grade reading level with clear calls-to-action, insurance information and telehealth onboarding, all fully accessible and WCAG-compliant.",
  },
  {
    slug: "finance-legal",
    title: "Finance & Legal",
    teaser: "Trust-first design, compliance-ready content and secure client portals.",
    seoTitle: "Finance & Legal Websites | Secure & Compliant | GunaFix",
    metaDescription: "Trust-first finance and legal websites with secure client portals, 2FA and EU/US compliance baked in.",
    features: ["2FA client portals", "Regulatory disclaimers", "Cookie-consent flows", "Encrypted document exchange"],
    body: "Finance and legal websites must communicate authority and security instantly. We implement SSL certificates, fraud-protection badges, regulatory disclaimers and cookie-consent flows that satisfy EU and US requirements. Client portals feature two-factor authentication, encrypted document exchange and audit logs. Content strategy emphasizes educational resources that build trust before the first consultation.",
  },
  {
    slug: "creators-coaches",
    title: "Creators & Coaches",
    teaser: "Personal brands, course pages, membership sites and AI chat assistants trained on your content.",
    seoTitle: "Websites for Creators & Coaches | Courses & AI Chat | GunaFix",
    metaDescription: "Personal brand sites, course platforms, membership areas and AI assistants trained on your content.",
    features: ["Digital product landing pages", "Drip-content courses", "Membership gating", "AI assistant on your content"],
    body: "We build creator ecosystems that turn followers into customers, with landing pages for digital products, automated email sequences and community membership gates. Course platforms include progress tracking, drip content, quizzes and certificates. AI chat assistants are trained on your blog, podcast transcripts and course material to answer fan questions and recommend products automatically.",
  },
];

export const technologies: ContentItem[] = [
  {
    slug: "react-nextjs-tanstack",
    title: "React, Next.js & TanStack Start",
    teaser: "Server-rendered, SEO-friendly React applications with edge-deployed performance.",
    seoTitle: "React, Next.js & TanStack Start Development | GunaFix",
    metaDescription:
      "SSR React, Next.js App Router and TanStack Start apps deployed to the edge for sub-100ms global performance.",
    features: ["Server-rendered & SEO-friendly", "React Server Components", "Edge deployment", "Zero-config CI/CD"],
    body: "We build with React, the Next.js App Router and TanStack Start for full-stack type safety. SSR/SSG ensures Google indexes every page perfectly, while React Server Components reduce client-side JavaScript by 40–70%. Edge deployment via Vercel and Cloudflare Pages gives sub-100ms global latency, automatic HTTPS and zero-config CI/CD from Git.",
  },
  {
    slug: "tailwind-shadcn",
    title: "Tailwind CSS & shadcn/ui",
    teaser: "Beautiful, accessible, design-system-driven interfaces that scale across your product.",
    seoTitle: "Tailwind CSS & shadcn/ui Design Systems | GunaFix",
    metaDescription:
      "Accessible, on-brand interfaces built with Tailwind CSS and shadcn/ui on Radix primitives. Design systems that scale.",
    features: ["Utility-first styling", "Radix-based accessibility", "Keyboard-navigable components", "Design systems that scale"],
    body: "Tailwind's utility-first approach means we ship custom designs without writing bespoke CSS. Combined with shadcn/ui, a copy-paste component library built on Radix UI primitives, we get fully accessible, keyboard-navigable components (modals, dropdowns, sliders) that match your brand exactly. The result is a design system that grows with your product, not against it.",
  },
  {
    slug: "node-typescript-edge",
    title: "Node.js, TypeScript & Edge Functions",
    teaser: "Type-safe APIs and serverless functions deployed to Cloudflare and Vercel edges.",
    seoTitle: "Node.js, TypeScript & Edge Functions | GunaFix",
    metaDescription:
      "Type-safe APIs and serverless edge functions on Cloudflare and Vercel, with Zod validation and zero cold starts.",
    features: ["Type-safe APIs", "Zod validation", "Zero cold starts", "Global edge runtime"],
    body: "TypeScript eliminates an entire class of runtime bugs by catching type errors at build time. Our APIs use Hono or Express patterns adapted for edge runtimes, with Zod validation on every endpoint. Edge functions run within milliseconds of your users, no cold starts, no region restrictions, and integrate with databases via connection pooling and HTTP-over-SQL protocols.",
  },
  {
    slug: "supabase-postgresql",
    title: "Supabase & PostgreSQL",
    teaser: "Auth, realtime data, row-level security and scalable Postgres for production apps.",
    seoTitle: "Supabase & PostgreSQL Backends | GunaFix",
    metaDescription: "Production-ready Postgres with auth, realtime and row-level security via Supabase. Fast, secure, scalable.",
    features: ["Row-level security", "Built-in auth", "Realtime subscriptions", "Sub-50ms queries at scale"],
    body: "Supabase gives us a full backend in days, not months: Postgres with row-level security, built-in OAuth and email auth, realtime subscriptions and storage. We write migrations in plain SQL, enforce strict RLS policies and use database triggers for business logic. For high-traffic apps, we implement read replicas, connection pooling and query optimization that keeps response times under 50ms.",
  },
  {
    slug: "openai-anthropic-gemini",
    title: "OpenAI, Anthropic & Gemini",
    teaser: "AI chat, agents, embeddings and content generation wired into your business workflows.",
    seoTitle: "OpenAI, Anthropic & Gemini AI Integration | GunaFix",
    metaDescription:
      "Provider-agnostic AI integrations using GPT-4o, Claude and Gemini with vector search and fine-tuning pipelines.",
    features: ["Provider-agnostic architecture", "Vector search", "Fine-tuning pipelines", "A/B tested prompts"],
    body: "We architect AI features with provider-agnostic abstractions, so you can switch between GPT-4o, Claude and Gemini without rewriting code. Vector stores (Pinecone, Supabase pgvector) power semantic search and recommendation engines. Fine-tuning and prompt-engineering pipelines are version-controlled and A/B tested for quality and cost optimization.",
  },
  {
    slug: "shopify-wordpress-webflow",
    title: "Shopify, WordPress & Webflow",
    teaser: "We fix, migrate or fully replace legacy stacks, without breaking your SEO or revenue.",
    seoTitle: "Shopify, WordPress & Webflow Experts | GunaFix",
    metaDescription:
      "Fix, migrate or replace Shopify, WordPress and Webflow sites without losing SEO or revenue. Faster, cleaner, scalable.",
    features: ["Object caching (Redis)", "Liquid optimization", "Headless migrations", "Zero SEO/revenue loss"],
    body: "Legacy platforms don't have to mean legacy performance. For WordPress, we implement object caching (Redis), image CDNs, plugin audits and theme rebuilds that cut load times by 60%. Shopify stores get Liquid optimization, app conflict resolution and headless migrations. Webflow sites are exported to clean React code for better performance and full programmatic control.",
  },
];

export const pricingTiers = [
  {
    name: "Snapshot",
    price: "€349",
    cadence: "one-time",
    description: "A fast gut-check for a single page or landing page.",
    features: [
      "Up to 5 pages crawled",
      "Core Web Vitals & Lighthouse scores",
      "Top 10 priority fixes",
      "PDF summary report",
      "Delivered in 3 business days",
    ],
    highlight: false,
    cta: "Get a Snapshot",
  },
  {
    name: "Full Audit",
    price: "€799",
    cadence: "one-time",
    description: "Our most popular audit, the full diagnostic before a fix or redesign.",
    features: [
      "Full site crawl (up to 50 pages)",
      "Core Web Vitals, technical SEO, accessibility (WCAG 2.2) & conversion heuristics",
      "Competitor benchmarking",
      "30+ page report with screenshots & priority rankings",
      "Fixed-price quote for every recommended fix",
      "30-minute walkthrough call with our lead engineer",
    ],
    highlight: true,
    cta: "Book the Full Audit",
  },
  {
    name: "Enterprise",
    price: "From €1,999",
    cadence: "custom",
    description: "For large sites, multi-site portfolios or multi-locale rollouts.",
    features: [
      "Unlimited pages, multi-site & multi-locale crawls",
      "Everything in Full Audit, plus a security scan",
      "Dedicated engineer & private Slack channel",
      "Executive summary deck for stakeholders",
      "Live walkthrough presentation",
    ],
    highlight: false,
    cta: "Talk to Us",
  },
];

export const carePlanNote =
  "Prefer ongoing peace of mind instead of a one-off audit? Care plans with 24/7 monitoring, security patching and monthly SEO reports start at €199/month.";

export const faqs = [
  {
    question: "What is GunaFix?",
    answer:
      "GunaFix is an AI-accelerated web development studio. We diagnose, repair and rebuild business websites, pairing proprietary AI agents with senior engineers to ship audits, fixes, redesigns and AI features faster than a traditional agency, without cutting corners on quality.",
  },
  {
    question: "How fast can you fix my website?",
    answer:
      "Most bug and layout fixes ship in 48–72 hours. AI website audits are delivered in 3–5 business days. Full redesigns typically take 2–4 weeks depending on scope, and you'll get a fixed timeline before any work starts.",
  },
  {
    question: "Do you work with WordPress, Shopify, Wix or custom code?",
    answer:
      "Yes. We work across WordPress, Shopify, Webflow, Wix, Squarespace, WooCommerce and custom-built sites in React, Next.js, Vue, PHP and Python. If your stack exists, we've probably already fixed one like it.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Audits start at €349 (see Pricing). Fixes, redesigns and integrations are quoted as a fixed price after a short scoping call or audit, never hourly billing, no surprise invoices. Ongoing Care plans start at €199/month.",
  },
  {
    question: "Where is GunaFix based?",
    answer:
      "GunaFix is EU-based, with infrastructure hosted in the EU and a remote team working with clients worldwide. Calls are booked in the Europe/Berlin timezone.",
  },
  {
    question: "Will my SEO rankings be safe during a redesign?",
    answer:
      "Yes. Every redesign preserves your existing content, sets up 301 redirects for every URL, and migrates your analytics and search-console properties before launch, so you keep the rankings you've already earned.",
  },
  {
    question: "Can you add AI features to my existing site?",
    answer:
      "Yes, this doesn't require a full redesign. We can wire AI chat, smart search, content automation or lead-scoring directly into your current site and CRM, see AI Integrations.",
  },
  {
    question: "Do you offer ongoing maintenance?",
    answer:
      "Yes. Our Care plans cover 24/7 uptime monitoring, security patching, monthly SEO reports and feature updates, starting at €199/month.",
  },
];

export const mainNav = [
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Technologies", href: "/technologies" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

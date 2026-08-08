/**
 * Shape of a locale dictionary. `de.ts` and `en.ts` must both satisfy
 * `SiteContent`, so a missing translation is a type error rather than a
 * silently untranslated string in production.
 */

export type CarportVisual = "single" | "double" | "canopy" | "mega" | "premium";

export type CarportType = {
  code: string;
  name: string;
  description: string;
};

export type Carport = {
  slug: string;
  name: string;
  family: string;
  teaser: string;
  seoTitle: string;
  metaDescription: string;
  intro: string;
  visual: CarportVisual;
  highlights: string[];
  types: CarportType[];
  specs: { label: string; value: string }[];
  applications: string[];
  body: string[];
};

export type Project = {
  slug: string;
  title: string;
  sector: string;
  location: string;
  year: string;
  model: string;
  metrics: { label: string; value: string }[];
  summary: string;
  challenge: string;
  solution: string;
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  readingTime: string;
  teaser: string;
  seoTitle: string;
  metaDescription: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
};

export type NavItem = { label: string; href: string };

export type SiteContent = {
  meta: {
    claim: string;
    description: string;
    openingHours: string;
    countryName: string;
  };

  nav: NavItem[];
  legalNav: NavItem[];

  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: NavItem;
    secondaryCta: NavItem;
    highlights: string[];
  };

  stats: { value: string; label: string }[];
  certifications: { code: string; detail: string }[];
  valueProps: { title: string; body: string }[];
  processSteps: { step: string; title: string; body: string }[];

  carportsIntro: { title: string; subtitle: string; note: string };
  carports: Carport[];

  groundForce: {
    title: string;
    subtitle: string;
    intro: string;
    benefits: { title: string; body: string }[];
    process: { step: string; title: string; body: string }[];
    comparison: {
      caption: string;
      headers: { criterion: string; groundforce: string; concrete: string };
      rows: { criterion: string; groundforce: string; concrete: string }[];
    };
    specs: { label: string; value: string }[];
    cta: { title: string; body: string; label: string; href: string };
  };

  projectsIntro: { title: string; subtitle: string; disclaimer: string };
  projects: Project[];

  knowledgeIntro: { title: string; subtitle: string };
  articles: Article[];

  contact: {
    title: string;
    subtitle: string;
    formTitle: string;
    requiredNote: string;
    needFromYouTitle: string;
    needFromYou: string[];
    needFromYouNote: string;
    directTitle: string;
    addressTitle: string;
    channelLabels: { email: string; phone: string; address: string; hours: string };
  };

  form: {
    name: string;
    company: string;
    email: string;
    phone: string;
    location: string;
    spaces: string;
    message: string;
    namePlaceholder: string;
    companyPlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    locationPlaceholder: string;
    spacesPlaceholder: string;
    messagePlaceholder: string;
    consent: string;
    submit: string;
    submitting: string;
    errorMessage: string;
    successTitle: string;
    successBody: string;
  };

  faq: { question: string; answer: string }[];

  /** Short strings used directly by components. */
  ui: {
    eyebrowProducts: string;
    eyebrowTechnology: string;
    eyebrowReferences: string;
    eyebrowKnowledge: string;
    eyebrowContact: string;
    eyebrowWhy: string;
    eyebrowProcess: string;
    eyebrowAdvantages: string;
    eyebrowComparison: string;
    eyebrowSpecs: string;
    eyebrowFaq: string;

    requestProject: string;
    allModels: string;
    allProjects: string;
    toKnowledgeBase: string;
    groundForceDetail: string;
    details: string;
    read: string;
    readArticle: string;
    viewProject: string;
    technicalData: string;
    overview: string;
    backToKnowledge: string;
    moreArticles: string;
    otherModels: string;
    viewModels: string;

    roofTypes: string;
    typicalApplications: string;
    /** Contains a `{model}` placeholder. */
    inUse: string;
    elevationNote: string;
    readingTime: string;

    challenge: string;
    solution: string;
    modelUsed: string;

    faqTitle: string;
    faqSubtitle: string;

    vehiclePkw: string;
    vehicleLkw: string;
    vehicleStorage: string;

    customBuildTitle: string;
    customBuildBody: string;
    customBuildCta: string;

    homeCarportsTitle: string;
    homeCarportsSubtitle: string;
    homeGroundForceTitle: string;
    homeWhyTitle: string;
    homeWhySubtitle: string;
    homeProcessTitle: string;
    homeProcessSubtitle: string;
    homeProjectsTitle: string;
    homeProjectsSubtitle: string;
    homeKnowledgeTitle: string;
    homeKnowledgeSubtitle: string;

    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
    carportsCtaTitle: string;
    carportsCtaBody: string;
    carportsCtaLabel: string;
    /** Contains a `{model}` placeholder. */
    modelCtaTitle: string;
    modelCtaBody: string;
    projectsCtaTitle: string;
    projectsCtaBody: string;
    projectsCtaLabel: string;
    knowledgeCtaTitle: string;
    knowledgeCtaBody: string;
    knowledgeCtaLabel: string;

    footerNav: string;
    footerModels: string;
    footerContact: string;
    rightsReserved: string;

    openMenu: string;
    closeMenu: string;
    homeLinkLabel: string;
    languageLabel: string;

    notFoundTitle: string;
    notFoundBody: string;
    notFoundHome: string;
    notFoundContact: string;
  };

  legal: {
    impressum: {
      title: string;
      subtitle: string;
      placeholder: string;
      providerTitle: string;
      contactTitle: string;
      sections: { heading: string; body: string }[];
    };
    privacy: {
      title: string;
      subtitle: string;
      placeholder: string;
      controllerTitle: string;
      sections: { heading: string; body: string[] }[];
    };
  };
};

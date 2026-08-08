import type { SiteContent } from "./types";

/**
 * English dictionary. Slugs and route segments deliberately match `de.ts`
 * so the language switcher can stay on the same page in either language.
 */
export const en: SiteContent = {
  meta: {
    claim: "Photovoltaic carports from a European manufacturer",
    description:
      "Solaris Industrial designs, manufactures and installs photovoltaic carports, PV substructures and GroundForce screw pile foundations for industry, logistics, retail and the public sector — from a single source, across Europe.",
    openingHours: "Mon–Fri, 08:00–17:00 (CET)",
    countryName: "Germany",
  },

  nav: [
    { label: "Carports", href: "/carports" },
    { label: "GroundForce Foundations", href: "/groundforce" },
    { label: "Our Projects", href: "/projekte" },
    { label: "Knowledge Base", href: "/wissensdatenbank" },
    { label: "Contact", href: "/kontakt" },
  ],

  legalNav: [
    { label: "Legal Notice", href: "/impressum" },
    { label: "Privacy", href: "/datenschutz" },
  ],

  hero: {
    eyebrow: "European manufacturer · since 2015",
    title: "Photovoltaic carports from a European manufacturer",
    subtitle:
      "We turn car parks into power stations. Solaris Industrial delivers the complete solution — structural design, engineering, fabrication, GroundForce foundations and installation — for industry, logistics, retail and public sector clients.",
    primaryCta: { label: "Request a project", href: "/kontakt" },
    secondaryCta: { label: "View carport models", href: "/carports" },
    highlights: [
      "Our own steel fabrication within the EU",
      "20-year warranty on the structure",
      "Installation possible without any concrete work",
    ],
  },

  stats: [
    { value: "700+", label: "carports completed" },
    { value: "60 MW", label: "PV capacity installed" },
    { value: "20,000", label: "parking spaces covered" },
    { value: "20 years", label: "warranty on the structure" },
  ],

  certifications: [
    { code: "EN 1090-1", detail: "Execution of steel structures" },
    { code: "ISO 3834-2", detail: "Quality requirements for welding" },
    { code: "TÜV", detail: "Certified production and inspection processes" },
    { code: "CE", detail: "Declaration of conformity for every structure" },
  ],

  valueProps: [
    {
      title: "Everything from one source",
      body: "Structural calculations, bespoke engineering, production in our own works, foundations and installation. One contract, one point of contact, one programme.",
    },
    {
      title: "Designed around your operation",
      body: "Column grids, clearance heights and drainage are set to suit how your car park works — not the other way round. The site stays largely usable throughout installation.",
    },
    {
      title: "Scales from 4 to 4,000 spaces",
      body: "Modular systems in types T, Y, L and L2 combine into rows and double rows of any length.",
    },
    {
      title: "Charging infrastructure built in",
      body: "Cable routes, conduit runs and sub-distribution boards are integrated into the profile. AC and DC charge points mount directly onto the column.",
    },
  ],

  processSteps: [
    {
      step: "01",
      title: "Analysis & yield forecast",
      body: "We assess the area, orientation, ground investigation report and grid connection, then calculate the expected annual yield and the payback period.",
    },
    {
      step: "02",
      title: "Engineering & structural design",
      body: "Bespoke design including verifiable structural calculations to Eurocode for snow, wind and imposed loads at your specific site.",
    },
    {
      step: "03",
      title: "Fabrication",
      body: "Cutting, welding and hot-dip galvanising in our own works to EN 1090-1 and ISO 3834-2. Every batch is documented.",
    },
    {
      step: "04",
      title: "Foundations & installation",
      body: "GroundForce screw piles are driven in, the structure is bolted together and the modules are fitted — section by section, while the site stays in use.",
    },
    {
      step: "05",
      title: "Handover & service",
      body: "Sign-off with inspection records, full documentation and a maintenance schedule. Monitoring and a service contract are available on request.",
    },
  ],

  carportsIntro: {
    title: "Carports",
    subtitle:
      "Five ranges, one modular system. Every Solaris carport is engineered around your parking grid, your snow load zone and your module layout — from a single row of staff parking to a covered HGV loading area.",
    note: "All ranges are available in roof types T, Y, L and L2, and can be extended to any length in a row.",
  },

  carports: [
    {
      slug: "easypark",
      name: "EASYPARK",
      family: "EASYPARK range",
      teaser:
        "The most adaptable range: available with concrete foundations, screw piles or reinforced S350 structural steel.",
      seoTitle: "EASYPARK Photovoltaic Carport | Solaris Industrial",
      metaDescription:
        "EASYPARK by Solaris Industrial: a PV carport in types T, Y, L and L2 — with concrete, screw pile or S350 steel foundations. Maximum adaptation to sun path and site.",
      intro:
        "EASYPARK is the most versatile range in the Solaris programme. It is available in several versions — with reinforced concrete foundations, with GroundForce screw piles, and with reinforced S350 structural steel for higher load capacities. This lets EASYPARK adapt very precisely to the operator's requirements and to the sunlight conditions on site, making optimum use of the available area for photovoltaic modules.",
      visual: "single",
      highlights: [
        "Three foundation options: concrete, GroundForce, S350",
        "All four roof types: T, Y, L and L2",
        "Module layout optimised for the local sun path",
        "Extendable to any length in a row",
      ],
      types: [
        {
          code: "Type T",
          name: "Single column, cantilevered both sides",
          description:
            "A central row of columns with a symmetrical duo-pitch roof. Two rows of spaces back to back, with the fewest possible foundation points.",
        },
        {
          code: "Type Y",
          name: "V-column, double row",
          description:
            "A Y-shaped column carrying two pitched roof planes. Wide spans with a slender appearance — ideal for central parking aisles.",
        },
        {
          code: "Type L",
          name: "Single-sided, single row",
          description:
            "A cantilevered mono-pitch roof over one row of spaces. The classic solution along boundaries and façades.",
        },
        {
          code: "Type L2",
          name: "Single-sided, double row",
          description:
            "A mono-pitch roof over two rows of spaces set back to back. The largest covered area per column.",
        },
      ],
      specs: [
        { label: "Spaces per unit", value: "1–4, extendable in a row" },
        { label: "Roof pitch", value: "5°–15°, depending on site" },
        { label: "Clearance height", value: "from 2.30 m, project specific" },
        { label: "Steel grade", value: "S235 / S350, hot-dip galvanised to EN ISO 1461" },
        { label: "Foundation", value: "Concrete, GroundForce screw pile or S350" },
        { label: "Snow load", value: "designed to Eurocode 1 for the zone on site" },
        { label: "Warranty", value: "20 years on the structure" },
      ],
      applications: [
        "Staff car parks",
        "Office locations",
        "Retail parks and superstores",
        "Residential developments and district parking",
      ],
      body: [
        "EASYPARK was developed for operators who want to cover an area economically without paying for a bespoke structure. The modular system covers the usual parking grids and is adapted only where the site demands it — in the roof pitch, the clearance height and the foundations.",
        "Because all three foundation options sit on the same structure, the decision on foundations can be left open until the ground investigation is complete. On competent ground, GroundForce screw piles are driven in and the build time drops to a few days; on difficult ground, the concrete version is used.",
        "The module layout is recalculated for every site. Depending on how the parking aisle runs, a south-facing layout delivers the highest annual yield, while an east–west split broadens the generation profile and matches a business's load profile more closely.",
      ],
    },
    {
      slug: "basic",
      name: "BASIC",
      family: "BASIC range",
      teaser:
        "The economical core model — flexibly adapted to local conditions and sunlight.",
      seoTitle: "BASIC Photovoltaic Carport | Solaris Industrial",
      metaDescription:
        "BASIC by Solaris Industrial: the economical PV carport in types T, Y, L and L2 — flexibly adapted to sunlight conditions and terrain.",
      intro:
        "The BASIC model adapts flexibly to local conditions through a choice of versions matched to the sunlight available, which in turn improves the efficiency of the photovoltaic system. BASIC is available in types T, Y, L and L2.",
      visual: "double",
      highlights: [
        "The best ratio of investment to covered area",
        "Roof versions matched to sunlight conditions",
        "All four roof types: T, Y, L and L2",
        "Short lead times thanks to standard sections",
      ],
      types: [
        {
          code: "Type T",
          name: "Single column, cantilevered both sides",
          description:
            "Symmetrical cover over two rows of spaces from a single central column axis.",
        },
        {
          code: "Type Y",
          name: "V-column, double row",
          description:
            "A split roof plane for east–west layouts, giving an even yield across the day.",
        },
        {
          code: "Type L",
          name: "Single-sided, single row",
          description: "A mono-pitch roof over one row of spaces.",
        },
        {
          code: "Type L2",
          name: "Single-sided, double row",
          description:
            "A mono-pitch roof over two rows of spaces — maximum area per foundation point.",
        },
      ],
      specs: [
        { label: "Spaces per unit", value: "2–4, extendable in a row" },
        { label: "Roof pitch", value: "5°–12°" },
        { label: "Clearance height", value: "from 2.30 m" },
        { label: "Steel grade", value: "S235, hot-dip galvanised to EN ISO 1461" },
        { label: "Foundation", value: "Concrete or GroundForce screw pile" },
        { label: "Snow load", value: "designed to Eurocode 1" },
        { label: "Warranty", value: "20 years on the structure" },
      ],
      applications: [
        "Large staff car parks",
        "Business parks",
        "Municipal car parks",
        "Park and ride sites",
      ],
      body: [
        "BASIC answers the most common requirement in commercial construction: a lot of area, a clear budget and a tight programme. The range avoids special sections and uses standard profiles that remain permanently available — which shortens lead times and makes later extensions straightforward.",
        "Despite the economical approach, adaptation to the site is retained. Roof pitch and orientation are chosen according to the available sunlight, so the photovoltaic system not only fits but also delivers the calculated yield.",
      ],
    },
    {
      slug: "mega",
      name: "MEGA",
      family: "MEGA range",
      teaser:
        "The largest carport in the programme — cover for HGVs, coaches and heavy plant.",
      seoTitle: "MEGA Photovoltaic Carport for HGVs and Commercial Vehicles | Solaris Industrial",
      metaDescription:
        "MEGA by Solaris Industrial: the largest PV carport in the range — for distribution centres, filling stations, campsites, farms and hotel car parks.",
      intro:
        "MEGA is the largest carport in the programme, which makes it the right choice for distribution centres, filling stations, campsites, agricultural businesses and hotel car parks. The structure spans areas where HGVs, trailers, coaches and agricultural machinery are parked or manoeuvred.",
      visual: "mega",
      highlights: [
        "Generous clearance heights for articulated lorries and coaches",
        "Wide spans with no intermediate columns",
        "Designed for manoeuvring traffic and heavy plant",
        "Very high PV output per square metre of site area",
      ],
      types: [
        {
          code: "Type L",
          name: "Single-sided, HGV bay",
          description:
            "A cantilevered roof over one row of HGVs, with columns clear of the manoeuvring area.",
        },
        {
          code: "Type T",
          name: "Central column, double row",
          description: "Two rows of HGVs back to back from a single central column axis.",
        },
      ],
      specs: [
        { label: "Clearance height", value: "up to 4.50 m, project specific" },
        { label: "Span", value: "large format, no intermediate columns" },
        { label: "Steel grade", value: "S350, hot-dip galvanised to EN ISO 1461" },
        { label: "Foundation", value: "Concrete or GroundForce screw pile" },
        { label: "Wind and snow load", value: "individual calculations to Eurocode 1" },
        { label: "Warranty", value: "20 years on the structure" },
      ],
      applications: [
        "Logistics and distribution centres",
        "Filling stations and service areas",
        "Campsites and pitch facilities",
        "Agricultural businesses",
        "Hotel and coach parking",
      ],
      body: [
        "With MEGA, vehicle movement drives the design. Clearance height, column spacing and impact protection are chosen so an articulated lorry can enter, manoeuvre and leave without a column getting in the way.",
        "Because the covered area per column is so large, MEGA achieves the highest installed capacity per square metre of site area anywhere in the Solaris programme — and on logistics yards that are already surfaced, it is the most economical route to self-generated power.",
        "On request the roof can be fitted with guttering, lighting and charging infrastructure for electric HGVs. The cable routes run protected inside the profile.",
      ],
    },
    {
      slug: "style",
      name: "STYLE",
      family: "STYLE range",
      teaser: "For large car parks where appearance matters as much as function.",
      seoTitle: "STYLE Photovoltaic Carport for Large Car Parks | Solaris Industrial",
      metaDescription:
        "STYLE by Solaris Industrial: a PV carport for large car parks — appearance and function at scale, with high flexibility for terrain and site layout.",
      intro:
        "The STYLE model is dedicated to large car parks. It combines appearance and function at scale, while offering considerable flexibility in adapting to terrain and site layout.",
      visual: "premium",
      highlights: [
        "A considered elevation for prominent locations",
        "High flexibility for gradients and irregular site boundaries",
        "Continuous roof planes across long parking aisles",
        "Concealed cable routing and drainage",
      ],
      types: [
        {
          code: "Type Y",
          name: "V-column, double row",
          description:
            "A slender Y-column with a split roof plane as the defining design element.",
        },
        {
          code: "Type L2",
          name: "Single-sided, double row",
          description: "A continuous mono-pitch roof over two rows of spaces with a calm roofline.",
        },
      ],
      specs: [
        { label: "Application", value: "large car parks from roughly 100 spaces" },
        { label: "Roof pitch", value: "5°–12°, continuous roofline" },
        { label: "Steel grade", value: "S235 / S350, galvanised, optionally coated" },
        { label: "Foundation", value: "Concrete or GroundForce screw pile" },
        { label: "Drainage", value: "integrated, concealed within the structure" },
        { label: "Warranty", value: "20 years on the structure" },
      ],
      applications: [
        "Shopping centres and retail parks",
        "Corporate headquarters and campus sites",
        "Hospitals and public buildings",
        "Airport and station car parks",
      ],
      body: [
        "STYLE is aimed at sites where the car park forms part of the impression a business makes. The structure presents a calm, continuous roofline; cables, gutters and downpipes disappear into the profile.",
        "At the same time the range stays flexible about the ground it sits on: level changes, curved parking aisles and irregular site boundaries are absorbed through column heights and segment lengths, without breaking the roofline.",
      ],
    },
    {
      slug: "nexus",
      name: "NEXUS",
      family: "NEXUS range",
      teaser: "Premium cover for charging hubs and prominent standalone sites.",
      seoTitle: "NEXUS Premium PV Carport for Charging Hubs | Solaris Industrial",
      metaDescription:
        "NEXUS by Solaris Industrial: a premium PV carport for charging hubs, dealerships and prominent standalone sites — with integrated charging infrastructure.",
      intro:
        "NEXUS is the premium canopy for charging hubs, car dealerships and individual, highly visible sites. The range is engineered for charging infrastructure from the outset: cable routes, sub-distribution and charge points are part of the structure rather than bolted on afterwards.",
      visual: "canopy",
      highlights: [
        "Prepared for AC and DC charge points",
        "Integrated cable routes and sub-distribution",
        "Glare-free lighting in the roof soffit",
        "Compact footprint, high visibility",
      ],
      types: [
        {
          code: "Type T",
          name: "Single column, both sides",
          description: "Compact cover for two charging bays from one central column.",
        },
        {
          code: "Type L",
          name: "Single-sided",
          description: "A cantilevered roof over one row of chargers, with the column at the rear.",
        },
      ],
      specs: [
        { label: "Spaces per unit", value: "1–2 charging bays" },
        { label: "Charging infrastructure", value: "AC up to 22 kW, DC rapid charging prepared" },
        { label: "Lighting", value: "LED in the roof soffit, glare-free" },
        { label: "Steel grade", value: "S235 / S350, galvanised, optionally coated" },
        { label: "Foundation", value: "Concrete or GroundForce screw pile" },
        { label: "Warranty", value: "20 years on the structure" },
      ],
      applications: [
        "Public and semi-public charging hubs",
        "Dealerships and fleet depots",
        "Hotels and hospitality",
        "Corporate headquarters with electric fleets",
      ],
      body: [
        "A charging hub without cover is an incomplete investment: the site is serviced and the grid connection is in place, but no power is being generated on site. NEXUS closes that gap while also providing weather protection, lighting and a visible design feature.",
        "Charge points mount directly onto the column and the cables run inside the profile to the sub-distribution board. That reduces groundworks, keeps the surface free of bollards and makes later expansion with additional charge points straightforward.",
      ],
    },
  ],

  groundForce: {
    title: "GroundForce Foundations",
    subtitle:
      "The screw pile technology from Solaris Industrial removes the biggest obstacles to building on an existing car park: time and disruption to your operation.",
    intro:
      "GroundForce is our foundation technology for photovoltaic carports and ground-mounted structures. Instead of excavation, formwork, reinforcement and curing, the foundation is driven into the ground as a steel screw pile — carrying load from the moment it is seated.",
    benefits: [
      {
        title: "Fast installation",
        body: "Foundations are complete in as little as a day, in any season and even in frost, because there is no concrete that has to cure.",
      },
      {
        title: "Minimal disruption",
        body: "No full closure of the car park, no heavy plant, no deep excavations. Work proceeds section by section and your operation carries on.",
      },
      {
        title: "Load capacity and savings",
        body: "Solid anchorage in undisturbed ground — together with genuine savings in time and cost compared with concrete foundations.",
      },
      {
        title: "Removable and reusable",
        body: "The screw piles can be unwound at the end of the service life. The ground stays unsealed and the material goes back into circulation.",
      },
      {
        title: "No concrete, less CO₂",
        body: "Because no cement is used, the carbon footprint of the foundations falls sharply — a measurable contribution to the project's overall balance.",
      },
      {
        title: "Immediately loadable",
        body: "Work can continue as soon as the pile is driven. There is no waiting period between the foundations and the steelwork.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Ground investigation",
        body: "Probing and assessment of the geotechnical report. This determines the length, diameter and number of screw piles.",
      },
      {
        step: "02",
        title: "Load test",
        body: "Before series installation, one pile is set and tested in tension and compression. The result feeds into the structural calculations.",
      },
      {
        step: "03",
        title: "Driving",
        body: "A compact rig drives the piles precisely to position. No excavation and no spoil to remove.",
      },
      {
        step: "04",
        title: "Survey and sign-off",
        body: "Every position is surveyed and recorded. The steelwork is then erected directly on top.",
      },
    ],
    comparison: {
      caption: "GroundForce compared with conventional concrete foundations",
      headers: {
        criterion: "Criterion",
        groundforce: "GroundForce",
        concrete: "Concrete foundations",
      },
      rows: [
        {
          criterion: "Foundation build time",
          groundforce: "hours to 1 day",
          concrete: "1–3 weeks including curing",
        },
        { criterion: "Excavation", groundforce: "none", concrete: "a pit per foundation point" },
        { criterion: "Load capacity", groundforce: "immediate", concrete: "after curing" },
        {
          criterion: "Weather",
          groundforce: "all year round, even in frost",
          concrete: "restricted in frost and wet conditions",
        },
        {
          criterion: "Car park operation",
          groundforce: "remains usable section by section",
          concrete: "usually full closure of the work area",
        },
        {
          criterion: "Removal",
          groundforce: "unwound and reusable",
          concrete: "demolition and disposal",
        },
        {
          criterion: "CO₂ of the foundations",
          groundforce: "low, no cement",
          concrete: "high, due to cement content",
        },
      ],
    },
    specs: [
      { label: "Material", value: "Structural steel, hot-dip galvanised to EN ISO 1461" },
      { label: "Embedment depth", value: "1.5–3.5 m, depending on ground conditions" },
      {
        label: "Load transfer",
        value: "Compression, tension and horizontal load, verified per project",
      },
      {
        label: "Verification",
        value: "On-site load test, with the result feeding into the structural calculations",
      },
      {
        label: "Applications",
        value: "Carports, ground-mounted arrays, fencing, highways equipment",
      },
      { label: "Removal", value: "Complete, leaving nothing behind in the ground" },
    ],
    cta: {
      title: "Not sure about your ground conditions?",
      body: "Send us your geotechnical report or simply the address of the site. We will check whether GroundForce will carry the load and calculate the saving against concrete foundations.",
      label: "Have your ground assessed",
      href: "/kontakt",
    },
  },

  projectsIntro: {
    title: "Our Projects",
    subtitle:
      "More than 700 carports completed, around 60 MW of installed capacity and roughly 20,000 parking spaces covered. A selection of typical briefs from our reference projects.",
    disclaimer:
      "Note for review: the project texts below describe typical, technically sound briefs and serve as structure. Replace them with real references — photographs, location and client approval — before going live.",
  },

  projects: [
    {
      slug: "logistikzentrum-lkw-ueberdachung",
      title: "HGV canopy at a distribution centre",
      sector: "Logistics",
      location: "North Rhine-Westphalia, Germany",
      year: "2024",
      model: "MEGA Type T",
      metrics: [
        { label: "Capacity", value: "1.8 MWp" },
        { label: "Spaces", value: "96 HGVs" },
        { label: "Build time", value: "11 weeks" },
        { label: "Foundations", value: "GroundForce" },
      ],
      summary:
        "Covering the HGV holding areas of a distribution centre running continuously, 24 hours a day.",
      challenge:
        "The site is used around the clock, so a full closure was out of the question. Clearance height and column spacing also had to be set so articulated lorries could continue to enter and leave without losing manoeuvring room.",
      solution:
        "Installation ran in eight sections, each closed for two days. The GroundForce foundations removed the waiting time entirely, because the steelwork was erected immediately after the piles were driven.",
    },
    {
      slug: "fachmarktzentrum-kundenparkplatz",
      title: "Customer car park at a retail park",
      sector: "Retail",
      location: "Bavaria, Germany",
      year: "2024",
      model: "STYLE Type L2",
      metrics: [
        { label: "Capacity", value: "940 kWp" },
        { label: "Spaces", value: "310" },
        { label: "Build time", value: "8 weeks" },
        { label: "Foundations", value: "GroundForce" },
      ],
      summary:
        "Covering a customer car park with a continuous roofline and integrated drainage.",
      challenge:
        "The car park falls by more than two metres across its length. Even so, the brief called for a calm, continuous roofline that reads as a single surface from the main road.",
      solution:
        "The level change was absorbed entirely through the column heights. Drainage and cable routing run concealed within the profile, and the charge points sit on the columns of the first row.",
    },
    {
      slug: "industriepark-mitarbeiterparkplatz",
      title: "Staff car park at an industrial estate",
      sector: "Industry",
      location: "Saxony, Germany",
      year: "2023",
      model: "EASYPARK Type T",
      metrics: [
        { label: "Capacity", value: "620 kWp" },
        { label: "Spaces", value: "208" },
        { label: "Build time", value: "6 weeks" },
        { label: "Foundations", value: "GroundForce" },
      ],
      summary:
        "A self-consumption array above the staff car park of a manufacturing site running three shifts.",
      challenge:
        "The generation profile needed to be as broad as possible to cover the early and late shifts, rather than producing a single midday peak.",
      solution:
        "An east–west layout on Type T structures. The annual yield is marginally below a purely south-facing array, but the self-consumption share is considerably higher.",
    },
    {
      slug: "kommunale-park-and-ride-anlage",
      title: "Municipal park and ride facility",
      sector: "Public sector",
      location: "Brandenburg, Germany",
      year: "2023",
      model: "BASIC Type L2",
      metrics: [
        { label: "Capacity", value: "410 kWp" },
        { label: "Spaces", value: "145" },
        { label: "Build time", value: "5 weeks" },
        { label: "Foundations", value: "GroundForce" },
      ],
      summary:
        "Covering a park and ride site at a railway station, including lighting and public charge points.",
      challenge:
        "A public tender with a fixed completion date ahead of the timetable change, plus a condition that the ground was to remain unsealed.",
      solution:
        "GroundForce screw piles satisfied the condition on ground sealing and held the programme. The installation was commissioned two weeks ahead of the deadline.",
    },
    {
      slug: "ladepark-autobahnnah",
      title: "Charging hub at a motorway junction",
      sector: "Charging infrastructure",
      location: "Hesse, Germany",
      year: "2025",
      model: "NEXUS Type T",
      metrics: [
        { label: "Capacity", value: "180 kWp" },
        { label: "Charge points", value: "24 DC" },
        { label: "Build time", value: "4 weeks" },
        { label: "Foundations", value: "GroundForce" },
      ],
      summary: "A covered rapid charging hub with cable routes prepared for later expansion.",
      challenge:
        "The charge points were already installed and the grid connection was live. The canopy had to be built over the existing installation without interrupting charging for more than a day per section.",
      solution:
        "Prefabricated frames were set overnight and released for use during the day. Cable routes for a further twelve charge points are already in place within the profile.",
    },
    {
      slug: "landwirtschaftlicher-betrieb-maschinenhalle",
      title: "Canopy for agricultural machinery",
      sector: "Agriculture",
      location: "Lower Saxony, Germany",
      year: "2024",
      model: "MEGA Type L",
      metrics: [
        { label: "Capacity", value: "520 kWp" },
        { label: "Covered area", value: "2,900 m²" },
        { label: "Build time", value: "5 weeks" },
        { label: "Foundations", value: "GroundForce" },
      ],
      summary:
        "Weather protection for agricultural machinery and trailers, combined with a self-consumption array for the business.",
      challenge:
        "A generous clearance height was needed for combine harvesters and trailers, on ground that was soft and uncompacted.",
      solution:
        "Extended GroundForce piles following an on-site load test, with an S350 structure giving 4.50 m of clearance.",
    },
  ],

  knowledgeIntro: {
    title: "Knowledge Base",
    subtitle:
      "Answers to the questions that come up before every carport investment: planning permission, structural design, financial viability, foundations and charging infrastructure.",
  },

  articles: [
    {
      slug: "wirtschaftlichkeit-pv-carport",
      title: "When does a photovoltaic carport pay for itself?",
      category: "Financial viability",
      readingTime: "6 min",
      teaser:
        "Which factors determine the payback period — and why the self-consumption share matters more than the annual yield.",
      seoTitle: "The Financial Case for PV Carports: Calculating Payback Correctly",
      metaDescription:
        "Payback, self-consumption share and levelised cost of energy: the factors that decide whether a photovoltaic carport is financially viable.",
      sections: [
        {
          heading: "Self-consumption is what decides it",
          paragraphs: [
            "The financial case for a carport array depends less on the maximum annual yield than on how much of the generated power is consumed on site. Every kilowatt hour you use yourself replaces one you would have bought — worth the full unit price including network charges and levies. Every kilowatt hour exported, by contrast, earns only the feed-in tariff or the market price.",
            "Businesses that operate during the day therefore see particularly good coverage: the load profile follows the generation curve closely. Add refrigeration, air conditioning or charging infrastructure and the self-consumption share rises further.",
          ],
        },
        {
          heading: "What belongs in the calculation",
          paragraphs: [
            "A reliable financial appraisal needs more than kWp and capital cost. You should capture the following:",
          ],
          bullets: [
            "Annual electricity consumption and load profile in quarter-hourly values",
            "The current unit rate and capacity charge in your supply contract",
            "Orientation, pitch and shading of the parking area",
            "Expected self-consumption share, with and without storage",
            "Grid connection capacity and the cost of any upgrade",
            "Foundation type — concrete foundations can account for a substantial share of the build cost",
          ],
        },
        {
          heading: "East–west or south?",
          paragraphs: [
            "A south-facing layout delivers the highest annual yield but concentrates it around midday. An east–west layout generates a few per cent less over the year, but spreads generation across the morning and afternoon. For businesses with long operating hours or shift patterns, the east–west option often produces the better financial result despite the lower yield, because the self-consumption share increases.",
          ],
        },
        {
          heading: "The site earns twice",
          paragraphs: [
            "A carport does not only generate electricity. It shelters vehicles from hail, snow and sun, reduces the heat build-up typical of hard-surfaced areas and makes the space more pleasant to use. None of this appears in a yield forecast, but all of it forms part of the investment decision — particularly where customers or staff use the car park.",
          ],
        },
      ],
    },
    {
      slug: "genehmigung-baurecht-carport",
      title: "Planning permission and building regulations for PV carports",
      category: "Law & permitting",
      readingTime: "5 min",
      teaser:
        "What has to be settled in planning terms before the first column goes up — and which documents the authority expects.",
      seoTitle: "Planning Permission for Photovoltaic Carports: Regulations and Documents",
      metaDescription:
        "Planning permission, parking bylaws, drainage and structural verification: what to settle before building a PV carport.",
      sections: [
        {
          heading: "Permission is normally required",
          paragraphs: [
            "A photovoltaic carport is a building structure. Unlike an array mounted on an existing roof, it therefore requires planning permission in almost all cases. The local building control authority is responsible, and the applicable rules come from the state building code, the local development plan and any local bylaws.",
            "The type of procedure — simplified, full permission or exemption — varies by federal state and by the size of the installation. An early pre-application enquiry to the authority usually saves more time than it costs.",
          ],
        },
        {
          heading: "Documents you will need",
          paragraphs: ["A planning application typically requires:"],
          bullets: [
            "A site plan showing boundaries, separation distances and existing structures",
            "Plans, elevations and sections of the structure",
            "Verifiable structural calculations to Eurocode",
            "Evidence on drainage and infiltration of rainwater",
            "Details of fire safety and escape routes, depending on size and use",
            "For screw piles: evidence on ground conditions and the load test",
          ],
        },
        {
          heading: "Frequently underestimated: drainage and ground sealing",
          paragraphs: [
            "A carport roof collects rainfall across a large area and discharges it at concentrated points. Many local authorities therefore require evidence of attenuation or infiltration. Where ground sealing is restricted, the choice of foundation can become decisive: screw piles seal virtually no ground and are often viewed favourably by authorities.",
          ],
        },
        {
          heading: "Settle the grid connection in parallel",
          paragraphs: [
            "Separately from planning law, the installation must be registered with the network operator. Above certain capacity thresholds, a grid impact assessment and possibly an upgrade to the connection are required. Because processing times here are often longer than the planning procedure itself, registration should run in parallel rather than in sequence.",
          ],
        },
      ],
    },
    {
      slug: "statik-schnee-und-windlast",
      title: "Structural design: snow and wind loads on a carport",
      category: "Engineering",
      readingTime: "5 min",
      teaser:
        "Why every carport is calculated for its specific site, and what snow load zones mean for the structure.",
      seoTitle: "Structural Design of PV Carports: Snow Load, Wind Load and Eurocode",
      metaDescription:
        "Snow load zones, wind zones, Eurocode 1 and verifiable calculations: how the load-bearing structure of a PV carport is designed.",
      sections: [
        {
          heading: "There is no such thing as standard structural design",
          paragraphs: [
            "Two identical carports on two different sites have different structures. What governs is the snow load zone, the height above sea level, the wind zone and the surrounding buildings. A carport in snow load zone 3 in the Alpine foothills carries many times the load of an identical carport on the North German Plain.",
            "Design follows Eurocode 1 together with the national annexes. The result is a verifiable structural safety case that forms part of the planning application.",
          ],
        },
        {
          heading: "Load cases taken into account",
          paragraphs: [],
          bullets: [
            "Self-weight of the structure and the modules",
            "Snow load including drifting and accumulation at roof edges",
            "Wind load: pressure and suction, including on the cantilevered areas",
            "Thermal effects and the resulting change in length",
            "For commercial vehicle canopies: impact and collision loads on the columns",
          ],
        },
        {
          heading: "Why the module layout affects the structure",
          paragraphs: [
            "Modules are not simply added weight; they change how air flows over the roof. A closed module surface behaves aerodynamically quite differently from one with gaps. The layout is therefore fixed before the structural calculations are carried out — adding modules later is only permissible if the calculations show reserve capacity for it.",
          ],
        },
        {
          heading: "Corrosion protection is part of load capacity",
          paragraphs: [
            "A structure is only as durable as its corrosion protection. Solaris Industrial hot-dip galvanises every structure to EN ISO 1461. Near the coast, where de-icing salt is used, or in an industrial atmosphere, the coating thickness is increased to match the corrosivity category, or an additional coating is applied.",
          ],
        },
      ],
    },
    {
      slug: "schraubfundament-oder-beton",
      title: "Screw piles or concrete foundations?",
      category: "Foundations",
      readingTime: "4 min",
      teaser:
        "A comparison of the two foundation types by build time, cost, ground conditions and removal.",
      seoTitle: "Screw Piles or Concrete: PV Carport Foundations Compared",
      metaDescription:
        "Build time, cost, ground requirements and removal: when screw piles are worthwhile and when concrete foundations are the right choice.",
      sections: [
        {
          heading: "The foundations set the programme",
          paragraphs: [
            "On a carport project, a substantial share of the build time goes into the foundations. Concrete foundations require excavation, formwork, reinforcement, pouring and curing — weeks in total, during which the work area is closed. A screw pile carries load as soon as it is driven.",
            "For operators whose car park is needed while work is under way, this is often the decisive point — ahead of material costs alone.",
          ],
        },
        {
          heading: "When screw piles are the right choice",
          paragraphs: [],
          bullets: [
            "Competent, probeable ground without continuous rock or concrete layers",
            "A car park in active use that cannot be closed completely",
            "Conditions on ground sealing, or a time-limited right to use the site",
            "A tight programme, particularly over the winter months",
            "Installations intended to be removed or relocated later",
          ],
        },
        {
          heading: "When concrete still makes sense",
          paragraphs: [
            "Where the ground has very low bearing capacity, where there is contamination or rubble below the surface, or where services run beneath the area and must not be pierced, concrete foundations remain the right solution. Concrete can also be more economical under extreme tension and horizontal loads.",
            "The decision is not made at a desk, but after probing and a load test on site.",
          ],
        },
      ],
    },
    {
      slug: "ladeinfrastruktur-am-carport",
      title: "Planning charging infrastructure at a carport",
      category: "Charging infrastructure",
      readingTime: "5 min",
      teaser:
        "How grid connection, load management and cable routing work together — and what should be built in from the start.",
      seoTitle: "Charging Infrastructure at a PV Carport: Grid Connection and Load Management",
      metaDescription:
        "Grid connection, load management, cable routes and expandability: what matters when planning charge points at a photovoltaic carport.",
      sections: [
        {
          heading: "Carport and charge point belong together",
          paragraphs: [
            "A carport generates electricity exactly where vehicles are parked, which makes combining the canopy with charge points an obvious step: the distance from generation to consumption is short, the self-consumption share rises, and the charging equipment is sheltered at the same time.",
            "The prerequisite is that cable routes are planned in from the beginning. Cables laid retrospectively mean groundworks on a finished surface — the most expensive route to a charge point.",
          ],
        },
        {
          heading: "The grid connection is the bottleneck",
          paragraphs: [
            "In practice it is rarely the roof area that limits the installation, but the grid connection. Before planning begins, establish what connection capacity is available and what an upgrade would cost.",
            "Static or dynamic load management distributes the available capacity across the charge points and prevents the peaks that drive up the capacity charge. In many cases this is more economical than a larger grid connection.",
          ],
        },
        {
          heading: "What to build in from the start",
          paragraphs: [],
          bullets: [
            "Ducting and cable routes sized for the planned final build-out, not just the first phase",
            "A generously sized sub-distribution board with spare ways",
            "Foundations or connection points for DC chargers to be added later",
            "A data connection for billing, load management and monitoring",
            "Impact protection on columns in manoeuvring areas",
          ],
        },
        {
          heading: "Storage: worthwhile, but not always necessary",
          paragraphs: [
            "A battery increases the self-consumption share and shaves peak loads. Whether it pays depends on the load profile: where consumption already falls during the day, the added benefit is small. Where charging happens in the evening, or where the capacity charge is high, storage can shorten the payback period considerably.",
          ],
        },
      ],
    },
    {
      slug: "ablauf-eines-carport-projekts",
      title: "How a carport project runs",
      category: "Project process",
      readingTime: "4 min",
      teaser:
        "From first enquiry to handover: the phases of a carport project and what is decided in each one.",
      seoTitle: "How a PV Carport Project Runs: From Enquiry to Handover",
      metaDescription:
        "The phases of a photovoltaic carport project: analysis, engineering, permitting, fabrication, foundations, installation and handover.",
      sections: [
        {
          heading: "Phase 1 — Analysis and outline planning",
          paragraphs: [
            "It starts with the site and the load profile. We need a site plan or aerial image, the number of spaces, annual electricity consumption and, if available, the geotechnical report. From these we produce a layout proposal, a yield forecast and an initial cost estimate.",
          ],
        },
        {
          heading: "Phase 2 — Engineering, structural design and permitting",
          paragraphs: [
            "Once the concept is approved, detailed design follows with verifiable structural calculations. The planning application and the registration with the network operator run in parallel. This phase largely determines the overall programme.",
          ],
        },
        {
          heading: "Phase 3 — Fabrication",
          paragraphs: [
            "The structure is cut, welded and hot-dip galvanised in our own works. Fabrication and welding are certified to EN 1090-1 and ISO 3834-2, and every batch is documented.",
          ],
        },
        {
          heading: "Phase 4 — Foundations and installation",
          paragraphs: [
            "The foundations are set, then the frames, purlins and modules are installed. Work proceeds section by section so the area stays largely usable. Electrical installation and the grid connection follow immediately.",
          ],
        },
        {
          heading: "Phase 5 — Sign-off and operation",
          paragraphs: [
            "After commissioning we hand over the completion certificate, inspection report and full documentation. Maintenance and monitoring are available on request; the structure itself is covered by a 20-year warranty.",
          ],
        },
      ],
    },
  ],

  contact: {
    title: "Contact",
    subtitle:
      "Tell us which area you want to cover. You will receive an initial assessment from us including a layout proposal, a yield forecast and an indicative budget.",
    formTitle: "Project enquiry",
    requiredNote: "Fields marked * are required.",
    needFromYouTitle: "What we need from you",
    needFromYou: [
      "A site plan or aerial image of the area",
      "The number of spaces and the types of vehicle",
      "Annual electricity consumption or load profile, if available",
      "A geotechnical report, if available",
      "Your target completion date",
    ],
    needFromYouNote:
      "Missing something? Not a problem — send what you have and we will work out the rest together.",
    directTitle: "Direct contact",
    addressTitle: "Address",
    channelLabels: {
      email: "E-mail",
      phone: "Phone",
      address: "Address",
      hours: "Availability",
    },
  },

  form: {
    name: "Name *",
    company: "Company",
    email: "E-mail *",
    phone: "Phone",
    location: "Location of the site",
    spaces: "Number of spaces",
    message: "Your project *",
    namePlaceholder: "First and last name",
    companyPlaceholder: "Company name",
    emailPlaceholder: "name@company.com",
    phonePlaceholder: "+44 …",
    locationPlaceholder: "Postcode and town",
    spacesPlaceholder: "e.g. 120",
    messagePlaceholder:
      "Briefly describe the site, the types of vehicle and your target completion date.",
    consent:
      "By submitting this form you consent to your details being processed in order to handle your enquiry. Full details are set out in our privacy notice.",
    submit: "Send enquiry",
    submitting: "Sending …",
    errorMessage:
      "Your enquiry could not be sent. Please try again, or e-mail us directly.",
    successTitle: "Enquiry sent.",
    successBody:
      "Thank you. We will come back to you within one working day with an initial assessment of your site.",
  },

  faq: [
    {
      question: "How long does a carport project take overall?",
      answer:
        "From approval of the concept to commissioning, typically four to seven months. The largest share is not the installation but the planning permission and the grid connection — both should be started as early as possible.",
    },
    {
      question: "Does the car park have to close during construction?",
      answer:
        "Usually not completely. We install section by section, and GroundForce screw piles remove both excavation and curing time, so a section can normally be reopened within a few days.",
    },
    {
      question: "Do you supply the photovoltaic equipment as well?",
      answer:
        "We supply the structure, the foundations and the installation, and work with established partners for modules, inverters and electrical installation. On request we take on overall coordination through to commissioning.",
    },
    {
      question: "What warranty do you give on the structure?",
      answer:
        "20 years on the steel structure. Fabrication is certified to EN 1090-1 and ISO 3834-2, and corrosion protection is by hot-dip galvanising to EN ISO 1461.",
    },
    {
      question: "Can screw piles be used on any ground?",
      answer:
        "No. They require competent ground that can be probed. Before series installation we set a test pile and check it in tension and compression. If the result is negative, we redesign for concrete foundations.",
    },
    {
      question: "Can existing car parks be covered retrospectively?",
      answer:
        "Yes, and that is the normal case. Existing surfacing, markings and drainage are surveyed and carried into the design. Column grids are positioned so the existing bay layout is preserved.",
    },
  ],

  ui: {
    eyebrowProducts: "Products",
    eyebrowTechnology: "Technology",
    eyebrowReferences: "References",
    eyebrowKnowledge: "Knowledge",
    eyebrowContact: "Contact",
    eyebrowWhy: "Why Solaris",
    eyebrowProcess: "Process",
    eyebrowAdvantages: "Advantages",
    eyebrowComparison: "Comparison",
    eyebrowSpecs: "Technical data",
    eyebrowFaq: "FAQ",

    requestProject: "Request a project",
    allModels: "All models",
    allProjects: "All projects",
    toKnowledgeBase: "Go to knowledge base",
    groundForceDetail: "GroundForce in detail",
    details: "Details",
    read: "Read",
    readArticle: "Read article",
    viewProject: "View project",
    technicalData: "Technical data",
    overview: "Overview",
    backToKnowledge: "Back to knowledge base",
    moreArticles: "More articles",
    otherModels: "Other ranges",
    viewModels: "View ranges",

    roofTypes: "Available roof types",
    typicalApplications: "Typical applications",
    inUse: "{model} in use",
    elevationNote: "Schematic side elevation · not to scale",
    readingTime: "read",

    challenge: "The brief",
    solution: "The solution",
    modelUsed: "Range used",

    faqTitle: "Frequently asked questions",
    faqSubtitle: "The questions we are asked most often before a project enquiry.",

    vehiclePkw: "Cars",
    vehicleLkw: "HGVs",
    vehicleStorage: "Storage",

    customBuildTitle: "Bespoke",
    customBuildBody:
      "An unusual site boundary, exceptional loads or an architectural requirement? We will engineer the installation entirely to your specification.",
    customBuildCta: "Make an enquiry",

    homeCarportsTitle: "Five ranges for any car park",
    homeCarportsSubtitle:
      "From a single row of staff parking to a covered HGV holding area — every range is available in roof types T, Y, L and L2, and extends to any length.",
    homeGroundForceTitle: "Foundations in a day — without concrete",
    homeWhyTitle: "A manufacturer, not just a supplier",
    homeWhySubtitle:
      "We calculate, engineer, fabricate and install in house. That shortens the chain, makes dates binding and keeps responsibility in one place.",
    homeProcessTitle: "From bare site to working installation",
    homeProcessSubtitle:
      "Five phases, one point of contact. Permitting and the grid connection run alongside the engineering, not after it.",
    homeProjectsTitle: "References across industry, retail and logistics",
    homeProjectsSubtitle:
      "More than 700 carports completed, around 60 MW of installed capacity and roughly 20,000 parking spaces covered.",
    homeKnowledgeTitle: "Answers before you invest",
    homeKnowledgeSubtitle:
      "Permitting, structural design, financial viability and foundations — the questions that precede every carport project.",

    ctaTitle: "Which area do you want to cover?",
    ctaBody:
      "Send us a site plan and the number of spaces. You will receive an initial assessment including a layout proposal, a yield forecast and an indicative budget.",
    ctaLabel: "Request a project",
    carportsCtaTitle: "Not sure which range fits?",
    carportsCtaBody:
      "Tell us the number of spaces, the types of vehicle and how the parking aisle is oriented. We will propose the right range and calculate the yield.",
    carportsCtaLabel: "Request advice",
    modelCtaTitle: "Design {model} for your site",
    modelCtaBody:
      "We assess the snow load zone, wind zone, ground conditions and parking grid, and design the structure specifically for your site.",
    projectsCtaTitle: "Planning something similar?",
    projectsCtaBody:
      "We are happy to show you references from your sector and to put you in touch with operators who have covered a comparable site.",
    projectsCtaLabel: "Request references",
    knowledgeCtaTitle: "Question not answered?",
    knowledgeCtaBody:
      "Write to us with your specific question. You will get a technical answer from our engineering or project development team — not from sales.",
    knowledgeCtaLabel: "Ask a question",

    footerNav: "Navigation",
    footerModels: "Ranges",
    footerContact: "Contact",
    rightsReserved: "All rights reserved.",

    openMenu: "Open menu",
    closeMenu: "Close menu",
    homeLinkLabel: "Solaris Industrial – home",
    languageLabel: "Language",

    notFoundTitle: "This page does not exist.",
    notFoundBody:
      "The content you requested has moved or no longer exists. From the home page you can reach every range, project and technical article.",
    notFoundHome: "Go to home page",
    notFoundContact: "Get in touch",
  },

  legal: {
    impressum: {
      title: "Legal Notice",
      subtitle: "Information pursuant to § 5 DDG (German Digital Services Act).",
      placeholder:
        "Placeholder: the details below must be replaced with the company's actual particulars (legal form, registry court, commercial register number, VAT identification number and authorised representatives) before going live.",
      providerTitle: "Provider",
      contactTitle: "Contact",
      sections: [
        {
          heading: "Liability for content",
          body: "As a service provider we are responsible for our own content on these pages under general law. However, we are not obliged to monitor third-party information transmitted or stored here, or to investigate circumstances that indicate unlawful activity.",
        },
        {
          heading: "Liability for links",
          body: "Our site contains links to external third-party websites over whose content we have no influence. Responsibility for the content of linked pages always rests with the respective provider or operator.",
        },
        {
          heading: "Copyright",
          body: "Content and works created by the site operator on these pages are subject to German copyright law. Third-party contributions are identified as such.",
        },
      ],
    },
    privacy: {
      title: "Privacy Notice",
      subtitle: "Information on the processing of personal data pursuant to Art. 13 GDPR.",
      placeholder:
        "Placeholder: this notice describes the current technical state of the website. Before going live it must be reviewed legally and extended to cover every service actually used, all processors and the applicable retention periods.",
      controllerTitle: "Controller",
      sections: [
        {
          heading: "Visiting the website",
          body: [
            "When you visit this website, the hosting provider processes technically necessary connection data such as your IP address, the time of the request, the resource requested and the volume of data transferred. The legal basis is Art. 6(1)(f) GDPR; the legitimate interest lies in the secure and stable operation of the website.",
          ],
        },
        {
          heading: "Contact and project enquiries",
          body: [
            "If you use the enquiry form, we process the details you provide (name, e-mail address and, optionally, company, telephone number, location and number of spaces, together with your message) solely in order to handle your enquiry. The legal basis is Art. 6(1)(b) GDPR for pre-contractual steps, and otherwise Art. 6(1)(f) GDPR.",
            "Enquiries are transmitted via an e-mail service provider acting as a processor. The data is deleted once it is no longer required to handle the enquiry and no statutory retention obligations apply.",
          ],
        },
        {
          heading: "Fonts",
          body: [
            "The fonts used are served from our own server when the page loads. Your browser does not connect to any third-party server for this purpose.",
          ],
        },
        {
          heading: "Cookies and analytics",
          body: [
            "This website sets no cookies for analytics or marketing purposes, so no consent banner is required. Should an analytics service be introduced in future, this notice will be updated accordingly.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You have the right of access, rectification, erasure, restriction of processing, data portability and objection. You also have the right to lodge a complaint with a data protection supervisory authority.",
          ],
        },
      ],
    },
  },
};

// Lead Finder agent — runs on a schedule, searches a broad/general mix of
// local business categories and regions via Google Places, audits each
// business's website for "outdated" signals, and opens a GitHub Issue (the
// lead board) for every qualifying prospect with whatever contact info it
// found. Pure read/research — never contacts anyone.
//
// Runs config.leadSearchesPerRun distinct category+region searches per
// invocation (instead of just one) — that's the main lever for sourcing
// enough leads/day to keep the outreach agent's real-send volume up.

import { config, requireFields } from "../config.mjs";
import { searchPlaces, getPlaceDetails, pickRandom } from "../lib/places.mjs";
import { auditWebsite, isOutdated, guessContactEmail } from "../lib/siteAudit.mjs";
import { findIssueByTitle, createIssue, ensureLabelsExist } from "../lib/github.mjs";
import { getTodayProgress, pacingMultiplier } from "../lib/dailyPace.mjs";

const LABELS = ["lead", "status:new", "status:needs-contact-info"];
const OPTIONAL_LABELS = ["contact:guessed"];

function issueTitleFor(name, address) {
  return `[Lead] ${name} — ${address || "address unknown"}`;
}

function issueBody({ name, address, phone, website, audit, query, guessedEmail }) {
  const lines = [
    `**Source query:** ${query}`,
    "",
    `- **Business:** ${name}`,
    `- **Address:** ${address || "unknown"}`,
    `- **Phone:** ${phone || "unknown"}`,
    `- **Website:** ${website || "none found"}`,
  ];
  if (audit) {
    lines.push(
      `- **Website audit score:** ${audit.score}/100 (higher = more outdated)`,
      `- **Issues found:**`,
      ...audit.issues.map((i) => `  - ${i}`)
    );
    if (audit.emails?.length) {
      lines.push(`- **Emails found on site:** ${audit.emails.join(", ")}`);
    } else if (guessedEmail) {
      lines.push(
        `- **Guessed email (unverified):** ${guessedEmail} — no real address found on site, single info@ pattern guess`
      );
    }
  } else {
    lines.push("- **Website audit:** no website at all — strong lead (needs a site built from scratch).");
  }
  lines.push(
    "",
    "_Opened automatically by the GunaFix Lead Finder agent. Moves status:new → status:contacted once the outreach agent sends an email. Add an email manually (or wait for outreach agent to find one) if status is `status:needs-contact-info`._"
  );
  return lines.join("\n");
}

async function runQuery(category, region) {
  const query = `${category} in ${region}`;
  console.log(`[leadFinder] searching: "${query}"`);

  let results;
  try {
    results = await searchPlaces(query);
  } catch (err) {
    console.error(`[leadFinder] search failed for "${query}": ${err.message}`);
    return 0;
  }

  console.log(`[leadFinder] ${results.length} places found for "${query}", scanning up to ${config.leadsPerRun}`);

  let created = 0;
  for (const place of results.slice(0, config.leadsPerRun)) {
    const name = place.name;
    try {
      const existing = await findIssueByTitle(issueTitleFor(name, place.formatted_address), "lead");
      if (existing) {
        console.log(`[leadFinder] skip "${name}" — already tracked (#${existing.number})`);
        continue;
      }

      const details = await getPlaceDetails(place.place_id);
      const website = details.website;
      const phone = details.formatted_phone_number || details.international_phone_number;
      const address = details.formatted_address;

      let audit = null;
      let qualifies = false;

      if (!website) {
        qualifies = true; // no website at all is the strongest possible lead
      } else {
        audit = await auditWebsite(website);
        qualifies = isOutdated(audit);
      }

      if (!qualifies) {
        console.log(`[leadFinder] skip "${name}" — website looks fine`);
        continue;
      }

      // No real email scraped off the site — fall back to a single info@domain
      // guess so the lead isn't stuck unreachable forever. Lower confidence
      // than a scraped address (more likely to bounce), so it's flagged with
      // its own label for visibility rather than treated the same.
      const guessedEmail = website && !audit?.emails?.length ? guessContactEmail(website) : null;

      const labels = [...LABELS];
      if (audit?.emails?.length || guessedEmail) {
        labels.splice(labels.indexOf("status:needs-contact-info"), 1, "status:new");
      }
      if (guessedEmail) labels.push("contact:guessed");

      await createIssue({
        title: issueTitleFor(name, address),
        body: issueBody({ name, address, phone, website, audit, query, guessedEmail }),
        labels,
      });
      created++;
      console.log(`[leadFinder] created lead issue for "${name}"`);
    } catch (err) {
      console.error(`[leadFinder] error processing "${name}": ${err.message}`);
    }
  }

  console.log(`[leadFinder] "${query}" done — ${created} new lead(s)`);
  return created;
}

async function run() {
  if (!requireFields(config, ["googlePlacesApiKey"], "leadFinder")) return;
  if (!requireFields(config, ["githubToken", "githubRepo"], "leadFinder (github)")) return;

  await ensureLabelsExist([...LABELS, ...OPTIONAL_LABELS]);

  let searchesThisRun = config.leadSearchesPerRun;
  try {
    const progress = await getTodayProgress();
    const multiplier = pacingMultiplier(progress);
    searchesThisRun = Math.max(1, Math.round(config.leadSearchesPerRun * multiplier));
    if (multiplier > 1) {
      console.log(
        `[leadFinder] behind daily pace (${progress.sentToday}/${progress.target} sent today) — searching harder this run: ${searchesThisRun} search(es) (x${multiplier.toFixed(2)})`
      );
    }
  } catch (err) {
    console.error(`[leadFinder] could not read daily pace, using default search count: ${err.message}`);
  }

  let totalCreated = 0;
  for (let i = 0; i < searchesThisRun; i++) {
    const category = pickRandom(config.leadCategories, 1)[0];
    const region = pickRandom(config.leadRegions, 1)[0];
    totalCreated += await runQuery(category, region);
  }

  console.log(`[leadFinder] done — ${totalCreated} new lead(s) created across ${searchesThisRun} search(es)`);
}

run().catch((err) => {
  console.error("[leadFinder] fatal error:", err);
  process.exitCode = 1;
});

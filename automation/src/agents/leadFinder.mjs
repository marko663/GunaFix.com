// Lead Finder agent — runs on a schedule, searches a broad/general mix of
// local business categories and regions via Google Places, audits each
// business's website for "outdated" signals, and opens a GitHub Issue (the
// lead board) for every qualifying prospect with whatever contact info it
// found. Pure read/research — never contacts anyone.

import { config, requireFields } from "../config.mjs";
import { searchPlaces, getPlaceDetails, pickRandom } from "../lib/places.mjs";
import { auditWebsite, isOutdated } from "../lib/siteAudit.mjs";
import { findIssueByTitle, createIssue, ensureLabelsExist } from "../lib/github.mjs";

const LABELS = ["lead", "status:new", "status:needs-contact-info"];

function issueTitleFor(name, address) {
  return `[Lead] ${name} — ${address || "address unknown"}`;
}

function issueBody({ name, address, phone, website, audit, query }) {
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
    }
  } else {
    lines.push("- **Website audit:** no website at all — strong lead (needs a site built from scratch).");
  }
  lines.push(
    "",
    "_Opened automatically by the GunaFix Lead Finder agent. Move through status:new → status:drafted → status:contacted as it progresses. Add an email manually (or wait for outreach agent to find one) if status is `status:needs-contact-info`._"
  );
  return lines.join("\n");
}

async function run() {
  if (!requireFields(config, ["googlePlacesApiKey"], "leadFinder")) return;
  if (!requireFields(config, ["githubToken", "githubRepo"], "leadFinder (github)")) return;

  await ensureLabelsExist(LABELS);

  const category = pickRandom(config.leadCategories, 1)[0];
  const region = pickRandom(config.leadRegions, 1)[0];
  const query = `${category} in ${region}`;
  console.log(`[leadFinder] searching: "${query}"`);

  let results;
  try {
    results = await searchPlaces(query);
  } catch (err) {
    console.error(`[leadFinder] search failed: ${err.message}`);
    return;
  }

  console.log(`[leadFinder] ${results.length} places found, scanning up to ${config.leadsPerRun}`);

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

      const labels = [...LABELS];
      if (audit?.emails?.length) {
        labels.splice(labels.indexOf("status:needs-contact-info"), 1, "status:new");
      }

      await createIssue({
        title: issueTitleFor(name, address),
        body: issueBody({ name, address, phone, website, audit, query }),
        labels,
      });
      created++;
      console.log(`[leadFinder] created lead issue for "${name}"`);
    } catch (err) {
      console.error(`[leadFinder] error processing "${name}": ${err.message}`);
    }
  }

  console.log(`[leadFinder] done — ${created} new lead(s) created from "${query}"`);
}

run().catch((err) => {
  console.error("[leadFinder] fatal error:", err);
  process.exitCode = 1;
});

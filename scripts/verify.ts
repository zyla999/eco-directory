/**
 * Store Verification Agent
 *
 * This script verifies that stores in the directory are still active:
 * - Checks if store websites are still accessible
 * - Updates lastVerifiedAt dates for active stores
 * - Marks stores as "needs-review" if issues are detected
 *
 * Run: npx ts-node scripts/verify.ts
 */

import { getAllStores, updateStore, checkWebsite, formatDate } from "./utils";

const VERIFICATION_THRESHOLD_DAYS = 30;

async function verifyStores() {
  console.log("Starting store verification...\n");

  const stores = getAllStores();
  const today = new Date();

  let verified = 0;
  let needsReview = 0;
  let skipped = 0;

  for (const store of stores) {
    // Skip stores that were recently verified
    const lastVerified = new Date(store.lastVerifiedAt);
    const daysSinceVerification = Math.floor(
      (today.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVerification < VERIFICATION_THRESHOLD_DAYS) {
      console.log(
        `⏭️  ${store.name} - verified ${daysSinceVerification} days ago, skipping`
      );
      skipped++;
      continue;
    }

    // Check if website is accessible
    if (store.website) {
      console.log(`🔍 Checking ${store.name}...`);
      const isAccessible = await checkWebsite(store.website);

      if (isAccessible) {
        updateStore(store.id, {
          lastVerifiedAt: formatDate(),
          status: "active",
        });
        console.log(`✅ ${store.name} - verified`);
        verified++;
      } else {
        updateStore(store.id, {
          status: "needs-review",
        });
        console.log(`⚠️  ${store.name} - website not accessible, needs review`);
        needsReview++;
      }
    } else {
      // No website to check, just update verification date
      updateStore(store.id, {
        lastVerifiedAt: formatDate(),
      });
      console.log(`✅ ${store.name} - no website, marked as verified`);
      verified++;
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n--- Verification Summary ---");
  console.log(`Total stores: ${stores.length}`);
  console.log(`Verified: ${verified}`);
  console.log(`Needs review: ${needsReview}`);
  console.log(`Skipped (recently verified): ${skipped}`);
}

verifyStores().catch(console.error);

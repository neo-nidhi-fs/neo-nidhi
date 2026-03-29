import { User } from '@/models/User';
import { dbConnect } from '@/lib/dbConnect';

/**
 * Migration script to add finance arrays to existing users
 * Run this script to ensure all users have the new finance fields initialized
 *
 * Usage: npx ts-node src/lib/financeMigration.ts
 */

async function migrationRunner() {
  try {
    await dbConnect();
    console.log('✓ Connected to database');

    // Find all users without finance arrays
    const usersToUpdate = await User.find({
      $or: [
        { assetPortfolio: { $exists: false } },
        { liabilities: { $exists: false } },
        { cashFlows: { $exists: false } },
      ],
    });

    console.log(`Found ${usersToUpdate.length} users to migrate...`);

    if (usersToUpdate.length === 0) {
      console.log(
        '✓ All users already have finance fields. No migration needed.'
      );
      process.exit(0);
    }

    // Update users with empty arrays
    const result = await User.updateMany(
      {
        $or: [
          { assetPortfolio: { $exists: false } },
          { liabilities: { $exists: false } },
          { cashFlows: { $exists: false } },
        ],
      },
      {
        $set: {
          assetPortfolio: [],
          liabilities: [],
          cashFlows: [],
        },
      }
    );

    console.log(`✓ Migration complete!`);
    console.log(`  - Updated: ${result.modifiedCount} users`);
    console.log(`  - Matched: ${result.matchedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

// Only run if this is the main module
if (require.main === module) {
  migrationRunner();
}

export async function runFinanceMigration() {
  return migrationRunner();
}

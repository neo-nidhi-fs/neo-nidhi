import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { dbConnect } from '@/lib/dbConnect';

/**
 * Migration script to move cashFlows from User documents into CashFlow collection
 * and normalize asset/liability fields for users who missed them.
 *
 * Usage: npx ts-node src/lib/financeMigration.ts
 */

async function migrationRunner() {
  try {
    await dbConnect();
    console.log('✓ Connected to database');

    // 1) Normalize asset/liability fields if missing, from prior migration requirement
    const assetLiabilityResult = await User.updateMany(
      {
        $or: [
          { assetPortfolio: { $exists: false } },
          { liabilities: { $exists: false } },
        ],
      },
      {
        $set: {
          assetPortfolio: [],
          liabilities: [],
        },
      }
    );

    console.log(
      `✓ Normalized asset/liability for ${assetLiabilityResult.modifiedCount} users`
    );

    // 2) Migrate existing embedded cashFlows to dedicated collection.
    const userCashFlowCursor = User.collection.find(
      { cashFlows: { $exists: true, $ne: [] } },
      { projection: { _id: 1, cashFlows: 1 } }
    );

    const migrationStats = {
      usersProcessed: 0,
      cashFlowsMigrated: 0,
      usersCleared: 0,
    };

    while (await userCashFlowCursor.hasNext()) {
      const userDoc = await userCashFlowCursor.next();
      if (!userDoc || !userDoc._id || !userDoc.cashFlows?.length) continue;

      migrationStats.usersProcessed += 1;

      const cashFlowDocs = userDoc.cashFlows.map((cf: any) => ({
        user: userDoc._id,
        date: cf.date ? new Date(cf.date) : new Date(),
        type: cf.type,
        category: cf.category,
        amount: cf.amount,
        source: cf.source,
        note: cf.note || null,
        createdAt: cf.createdAt ? new Date(cf.createdAt) : new Date(),
        updatedAt: cf.updatedAt ? new Date(cf.updatedAt) : new Date(),
      }));

      if (cashFlowDocs.length > 0) {
        await CashFlow.insertMany(cashFlowDocs, { ordered: false });
        migrationStats.cashFlowsMigrated += cashFlowDocs.length;
      }

      await User.updateOne({ _id: userDoc._id }, { $unset: { cashFlows: '' } });
      migrationStats.usersCleared += 1;
    }

    console.log(
      `✓ Migration complete: ${migrationStats.usersProcessed} users processed, ${migrationStats.cashFlowsMigrated} cash flows moved, ${migrationStats.usersCleared} users cleared.`
    );
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

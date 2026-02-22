import 'dotenv/config';
import { dbConnect } from './dbConnect';
import { User } from '@/models/User';

// User data to restore - maintains original _id and all financial info
const usersToRestore = [
  {
    _id: '6968ec6969f05f6e2f915998',
    name: 'Admin',
    age: 32,
    role: 'admin',
    savingsBalance: 1021.1712328767123,
    loanBalance: 1002.3013698630137,
    transactions: [],
    password: '$2b$10$tSG.sjeZTsE.1Rj.zJGtx.I0K0d7rJiHzG1raNmljxmMgQNyTp4J2',
    createdAt: '2026-01-17T13:56:40.876Z',
    fd: 20052.602739863014,
    accruedFdInterest: 92.29691124101329,
    accruedLoanInterest: 6.9199984987802585,
    accruedSavingInterest: 2.052399605929818,
    lastInterestCalc: null,
  },
  {
    _id: '696a38f7c47424d1fd815d25',
    name: 'Shrithik',
    age: 9,
    role: 'user',
    savingsBalance: 44.99961712328766,
    fd: 385.53931505958906,
    loanBalance: 0,
    transactions: [],
    password: '$2b$10$B0PdxskGdsabz2VtWPJxtuoo8psNyZoPawLUwfxww./0MJLcY4oVC',
    createdAt: '2026-01-16T13:11:19.186Z',
    lastInterestCalc: '2026-01-18T06:23:38.163Z',
    accruedSavingInterest: 0.1352315577688122,
    accruedFdInterest: 1.2610028747948205,
    accruedLoanInterest: 0,
  },
  {
    _id: '696a3975f09dd3ec599b6b31',
    name: 'Vijayakumar',
    age: 65,
    role: 'user',
    savingsBalance: 100053.1095890411,
    fd: 0,
    loanBalance: 230000,
    transactions: [],
    password: '$2b$10$c/Nd2vdjEipwvGt6M95tdOMEL7k5XqKGvaQCvNnUCxZxIVdqPjaBi',
    createdAt: '2026-01-16T13:13:25.473Z',
    lastInterestCalc: '2026-01-18T06:23:38.163Z',
    accruedSavingInterest: 182.1558508162883,
    accruedFdInterest: 0,
    accruedLoanInterest: 75.61643835616438,
  },
  {
    _id: '696a3dc7cda47f86fa309574',
    name: 'Shriya',
    age: 12,
    role: 'user',
    savingsBalance: 86.99824657525349,
    fd: 340.57072876712334,
    loanBalance: 0,
    transactions: [],
    password: '$2b$10$Mygv.eVnsLJ/ZKFM4wAxKuxv8mINBrewNrpJWZAsfgcQd6rY5qGri',
    createdAt: '2026-01-16T13:31:51.570Z',
    lastInterestCalc: '2026-01-18T06:23:38.163Z',
    accruedSavingInterest: 0.20649263351469838,
    accruedFdInterest: 1.040711299530869,
    accruedLoanInterest: 0,
  },
  {
    _id: '696a3ee440d4d90649c06d49',
    name: 'Anvika',
    age: 0,
    role: 'user',
    savingsBalance: 0,
    fd: 1750.9643840140411,
    loanBalance: 0,
    transactions: [],
    password: '$2b$10$tKOSd5r7WVJLY5dl.YugeOxNNYfO9wc.zvhD6EwaKl2sfObv3A9a6',
    createdAt: '2026-01-16T13:36:36.396Z',
    lastInterestCalc: '2026-01-18T06:23:38.163Z',
    accruedFdInterest: 6.110740178475587,
    accruedLoanInterest: 0,
    accruedSavingInterest: 0.0009589041095890412,
  },
  {
    _id: '696a57c61af41c5fc7de2c98',
    name: 'Girija',
    age: 59,
    role: 'user',
    savingsBalance: 7500.153443835616,
    fd: 2551.863254794521,
    loanBalance: 0,
    transactions: [],
    password: '$2b$10$EtqPBm53O0cY3LHSS2o1Z.L0YWXlhfkLCYzfEH9IrI3gMQNrFnvmi',
    createdAt: '2026-01-16T15:22:46.541Z',
    lastInterestCalc: '2026-01-18T06:23:38.163Z',
    accruedSavingInterest: 19.0825007704635,
    accruedFdInterest: 10.890767857684368,
    accruedLoanInterest: 0,
  },
  {
    _id: '696a70ec0212e5f91bb9b38f',
    name: 'Geetha',
    age: 59,
    role: 'user',
    savingsBalance: 4200,
    fd: 204.04383561643834,
    loanBalance: 22505.37423972526,
    transactions: [],
    password: '$2b$10$HWiVJSn6WnU.VIKd/g4y6.sCRBcXYSuqbF8UVE8HjrpVEBi0VL2q.',
    createdAt: '2026-01-16T17:10:04.337Z',
    lastInterestCalc: '2026-01-21T11:26:39.275Z',
    accruedLoanInterest: 155.38483036741823,
    accruedFdInterest: 0.9242565584537437,
    accruedSavingInterest: 7.502849315068494,
  },
  {
    _id: '696b4dd6f9fef4031329b584',
    name: 'Vijayalekshmi',
    age: 52,
    role: 'user',
    savingsBalance: 350.1150685287671,
    fd: 100.32876712328807,
    loanBalance: 0,
    transactions: [],
    password: '$2b$10$fNXy9xhp7Y.ug4GZxC/Rfuwt0h7Ru1Y8BHg9IhVFwJbIrJM03pE8u',
    createdAt: '2026-01-17T08:52:38.448Z',
    lastInterestCalc: '2026-01-21T06:33:40.201Z',
    accruedSavingInterest: 0.5563960969003942,
    accruedFdInterest: 0.4617872021017096,
    accruedLoanInterest: 0,
  },
  {
    _id: '6977591a8b67de0cef87ae95',
    name: 'test',
    age: 30,
    role: 'user',
    savingsBalance: 979.5,
    fd: 0,
    loanBalance: 0,
    transactions: [],
    lastInterestCalc: null,
    password: '$2b$10$YoyYSPYMux44OSIoIGh0meVJaANoec/xyupWTYjm2pvEr8xMvGH3e',
    accruedSavingInterest: 1.7845684931506847,
    accruedFdInterest: 0,
    accruedLoanInterest: 0,
    createdAt: '2026-01-26T12:07:54.388Z',
  },
  {
    _id: '6978df52acb8a27f083ec533',
    name: 'Sudheesh',
    age: 36,
    role: 'user',
    savingsBalance: 2300,
    fd: 0,
    loanBalance: 0.8219178082191547,
    transactions: [],
    lastInterestCalc: null,
    password: '$2b$10$S7rbbE71UJX1FiRIDx5xSOInbMHot4FCwuzoCg6Qsswpqj6NTA16S',
    accruedSavingInterest: 2.1863013698630143,
    accruedFdInterest: 0,
    accruedLoanInterest: 0.8275924188403078,
    createdAt: '2026-01-27T15:52:50.500Z',
  },
  {
    _id: '6979c258fbe99d1ba00a1d92',
    name: 'Arjun.v',
    age: 29,
    role: 'user',
    savingsBalance: 50100.03835616438,
    fd: 0,
    loanBalance: 0,
    transactions: [],
    lastInterestCalc: null,
    password: '$2b$10$RzJvALfNGl8gDGcO1IqlQO9Pm7Wz7Vs/i5oC68s7ShwrNzMsSgWQC',
    accruedSavingInterest: 91.29733751172832,
    accruedFdInterest: 0,
    accruedLoanInterest: 0,
    createdAt: '2026-01-28T08:01:28.589Z',
  },
  {
    _id: '6980d9d798708b446d60cc5e',
    name: 'Abhirami',
    age: 26,
    role: 'user',
    savingsBalance: 0,
    fd: 0,
    loanBalance: 0,
    transactions: [],
    lastInterestCalc: null,
    password: '$2b$10$/Ju39XiTqdH7YUA8enOmsOZuNcAZe8USAWCB1zMxyN.dj2I6oUdqa',
    accruedSavingInterest: 0,
    accruedFdInterest: 0,
    accruedLoanInterest: 0,
    createdAt: '2026-02-02T17:07:35.748Z',
  },
  {
    _id: '6983293e3c0ff43e7ca8cfcd',
    name: 'Aarya',
    age: 37,
    role: 'user',
    savingsBalance: 0,
    fd: 500,
    loanBalance: 0,
    transactions: [],
    lastInterestCalc: null,
    password: '$2b$10$JX2mLY4oo4KgDYdwJ56ScOOoTgY1SdKqSLW5BY4FfYZPEeWZw4x.u',
    accruedSavingInterest: 0,
    accruedFdInterest: 2.08219173972602,
    accruedLoanInterest: 0,
    createdAt: '2026-02-04T11:10:54.490Z',
  },
];

async function restoreUsers() {
  try {
    await dbConnect();
    console.log('🔄 Restoring users from backup...');

    // Get count of existing users
    const existingCount = await User.countDocuments();
    console.log(`📊 Found ${existingCount} existing users in database`);

    // Insert users - skipValidation to avoid password hashing again
    // Use insertMany with ordered: false to continue if one fails
    const result = await User.insertMany(usersToRestore, { ordered: false });

    console.log(`
✅ User Restoration Complete!
📥 Total Users Restored: ${result.length}
   Users in Database: ${existingCount + result.length}
    `);

    console.log('\n📋 Restored users:');
    usersToRestore.forEach((user) => {
      const role = user.role === 'admin' ? '👤 [ADMIN]' : '👥 [USER]';
      console.log(`   ${role} ${user.name} (ID: ${user._id})`);
    });

    process.exit(0);
  } catch (error: unknown) {
    const err = error as Error & { code?: number; message: string };

    // Check if it's a duplicate key error (users already exist)
    if (err.code === 11000) {
      console.log('⚠️  Some users already exist in the database');
      console.log('📌 To force restore, first run: npm run seed:reset');
      console.log('   Then run: npm run restore-users');
    } else {
      console.error('❌ Restoration failed:', err.message);
    }

    process.exit(1);
  }
}

restoreUsers();

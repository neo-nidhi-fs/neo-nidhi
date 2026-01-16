import 'dotenv/config';
import { dbConnect } from './dbConnect';
import { User } from '@/models/User';

async function seed() {
  await dbConnect();
  await User.deleteMany({});

  const admin = new User({
    name: 'Admin',
    age: 32,
    role: 'admin',
    savingsBalance: 0,
    loanBalance: 0,
    password: 'akashvg007!', // will be hashed automatically
  });

  // const kid = new User({
  //   name: "AkashKid",
  //   age: 12,
  //   role: "user",
  //   savingsBalance: 200,
  //   loanBalance: 50,
  //   password: "kid123", // will be hashed automatically
  // });

  await admin.save();
  // await kid.save();

  console.log('Seeded Admin and Kid User with passwords ✅');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

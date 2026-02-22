import 'dotenv/config';
import { dbConnect } from './dbConnect';
import { User } from '@/models/User';
import { QuizQuestion } from '@/models/QuizQuestion';

interface QuizQuestionData {
  category: 'general' | 'finance';
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

// Function to generate diverse GK questions
function generateGeneralKnowledgeQuestions(count: number): QuizQuestionData[] {
  const questions: QuizQuestionData[] = [];

  // Data sources for question generation
  const countries = [
    { name: 'India', capital: 'New Delhi', continent: 'Asia' },
    { name: 'Japan', capital: 'Tokyo', continent: 'Asia' },
    { name: 'Germany', capital: 'Berlin', continent: 'Europe' },
    { name: 'Brazil', capital: 'Brasília', continent: 'South America' },
    { name: 'Egypt', capital: 'Cairo', continent: 'Africa' },
    { name: 'Australia', capital: 'Canberra', continent: 'Oceania' },
    { name: 'Canada', capital: 'Ottawa', continent: 'North America' },
    { name: 'France', capital: 'Paris', continent: 'Europe' },
    { name: 'USA', capital: 'Washington DC', continent: 'North America' },
    { name: 'China', capital: 'Beijing', continent: 'Asia' },
    { name: 'Mexico', capital: 'Mexico City', continent: 'North America' },
    { name: 'Spain', capital: 'Madrid', continent: 'Europe' },
    { name: 'Russia', capital: 'Moscow', continent: 'Europe' },
    { name: 'South Korea', capital: 'Seoul', continent: 'Asia' },
    { name: 'Italy', capital: 'Rome', continent: 'Europe' },
  ];

  const scientists = [
    {
      name: 'Albert Einstein',
      field: 'Physics',
      discovery: 'Theory of Relativity',
    },
    { name: 'Marie Curie', field: 'Chemistry', discovery: 'Radioactivity' },
    { name: 'Isaac Newton', field: 'Physics', discovery: 'Laws of Motion' },
    { name: 'Charles Darwin', field: 'Biology', discovery: 'Evolution' },
    {
      name: 'Nikola Tesla',
      field: 'Electrical Engineering',
      discovery: 'Alternating Current',
    },
    {
      name: 'Stephen Hawking',
      field: 'Physics',
      discovery: 'Black Hole Radiation',
    },
    {
      name: 'Richard Feynman',
      field: 'Physics',
      discovery: 'Quantum Mechanics',
    },
  ];

  const books = [
    { title: '1984', author: 'George Orwell', year: 1949 },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813 },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', year: 1951 },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      author: 'J.K. Rowling',
      year: 1997,
    },
  ];

  const rivers = [
    { name: 'Nile', continent: 'Africa', country: 'Egypt', length: 6650 },
    {
      name: 'Amazon',
      continent: 'South America',
      country: 'Brazil',
      length: 6400,
    },
    { name: 'Yangtze', continent: 'Asia', country: 'China', length: 6300 },
    {
      name: 'Mississippi',
      continent: 'North America',
      country: 'USA',
      length: 3710,
    },
    { name: 'Danube', continent: 'Europe', country: 'Germany', length: 2857 },
    { name: 'Ganges', continent: 'Asia', country: 'India', length: 2500 },
  ];

  const elements = [
    { symbol: 'Au', name: 'Gold', atomicNumber: 79 },
    { symbol: 'Ag', name: 'Silver', atomicNumber: 47 },
    { symbol: 'Fe', name: 'Iron', atomicNumber: 26 },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8 },
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1 },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6 },
  ];

  const historicalEvents = [
    { event: 'Fall of the Berlin Wall', year: 1989, country: 'Germany' },
    { event: 'Moon Landing', year: 1969, country: 'USA' },
    { event: 'End of World War II', year: 1945, country: 'Global' },
    { event: 'French Revolution', year: 1789, country: 'France' },
    { event: 'Independence of India', year: 1947, country: 'India' },
  ];

  const planets = [
    { name: 'Mercury', type: 'Terrestrial', distanceFromSun: 57.9 },
    { name: 'Venus', type: 'Terrestrial', distanceFromSun: 108.2 },
    { name: 'Earth', type: 'Terrestrial', distanceFromSun: 149.6 },
    { name: 'Mars', type: 'Terrestrial', distanceFromSun: 227.9 },
    { name: 'Jupiter', type: 'Gas Giant', distanceFromSun: 778.5 },
    { name: 'Saturn', type: 'Gas Giant', distanceFromSun: 1434 },
  ];

  const animals = [
    { name: 'Blue Whale', type: 'Mammal', habitat: 'Ocean', weight: 190000 },
    { name: 'African Elephant', type: 'Mammal', habitat: 'Land', weight: 6000 },
    { name: 'Lion', type: 'Mammal', habitat: 'Land', weight: 190 },
    { name: 'Great White Shark', type: 'Fish', habitat: 'Ocean', weight: 2000 },
  ];

  const technologies = [
    { name: 'Internet', inventor: 'Vint Cerf & Bob Kahn', year: 1983 },
    { name: 'Telephone', inventor: 'Alexander Graham Bell', year: 1876 },
    { name: 'Light Bulb', inventor: 'Thomas Edison', year: 1879 },
    { name: 'Printing Press', inventor: 'Johannes Gutenberg', year: 1440 },
  ];

  const mountains = [
    { name: 'Mount Everest', height: 8849, country: 'Nepal' },
    { name: 'K2', height: 8611, country: 'Pakistan' },
    { name: 'Mount Kilimanjaro', height: 5895, country: 'Tanzania' },
    { name: 'Mount Blanc', height: 4808, country: 'France' },
  ];

  // Helper function to shuffle array
  const shuffle = (array: string[]): string[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Generate questions

  // Geography questions - Countries and Capitals
  for (let i = 0; i < 800; i++) {
    const country = countries[i % countries.length];
    const options = [
      country.capital,
      countries[(i + 1) % countries.length].capital,
      countries[(i + 2) % countries.length].capital,
      countries[(i + 3) % countries.length].capital,
    ];
    const shuffledOptions = shuffle(options);
    const difficultyIndex = Math.floor(i / 200) % 4;
    const difficulties: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'easy',
      'medium',
      'hard',
    ];
    const points: number[] = [10, 10, 20, 30];
    questions.push({
      category: 'general',
      question: `What is the capital of ${country.name}?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(country.capital),
      difficulty: difficulties[difficultyIndex],
      points: points[difficultyIndex],
    });
  }

  // Science questions - Elements
  for (let i = 0; i < 600; i++) {
    const element = elements[i % elements.length];
    const options = [
      element.symbol,
      elements[(i + 1) % elements.length].symbol,
      elements[(i + 2) % elements.length].symbol,
      elements[(i + 3) % elements.length].symbol,
    ];
    const shuffledOptions = shuffle(options);
    const diffIdx = Math.floor(i / 200) % 3;
    const diffs: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const pts: number[] = [10, 20, 30];
    questions.push({
      category: 'general',
      question: `What is the chemical symbol for ${element.name}?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(element.symbol),
      difficulty: diffs[diffIdx],
      points: pts[diffIdx],
    });
  }

  // History questions - Years and Events
  for (let i = 0; i < 900; i++) {
    const event = historicalEvents[i % historicalEvents.length];
    const options = [
      event.year,
      event.year - 10,
      event.year + 10,
      event.year - 5,
    ];
    const shuffledOptions = shuffle(options.map((y) => y.toString()));
    questions.push({
      category: 'general',
      question: `In which year did the ${event.event} occur?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(event.year.toString()),
      difficulty: (['medium', 'medium', 'hard'] as const)[
        Math.floor(i / 300) % 3
      ],
      points: ([20, 20, 30] as const)[Math.floor(i / 300) % 3],
    });
  }

  // Literature questions - Books and Authors
  for (let i = 0; i < 700; i++) {
    const book = books[i % books.length];
    const options = [
      book.author,
      books[(i + 1) % books.length].author,
      books[(i + 2) % books.length].author,
      books[(i + 3) % books.length].author,
    ];
    const shuffledOptions = shuffle(options);
    const bIdx = Math.floor(i / 233) % 3;
    const bDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'medium',
      'hard',
    ];
    const bPts: number[] = [10, 20, 30];
    questions.push({
      category: 'general',
      question: `Who is the author of "${book.title}"?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(book.author),
      difficulty: bDiffs[bIdx],
      points: bPts[bIdx],
    });
  }

  // Rivers questions
  for (let i = 0; i < 500; i++) {
    const river = rivers[i % rivers.length];
    const options = [
      river.country,
      rivers[(i + 1) % rivers.length].country,
      rivers[(i + 2) % rivers.length].country,
      rivers[(i + 3) % rivers.length].country,
    ];
    const shuffledOptions = shuffle(options);
    const rIdx = Math.floor(i / 166) % 3;
    const rDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'medium',
      'hard',
    ];
    const rPts: number[] = [10, 20, 30];
    questions.push({
      category: 'general',
      question: `Which country does the ${river.name} River flow through?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(river.country),
      difficulty: rDiffs[rIdx],
      points: rPts[rIdx],
    });
  }

  // Scientists and their discoveries
  for (let i = 0; i < 700; i++) {
    const scientist = scientists[i % scientists.length];
    const options = [
      scientist.field,
      scientists[(i + 1) % scientists.length].field,
      scientists[(i + 2) % scientists.length].field,
      scientists[(i + 3) % scientists.length].field,
    ];
    const shuffledOptions = shuffle(options);
    const sIdx = Math.floor(i / 233) % 3;
    const sDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'medium',
      'hard',
    ];
    const sPts: number[] = [10, 20, 30];
    questions.push({
      category: 'general',
      question: `${scientist.name} was a renowned scientist in which field?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(scientist.field),
      difficulty: sDiffs[sIdx],
      points: sPts[sIdx],
    });
  }

  // Planets questions
  for (let i = 0; i < 500; i++) {
    const planet = planets[i % planets.length];
    const options = [
      planet.type,
      planets[(i + 1) % planets.length].type,
      planets[(i + 2) % planets.length].type,
      planets[(i + 3) % planets.length].type,
    ];
    const shuffledOptions = shuffle(options);
    const pIdx = Math.floor(i / 166) % 3;
    const pDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'medium',
      'hard',
    ];
    const pPts: number[] = [10, 20, 30];
    questions.push({
      category: 'general',
      question: `What type of planet is ${planet.name}?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(planet.type),
      difficulty: pDiffs[pIdx],
      points: pPts[pIdx],
    });
  }

  // Animals questions
  for (let i = 0; i < 400; i++) {
    const animal = animals[i % animals.length];
    const options = [
      animal.habitat,
      animals[(i + 1) % animals.length].habitat,
      animals[(i + 2) % animals.length].habitat,
      animals[(i + 3) % animals.length].habitat,
    ];
    const shuffledOptions = shuffle(options);
    const aIdx = Math.floor(i / 133) % 3;
    const aDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'medium',
      'hard',
    ];
    const aPts: number[] = [10, 20, 30];
    questions.push({
      category: 'general',
      question: `Where does the ${animal.name} primarily live?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(animal.habitat),
      difficulty: aDiffs[aIdx],
      points: aPts[aIdx],
    });
  }

  // Technology & Inventions
  for (let i = 0; i < 600; i++) {
    const tech = technologies[i % technologies.length];
    const options = [
      tech.inventor,
      technologies[(i + 1) % technologies.length].inventor,
      technologies[(i + 2) % technologies.length].inventor,
      technologies[(i + 3) % technologies.length].inventor,
    ];
    const shuffledOptions = shuffle(options);
    const tIdx = Math.floor(i / 200) % 3;
    const tDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'medium',
      'medium',
      'hard',
    ];
    const tPts: number[] = [20, 20, 30];
    questions.push({
      category: 'general',
      question: `Who invented the ${tech.name}?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(tech.inventor),
      difficulty: tDiffs[tIdx],
      points: tPts[tIdx],
    });
  }

  // Mountains questions
  for (let i = 0; i < 300; i++) {
    const mountain = mountains[i % mountains.length];
    const options = [
      mountain.country,
      mountains[(i + 1) % mountains.length].country,
      mountains[(i + 2) % mountains.length].country,
      mountains[(i + 3) % mountains.length].country,
    ];
    const shuffledOptions = shuffle(options);
    const mIdx = Math.floor(i / 100) % 3;
    const mDiffs: Array<'easy' | 'medium' | 'hard'> = [
      'medium',
      'medium',
      'hard',
    ];
    const mPts: number[] = [20, 20, 30];
    questions.push({
      category: 'general',
      question: `${mountain.name} is located in which country?`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(mountain.country),
      difficulty: mDiffs[mIdx],
      points: mPts[mIdx],
    });
  }

  // Additional miscellaneous questions
  const miscQuestions = [
    {
      q: 'What is the largest continent by area?',
      opts: ['Africa', 'Asia', 'Europe', 'North America'],
      ans: 1,
    },
    {
      q: 'How many colors are in the rainbow?',
      opts: ['5', '6', '7', '8'],
      ans: 2,
    },
    {
      q: 'What is the smallest country in the world?',
      opts: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
      ans: 2,
    },
    {
      q: 'What is the largest ocean on Earth?',
      opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      ans: 3,
    },
    {
      q: 'How many bones are in the human body?',
      opts: ['186', '206', '226', '256'],
      ans: 1,
    },
  ];

  for (let i = 0; i < 2000; i++) {
    const misc = miscQuestions[i % miscQuestions.length];
    const shuffledOptions = shuffle(misc.opts);
    const mIdx2 = Math.floor(i / 400) % 5;
    const mDiffs2: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'easy',
      'medium',
      'medium',
      'hard',
    ];
    const mPts2: number[] = [10, 10, 20, 20, 30];
    questions.push({
      category: 'general',
      question: misc.q,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(misc.opts[misc.ans]),
      difficulty: mDiffs2[mIdx2],
      points: mPts2[mIdx2],
    });
  }

  // Return requested number of questions, or all if less available
  return questions.slice(0, count);
}

async function seed() {
  await dbConnect();

  // Clear existing data
  await User.deleteMany({});
  await QuizQuestion.deleteMany({});

  // Seed Users
  const admin = new User({
    name: 'Admin',
    age: 32,
    role: 'admin',
    savingsBalance: 0,
    loanBalance: 0,
    password: 'akashvg007!', // will be hashed automatically
  });

  await admin.save();

  // Finance Quiz Questions
  const financeQuestions = [
    {
      category: 'finance',
      question:
        'What is the term for borrowing money that must be repaid with interest?',
      options: ['Savings', 'Loan', 'Investment', 'Dividend'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 10,
    },
    {
      category: 'finance',
      question: 'Which of the following is a fixed-income investment?',
      options: ['Stock', 'Bond', 'Cryptocurrency', 'Commodity'],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 10,
    },
    {
      category: 'finance',
      question: 'What does EMI stand for in financial terms?',
      options: [
        'Equated Monthly Income',
        'Equated Monthly Installment',
        'Equal Money Investment',
        'Electronic Money Integration',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 10,
    },
    {
      category: 'finance',
      question: 'What is the primary purpose of budgeting?',
      options: [
        'To spend more money',
        'To plan and control income and expenses',
        'To avoid paying taxes',
        'To invest all money',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 10,
    },
    {
      category: 'finance',
      question:
        'Which investment typically offers the highest returns but also the highest risk?',
      options: [
        'Savings Account',
        'Fixed Deposit',
        'Stock Market',
        'Government Bonds',
      ],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 20,
    },
    {
      category: 'finance',
      question: 'What is compound interest?',
      options: [
        'Interest calculated only on principal amount',
        'Interest calculated on principal plus accumulated interest',
        'Interest paid monthly',
        'Interest from multiple investments',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      points: 20,
    },
    {
      category: 'finance',
      question:
        'If you invest ₹10,000 at 5% annual interest for 2 years (Simple Interest), what will be the total amount?',
      options: ['₹11,000', '₹11,025', '₹11,150', '₹12,000'],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 20,
    },
    {
      category: 'finance',
      question:
        'What is the standard lock-in period for many Fixed Deposits to avoid penalty?',
      options: ['1 year', '2 years', '3 years', '5 years'],
      correctAnswer: 2,
      difficulty: 'medium',
      points: 20,
    },
    {
      category: 'finance',
      question: 'Which type of insurance covers medical expenses?',
      options: [
        'Life Insurance',
        'Health Insurance',
        'Auto Insurance',
        'Disability Insurance',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 10,
    },
    {
      category: 'finance',
      question:
        'What is the minimum amount that must be maintained in a savings account called?',
      options: [
        'Reserve Balance',
        'Minimum Balance',
        'Float Amount',
        'Threshold Amount',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      points: 10,
    },
  ];

  console.log('🌱 Starting database seed...');
  console.log('📚 Generating 10,000 general knowledge questions...');

  // Generate 10,000 general knowledge questions
  const generalQuestions = generateGeneralKnowledgeQuestions(10000);

  console.log(
    `✅ Generated ${generalQuestions.length} general knowledge questions`
  );

  // Insert all questions in batches to avoid memory issues
  console.log('💾 Saving to database...');
  const batchSize = 1000;
  const allQuestions = [...financeQuestions, ...generalQuestions];

  for (let i = 0; i < allQuestions.length; i += batchSize) {
    const batch = allQuestions.slice(i, i + batchSize);
    await QuizQuestion.insertMany(batch);
    console.log(
      `   Saved ${Math.min(i + batchSize, allQuestions.length)} questions`
    );
  }

  console.log(`
✅ Database Seed Complete!
📊 Total Questions Added: ${allQuestions.length}
   - Finance Questions: ${financeQuestions.length}
   - General Knowledge Questions: ${generalQuestions.length}
   - Total Users: 1 (Admin)
  `);

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

import 'dotenv/config';
import { dbConnect } from './dbConnect';
import { QuizQuestion } from '@/models/QuizQuestion';

type Difficulty = 'easy' | 'medium' | 'hard';

interface QuizQuestionData {
  category: 'general' | 'finance';
  question: string;
  options: string[];
  subCategory?: string;
  keyword?: string; // For fetching Wikipedia summary
  correctAnswer: number;
  difficulty: Difficulty;
  points: number;
}

// Function to generate diverse GK questions
function generateGeneralKnowledgeQuestions(count: number): QuizQuestionData[] {
  const questions: QuizQuestionData[] = [];

  // Data sources for question generation
  const countries = [
    // Asia
    {
      name: 'India',
      capital: 'New Delhi',
      continent: 'Asia',
      wikiKeyword: 'India',
    },
    {
      name: 'Japan',
      capital: 'Tokyo',
      continent: 'Asia',
      wikiKeyword: 'Japan',
    },
    {
      name: 'China',
      capital: 'Beijing',
      continent: 'Asia',
      wikiKeyword: 'China',
    },
    {
      name: 'South Korea',
      capital: 'Seoul',
      continent: 'Asia',
      wikiKeyword: 'South_Korea',
    },
    {
      name: 'Saudi Arabia',
      capital: 'Riyadh',
      continent: 'Asia',
      wikiKeyword: 'Saudi_Arabia',
    },

    // Europe
    {
      name: 'Germany',
      capital: 'Berlin',
      continent: 'Europe',
      wikiKeyword: 'Germany',
    },
    {
      name: 'France',
      capital: 'Paris',
      continent: 'Europe',
      wikiKeyword: 'France',
    },
    {
      name: 'Italy',
      capital: 'Rome',
      continent: 'Europe',
      wikiKeyword: 'Italy',
    },
    {
      name: 'Spain',
      capital: 'Madrid',
      continent: 'Europe',
      wikiKeyword: 'Spain',
    },
    {
      name: 'Russia',
      capital: 'Moscow',
      continent: 'Europe',
      wikiKeyword: 'Russia',
    },

    // Africa
    {
      name: 'Egypt',
      capital: 'Cairo',
      continent: 'Africa',
      wikiKeyword: 'Egypt',
    },
    {
      name: 'Nigeria',
      capital: 'Abuja',
      continent: 'Africa',
      wikiKeyword: 'Nigeria',
    },
    {
      name: 'South Africa',
      capital: 'Pretoria',
      continent: 'Africa',
      wikiKeyword: 'South_Africa',
    },
    {
      name: 'Kenya',
      capital: 'Nairobi',
      continent: 'Africa',
      wikiKeyword: 'Kenya',
    },
    {
      name: 'Ethiopia',
      capital: 'Addis Ababa',
      continent: 'Africa',
      wikiKeyword: 'Ethiopia',
    },

    // North America
    {
      name: 'USA',
      capital: 'Washington DC',
      continent: 'North America',
      wikiKeyword: 'United_States',
    },
    {
      name: 'Canada',
      capital: 'Ottawa',
      continent: 'North America',
      wikiKeyword: 'Canada',
    },
    {
      name: 'Mexico',
      capital: 'Mexico City',
      continent: 'North America',
      wikiKeyword: 'Mexico',
    },
    {
      name: 'Cuba',
      capital: 'Havana',
      continent: 'North America',
      wikiKeyword: 'Cuba',
    },
    {
      name: 'Panama',
      capital: 'Panama City',
      continent: 'North America',
      wikiKeyword: 'Panama',
    },

    // South America
    {
      name: 'Brazil',
      capital: 'Brasília',
      continent: 'South America',
      wikiKeyword: 'Brazil',
    },
    { name: 'Argentina', capital: 'Buenos_Aires' }, // careful: country page is "Argentina"
    {
      name: 'Chile',
      capital: 'Santiago',
      continent: 'South America',
      wikiKeyword: 'Chile',
    },
    {
      name: 'Peru',
      capital: 'Lima',
      continent: 'South America',
      wikiKeyword: 'Peru',
    },
    {
      name: 'Colombia',
      capital: 'Bogotá',
      continent: 'South America',
      wikiKeyword: 'Colombia',
    },

    // Oceania
    {
      name: 'Australia',
      capital: 'Canberra',
      continent: 'Oceania',
      wikiKeyword: 'Australia',
    },
    {
      name: 'New Zealand',
      capital: 'Wellington',
      continent: 'Oceania',
      wikiKeyword: 'New_Zealand',
    },
    {
      name: 'Fiji',
      capital: 'Suva',
      continent: 'Oceania',
      wikiKeyword: 'Fiji',
    },
    {
      name: 'Papua New Guinea',
      capital: 'Port Moresby',
      continent: 'Oceania',
      wikiKeyword: 'Papua_New_Guinea',
    },
    {
      name: 'Samoa',
      capital: 'Apia',
      continent: 'Oceania',
      wikiKeyword: 'Samoa',
    },
  ];

  const scientists = [
    {
      name: 'Albert Einstein',
      field: 'Physics',
      discovery: 'Theory of Relativity',
      wikiKeyword: 'Albert_Einstein',
    },
    {
      name: 'Marie Curie',
      field: 'Chemistry',
      discovery: 'Radioactivity',
      wikiKeyword: 'Marie_Curie',
    },
    {
      name: 'Isaac Newton',
      field: 'Physics',
      discovery: 'Laws of Motion',
      wikiKeyword: 'Isaac_Newton',
    },
    {
      name: 'Charles Darwin',
      field: 'Biology',
      discovery: 'Theory of Evolution',
      wikiKeyword: 'Charles_Darwin',
    },
    {
      name: 'Nikola Tesla',
      field: 'Electrical Engineering',
      discovery: 'Alternating Current',
      wikiKeyword: 'Nikola_Tesla',
    },
    {
      name: 'Stephen Hawking',
      field: 'Physics',
      discovery: 'Black Hole Radiation',
      wikiKeyword: 'Stephen_Hawking',
    },
    {
      name: 'Richard Feynman',
      field: 'Physics',
      discovery: 'Quantum Electrodynamics',
      wikiKeyword: 'Richard_Feynman',
    },
    {
      name: 'Galileo Galilei',
      field: 'Astronomy',
      discovery: 'Telescopic Observations & Heliocentrism',
      wikiKeyword: 'Galileo_Galilei',
    },
    {
      name: 'Gregor Mendel',
      field: 'Biology',
      discovery: 'Genetics & Inheritance Laws',
      wikiKeyword: 'Gregor_Mendel',
    },
    {
      name: 'James Clerk Maxwell',
      field: 'Physics',
      discovery: 'Electromagnetic Theory',
      wikiKeyword: 'James_Clerk_Maxwell',
    },
    {
      name: 'Michael Faraday',
      field: 'Physics',
      discovery: 'Electromagnetic Induction',
      wikiKeyword: 'Michael_Faraday',
    },
    {
      name: 'Dmitri Mendeleev',
      field: 'Chemistry',
      discovery: 'Periodic Table of Elements',
      wikiKeyword: 'Dmitri_Mendeleev',
    },
    {
      name: 'Louis Pasteur',
      field: 'Biology',
      discovery: 'Germ Theory of Disease',
      wikiKeyword: 'Louis_Pasteur',
    },
    {
      name: 'Alan Turing',
      field: 'Mathematics/Computer Science',
      discovery: 'Foundations of Computer Science & AI',
      wikiKeyword: 'Alan_Turing',
    },
    {
      name: 'Rosalind Franklin',
      field: 'Chemistry',
      discovery: 'DNA Structure via X-ray Crystallography',
      wikiKeyword: 'Rosalind_Franklin',
    },
    {
      name: 'Niels Bohr',
      field: 'Physics',
      discovery: 'Bohr Model of the Atom',
      wikiKeyword: 'Niels_Bohr',
    },
    {
      name: 'Max Planck',
      field: 'Physics',
      discovery: 'Quantum Theory',
      wikiKeyword: 'Max_Planck',
    },
    {
      name: 'Erwin Schrödinger',
      field: 'Physics',
      discovery: 'Wave Equation in Quantum Mechanics',
      wikiKeyword: 'Erwin_Schrödinger',
    },
    {
      name: 'Johannes Kepler',
      field: 'Astronomy',
      discovery: 'Planetary Motion Laws',
      wikiKeyword: 'Johannes_Kepler',
    },
    {
      name: 'Ada Lovelace',
      field: 'Mathematics',
      discovery: 'First Computer Algorithm',
      wikiKeyword: 'Ada_Lovelace',
    },
    {
      name: 'Enrico Fermi',
      field: 'Physics',
      discovery: 'Nuclear Reactor Development',
      wikiKeyword: 'Enrico_Fermi',
    },
    {
      name: 'Carl Linnaeus',
      field: 'Biology',
      discovery: 'Taxonomy System',
      wikiKeyword: 'Carl_Linnaeus',
    },
    {
      name: 'Robert Hooke',
      field: 'Biology',
      discovery: 'Cell Theory (Microscopy)',
      wikiKeyword: 'Robert_Hooke',
    },
    {
      name: 'Antoine Lavoisier',
      field: 'Chemistry',
      discovery: 'Law of Conservation of Mass',
      wikiKeyword: 'Antoine_Lavoisier',
    },
    {
      name: 'Joseph Priestley',
      field: 'Chemistry',
      discovery: 'Discovery of Oxygen',
      wikiKeyword: 'Joseph_Priestley',
    },
    {
      name: 'Edward Jenner',
      field: 'Medicine',
      discovery: 'Smallpox Vaccine',
      wikiKeyword: 'Edward_Jenner',
    },
    {
      name: 'Alexander Fleming',
      field: 'Medicine',
      discovery: 'Penicillin',
      wikiKeyword: 'Alexander_Fleming',
    },
    {
      name: 'Jane Goodall',
      field: 'Biology',
      discovery: 'Chimpanzee Behavior Studies',
      wikiKeyword: 'Jane_Goodall',
    },
    {
      name: 'Barbara McClintock',
      field: 'Genetics',
      discovery: 'Transposable Elements (Jumping Genes)',
      wikiKeyword: 'Barbara_McClintock',
    },
    {
      name: 'Henri Becquerel',
      field: 'Physics',
      discovery: 'Radioactivity (with Curie)',
      wikiKeyword: 'Henri_Becquerel',
    },
    {
      name: 'Subrahmanyan Chandrasekhar',
      field: 'Astrophysics',
      discovery: 'Chandrasekhar Limit in Stellar Evolution',
      wikiKeyword: 'Subrahmanyan_Chandrasekhar',
    },
    {
      name: 'Abdus Salam',
      field: 'Physics',
      discovery: 'Electroweak Unification',
      wikiKeyword: 'Abdus_Salam',
    },
    {
      name: 'Emmy Noether',
      field: 'Mathematics',
      discovery: 'Noether’s Theorem (Symmetry & Conservation Laws)',
      wikiKeyword: 'Emmy_Noether',
    },
    {
      name: 'John Dalton',
      field: 'Chemistry',
      discovery: 'Atomic Theory',
      wikiKeyword: 'John_Dalton',
    },
    {
      name: 'Francis Crick',
      field: 'Biology',
      discovery: 'DNA Double Helix (with Watson & Franklin)',
      wikiKeyword: 'Francis_Crick',
    },
    {
      name: 'James Watson',
      field: 'Biology',
      discovery: 'DNA Double Helix (with Crick & Franklin)',
      wikiKeyword: 'James_Watson',
    },
    {
      name: 'Leonardo da Vinci',
      field: 'Engineering/Anatomy',
      discovery: 'Early Anatomical Studies & Inventions',
      wikiKeyword: 'Leonardo_da_Vinci',
    },
    {
      name: 'Aristotle',
      field: 'Philosophy/Natural Science',
      discovery: 'Foundations of Biology & Logic',
      wikiKeyword: 'Aristotle',
    },
    {
      name: 'Euclid',
      field: 'Mathematics',
      discovery: 'Foundations of Geometry',
      wikiKeyword: 'Euclid',
    },
    {
      name: 'Pythagoras',
      field: 'Mathematics',
      discovery: 'Pythagorean Theorem',
      wikiKeyword: 'Pythagoras',
    },
    {
      name: 'Al-Khwarizmi',
      field: 'Mathematics',
      discovery: 'Foundations of Algebra',
      wikiKeyword: 'Muhammad_ibn_Musa_al-Khwarizmi',
    },
    {
      name: 'Avicenna (Ibn Sina)',
      field: 'Medicine/Philosophy',
      discovery: 'Canon of Medicine',
      wikiKeyword: 'Avicenna',
    },
    {
      name: 'Aryabhata',
      field: 'Mathematics/Astronomy',
      discovery: 'Approximation of Pi & Solar System Models',
      wikiKeyword: 'Aryabhata',
    },
    {
      name: 'Ramanujan',
      field: 'Mathematics',
      discovery: 'Infinite Series & Number Theory',
      wikiKeyword: 'Srinivasa_Ramanujan',
    },
    {
      name: 'Christiaan Huygens',
      field: 'Physics',
      discovery: 'Wave Theory of Light',
      wikiKeyword: 'Christiaan_Huygens',
    },
    {
      name: 'William Harvey',
      field: 'Medicine',
      discovery: 'Circulation of Blood',
      wikiKeyword: 'William_Harvey',
    },
    {
      name: 'Hans Christian Ørsted',
      field: 'Physics',
      discovery: 'Electromagnetism',
      wikiKeyword: 'Hans_Christian_Ørsted',
    },
    {
      name: 'Ernst Mayr',
      field: 'Biology',
      discovery: 'Modern Evolutionary Synthesis',
      wikiKeyword: 'Ernst_Mayr',
    },
    {
      name: 'Rachel Carson',
      field: 'Biology/Environmental Science',
      discovery: 'Impact of Pesticides (Silent Spring)',
      wikiKeyword: 'Rachel_Carson',
    },
    {
      name: 'Tim Berners-Lee',
      field: 'Computer Science',
      discovery: 'World Wide Web',
      wikiKeyword: 'Tim_Berners-Lee',
    },
    {
      name: 'Katherine Johnson',
      field: 'Mathematics',
      discovery: 'NASA Orbital Calculations',
      wikiKeyword: 'Katherine_Johnson',
    },
  ];

  const books = [
    {
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      difficulty: 'hard',
      wikiKeyword: 'Nineteen_Eighty-Four',
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      year: 1960,
      difficulty: 'medium',
      wikiKeyword: 'To_Kill_a_Mockingbird',
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      year: 1925,
      difficulty: 'medium',
      wikiKeyword: 'The_Great_Gatsby',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      year: 1813,
      difficulty: 'hard',
      wikiKeyword: 'Pride_and_Prejudice',
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      year: 1951,
      difficulty: 'medium',
      wikiKeyword: 'The_Catcher_in_the_Rye',
    },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      author: 'J.K. Rowling',
      year: 1997,
      difficulty: 'easy',
      wikiKeyword: 'Harry_Potter_and_the_Philosopher%27s_Stone',
    },
    {
      title: 'Moby-Dick',
      author: 'Herman Melville',
      year: 1851,
      difficulty: 'hard',
      wikiKeyword: 'Moby-Dick',
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      year: 1937,
      difficulty: 'easy',
      wikiKeyword: 'The_Hobbit',
    },
    {
      title: 'War and Peace',
      author: 'Leo Tolstoy',
      year: 1869,
      difficulty: 'hard',
      wikiKeyword: 'War_and_Peace',
    },
    {
      title: 'Crime and Punishment',
      author: 'Fyodor Dostoevsky',
      year: 1866,
      difficulty: 'hard',
      wikiKeyword: 'Crime_and_Punishment',
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      year: 1932,
      difficulty: 'medium',
      wikiKeyword: 'Brave_New_World',
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      year: 1988,
      difficulty: 'easy',
      wikiKeyword: 'The_Alchemist_(novel)',
    },
    {
      title: 'Jane Eyre',
      author: 'Charlotte Brontë',
      year: 1847,
      difficulty: 'hard',
      wikiKeyword: 'Jane_Eyre',
    },
    {
      title: 'Animal Farm',
      author: 'George Orwell',
      year: 1945,
      difficulty: 'easy',
      wikiKeyword: 'Animal_Farm',
    },
    {
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      year: 1954,
      difficulty: 'hard',
      wikiKeyword: 'The_Lord_of_the_Rings',
    },
    {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      year: 1953,
      difficulty: 'medium',
      wikiKeyword: 'Fahrenheit_451',
    },
    {
      title: 'Don Quixote',
      author: 'Miguel de Cervantes',
      year: 1605,
      difficulty: 'hard',
      wikiKeyword: 'Don_Quixote',
    },
    {
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      year: 1943,
      difficulty: 'easy',
      wikiKeyword: 'The_Little_Prince',
    },
    {
      title: 'Wuthering Heights',
      author: 'Emily Brontë',
      year: 1847,
      difficulty: 'hard',
      wikiKeyword: 'Wuthering_Heights',
    },
    {
      title: 'The Odyssey',
      author: 'Homer',
      year: -700,
      difficulty: 'hard',
      wikiKeyword: 'Odyssey',
    },
    {
      title: 'Les Misérables',
      author: 'Victor Hugo',
      year: 1862,
      difficulty: 'hard',
      wikiKeyword: 'Les_Misérables',
    },
    {
      title: 'The Divine Comedy',
      author: 'Dante Alighieri',
      year: 1320,
      difficulty: 'hard',
      wikiKeyword: 'Divine_Comedy',
    },
    {
      title: 'The Brothers Karamazov',
      author: 'Fyodor Dostoevsky',
      year: 1880,
      difficulty: 'hard',
      wikiKeyword: 'The_Brothers_Karamazov',
    },
    {
      title: 'Dracula',
      author: 'Bram Stoker',
      year: 1897,
      difficulty: 'medium',
      wikiKeyword: 'Dracula',
    },
    {
      title: 'Frankenstein',
      author: 'Mary Shelley',
      year: 1818,
      difficulty: 'medium',
      wikiKeyword: 'Frankenstein',
    },
    {
      title: 'The Iliad',
      author: 'Homer',
      year: -750,
      difficulty: 'hard',
      wikiKeyword: 'Iliad',
    },
    {
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      year: 1890,
      difficulty: 'medium',
      wikiKeyword: 'The_Picture_of_Dorian_Gray',
    },
    {
      title: 'Great Expectations',
      author: 'Charles Dickens',
      year: 1861,
      difficulty: 'hard',
      wikiKeyword: 'Great_Expectations',
    },
    {
      title: 'Oliver Twist',
      author: 'Charles Dickens',
      year: 1838,
      difficulty: 'medium',
      wikiKeyword: 'Oliver_Twist',
    },
    {
      title: 'David Copperfield',
      author: 'Charles Dickens',
      year: 1850,
      difficulty: 'hard',
      wikiKeyword: 'David_Copperfield',
    },
    {
      title: 'A Tale of Two Cities',
      author: 'Charles Dickens',
      year: 1859,
      difficulty: 'hard',
      wikiKeyword: 'A_Tale_of_Two_Cities',
    },
    {
      title: 'The Grapes of Wrath',
      author: 'John Steinbeck',
      year: 1939,
      difficulty: 'medium',
      wikiKeyword: 'The_Grapes_of_Wrath',
    },
    {
      title: 'Of Mice and Men',
      author: 'John Steinbeck',
      year: 1937,
      difficulty: 'easy',
      wikiKeyword: 'Of_Mice_and_Men',
    },
    {
      title: 'East of Eden',
      author: 'John Steinbeck',
      year: 1952,
      difficulty: 'medium',
      wikiKeyword: 'East_of_Eden',
    },
    {
      title: 'The Old Man and the Sea',
      author: 'Ernest Hemingway',
      year: 1952,
      difficulty: 'easy',
      wikiKeyword: 'The_Old_Man_and_the_Sea',
    },
    {
      title: 'For Whom the Bell Tolls',
      author: 'Ernest Hemingway',
      year: 1940,
      difficulty: 'medium',
      wikiKeyword: 'For_Whom_the_Bell_Tolls',
    },
    {
      title: 'A Farewell to Arms',
      author: 'Ernest Hemingway',
      year: 1929,
      difficulty: 'medium',
      wikiKeyword: 'A_Farewell_to_Arms',
    },
    {
      title: 'The Sun Also Rises',
      author: 'Ernest Hemingway',
      year: 1926,
      difficulty: 'medium',
      wikiKeyword: 'The_Sun_Also_Rises',
    },
    {
      title: 'Slaughterhouse-Five',
      author: 'Kurt Vonnegut',
      year: 1969,
      difficulty: 'medium',
      wikiKeyword: 'Slaughterhouse-Five',
    },
    {
      title: 'Catch-22',
      author: 'Joseph Heller',
      year: 1961,
      difficulty: 'hard',
      wikiKeyword: 'Catch-22',
    },
    {
      title: 'Lolita',
      author: 'Vladimir Nabokov',
      year: 1955,
      difficulty: 'hard',
      wikiKeyword: 'Lolita',
    },
    {
      title: 'The Sound and the Fury',
      author: 'William Faulkner',
      year: 1929,
      difficulty: 'hard',
      wikiKeyword: 'The_Sound_and_the_Fury',
    },
    {
      title: 'As I Lay Dying',
      author: 'William Faulkner',
      year: 1930,
      difficulty: 'hard',
      wikiKeyword: 'As_I_Lay_Dying',
    },
    {
      title: 'Invisible Man',
      author: 'Ralph Ellison',
      year: 1952,
      difficulty: 'hard',
      wikiKeyword: 'Invisible_Man',
    },
    {
      title: 'Beloved',
      author: 'Toni Morrison',
      year: 1987,
      difficulty: 'hard',
      wikiKeyword: 'Beloved_(novel)',
    },
    {
      title: 'Song of Solomon',
      author: 'Toni Morrison',
      year: 1977,
      difficulty: 'hard',
      wikiKeyword: 'Song_of_Solomon',
    },
    {
      title: 'Middlemarch',
      author: 'George Eliot',
      year: 1871,
      difficulty: 'hard',
      wikiKeyword: 'Middlemarch',
    },
    {
      title: 'Silas Marner',
      author: 'George Eliot',
      year: 1861,
      difficulty: 'medium',
      wikiKeyword: 'Silas_Marner',
    },
    {
      title: 'The Scarlet Letter',
      author: 'Nathaniel Hawthorne',
      year: 1850,
      difficulty: 'hard',
      wikiKeyword: 'The_Scarlet_Letter',
    },
    {
      title: 'The House of the Seven Gables',
      author: 'Nathaniel Hawthorne',
      year: 1851,
      difficulty: 'hard',
      wikiKeyword: 'The_House_of_the_Seven_Gables',
    },
    {
      title: 'The Call of the Wild',
      author: 'Jack London',
      year: 1903,
      difficulty: 'easy',
      wikiKeyword: 'The_Call_of_the_Wild',
    },
    {
      title: 'White Fang',
      author: 'Jack London',
      year: 1906,
      difficulty: 'easy',
      wikiKeyword: 'White_Fang',
    },
    {
      title: 'The Time Machine',
      author: 'H.G. Wells',
      year: 1895,
      difficulty: 'medium',
      wikiKeyword: 'The_Time_Machine',
    },
    {
      title: 'The War of the Worlds',
      author: 'H.G. Wells',
      year: 1898,
      difficulty: 'medium',
      wikiKeyword: 'The_War_of_the_Worlds',
    },
    {
      title: 'The Invisible Man',
      author: 'H.G. Wells',
      year: 1897,
      difficulty: 'medium',
      wikiKeyword: 'The_Invisible_Man',
    },
    {
      title: 'Journey to the Center of the Earth',
      author: 'Jules Verne',
      year: 1864,
      difficulty: 'medium',
      wikiKeyword: 'Journey_to_the_Center_of_the_Earth',
    },
    {
      title: 'Twenty Thousand Leagues Under the Sea',
      author: 'Jules Verne',
      year: 1870,
      difficulty: 'medium',
      wikiKeyword: 'Twenty_Thousand_Leagues_Under_the_Sea',
    },
    {
      title: 'Around the World in Eighty Days',
      author: 'Jules Verne',
      year: 1873,
      difficulty: 'easy',
      wikiKeyword: 'Around_the_World_in_Eighty_Days',
    },
    {
      title: 'The Stranger',
      author: 'Albert Camus',
      year: 1942,
      difficulty: 'medium',
      wikiKeyword: 'The_Stranger_(novel)',
    },
    {
      title: 'The Plague',
      author: 'Albert Camus',
      year: 1947,
      difficulty: 'hard',
      wikiKeyword: 'The_Plague',
    },
    {
      title: 'The Trial',
      author: 'Franz Kafka',
      year: 1925,
      difficulty: 'hard',
      wikiKeyword: 'The_Trial',
    },
    {
      title: 'Metamorphosis',
      author: 'Franz Kafka',
      year: 1915,
      difficulty: 'medium',
      wikiKeyword: 'The_Metamorphosis',
    },
    {
      title: 'Ulysses',
      author: 'James Joyce',
      year: 1922,
      difficulty: 'hard',
      wikiKeyword: 'Ulysses_(novel)',
    },
    {
      title: 'A Portrait of the Artist as a Young Man',
      author: 'James Joyce',
      year: 1916,
      difficulty: 'hard',
      wikiKeyword: 'A_Portrait_of_the_Artist_as_a_Young_Man',
    },
    {
      title: 'Dubliners',
      author: 'James Joyce',
      year: 1914,
      difficulty: 'medium',
      wikiKeyword: 'Dubliners',
    },
    {
      title: 'The Bell Jar',
      author: 'Sylvia Plath',
      year: 1963,
      difficulty: 'medium',
      wikiKeyword: 'The_Bell_Jar',
    },
  ];

  const rivers = [
    // Africa
    {
      name: 'Nile',
      continent: 'Africa',
      country: 'Egypt',
      length: 6650,
      difficulty: 'easy',
      wikiKeyword: 'Nile',
    },
    {
      name: 'Congo',
      continent: 'Africa',
      country: 'DR Congo',
      length: 4700,
      difficulty: 'medium',
      wikiKeyword: 'Congo_River',
    },
    {
      name: 'Niger',
      continent: 'Africa',
      country: 'Nigeria',
      length: 4180,
      difficulty: 'medium',
      wikiKeyword: 'Niger_River',
    },
    {
      name: 'Zambezi',
      continent: 'Africa',
      country: 'Zambia',
      length: 2574,
      difficulty: 'medium',
      wikiKeyword: 'Zambezi',
    },
    {
      name: 'Orange',
      continent: 'Africa',
      country: 'South Africa',
      length: 2200,
      difficulty: 'hard',
      wikiKeyword: 'Orange_River',
    },

    // South America
    {
      name: 'Amazon',
      continent: 'South America',
      country: 'Brazil',
      length: 6400,
      difficulty: 'easy',
      wikiKeyword: 'Amazon_River',
    },
    {
      name: 'Paraná',
      continent: 'South America',
      country: 'Argentina',
      length: 4880,
      difficulty: 'medium',
      wikiKeyword: 'Paraná_River',
    },
    {
      name: 'Orinoco',
      continent: 'South America',
      country: 'Venezuela',
      length: 2140,
      difficulty: 'medium',
      wikiKeyword: 'Orinoco',
    },
    {
      name: 'São Francisco',
      continent: 'South America',
      country: 'Brazil',
      length: 3180,
      difficulty: 'hard',
      wikiKeyword: 'São_Francisco_River',
    },
    {
      name: 'Madeira',
      continent: 'South America',
      country: 'Brazil',
      length: 3380,
      difficulty: 'hard',
      wikiKeyword: 'Madeira_River',
    },

    // Asia
    {
      name: 'Yangtze',
      continent: 'Asia',
      country: 'China',
      length: 6300,
      difficulty: 'easy',
      wikiKeyword: 'Yangtze',
    },
    {
      name: 'Yellow River (Huang He)',
      continent: 'Asia',
      country: 'China',
      length: 5464,
      difficulty: 'medium',
      wikiKeyword: 'Yellow_River',
    },
    {
      name: 'Mekong',
      continent: 'Asia',
      country: 'Vietnam',
      length: 4350,
      difficulty: 'medium',
      wikiKeyword: 'Mekong',
    },
    {
      name: 'Ganges',
      continent: 'Asia',
      country: 'India',
      length: 2500,
      difficulty: 'easy',
      wikiKeyword: 'Ganges',
    },
    {
      name: 'Indus',
      continent: 'Asia',
      country: 'Pakistan',
      length: 3180,
      difficulty: 'medium',
      wikiKeyword: 'Indus_River',
    },
    {
      name: 'Brahmaputra',
      continent: 'Asia',
      country: 'India',
      length: 2900,
      difficulty: 'hard',
      wikiKeyword: 'Brahmaputra_River',
    },
    {
      name: 'Ob',
      continent: 'Asia',
      country: 'Russia',
      length: 5410,
      difficulty: 'hard',
      wikiKeyword: 'Ob_River',
    },
    {
      name: 'Lena',
      continent: 'Asia',
      country: 'Russia',
      length: 4400,
      difficulty: 'hard',
      wikiKeyword: 'Lena_River',
    },
    {
      name: 'Amur',
      continent: 'Asia',
      country: 'Russia/China',
      length: 2824,
      difficulty: 'hard',
      wikiKeyword: 'Amur_River',
    },

    // North America
    {
      name: 'Mississippi',
      continent: 'North America',
      country: 'USA',
      length: 3710,
      difficulty: 'easy',
      wikiKeyword: 'Mississippi_River',
    },
    {
      name: 'Missouri',
      continent: 'North America',
      country: 'USA',
      length: 4087,
      difficulty: 'medium',
      wikiKeyword: 'Missouri_River',
    },
    {
      name: 'Yukon',
      continent: 'North America',
      country: 'Canada',
      length: 3185,
      difficulty: 'medium',
      wikiKeyword: 'Yukon_River',
    },
    {
      name: 'Rio Grande',
      continent: 'North America',
      country: 'USA/Mexico',
      length: 3034,
      difficulty: 'medium',
      wikiKeyword: 'Rio_Grande',
    },
    {
      name: 'Colorado',
      continent: 'North America',
      country: 'USA',
      length: 2330,
      difficulty: 'hard',
      wikiKeyword: 'Colorado_River',
    },
    {
      name: 'Mackenzie',
      continent: 'North America',
      country: 'Canada',
      length: 4241,
      difficulty: 'hard',
      wikiKeyword: 'Mackenzie_River',
    },

    // Europe
    {
      name: 'Danube',
      continent: 'Europe',
      country: 'Germany',
      length: 2857,
      difficulty: 'easy',
      wikiKeyword: 'Danube',
    },
    {
      name: 'Volga',
      continent: 'Europe',
      country: 'Russia',
      length: 3530,
      difficulty: 'medium',
      wikiKeyword: 'Volga_River',
    },
    {
      name: 'Rhine',
      continent: 'Europe',
      country: 'Germany',
      length: 1230,
      difficulty: 'easy',
      wikiKeyword: 'Rhine',
    },
    {
      name: 'Loire',
      continent: 'Europe',
      country: 'France',
      length: 1012,
      difficulty: 'medium',
      wikiKeyword: 'Loire',
    },
    {
      name: 'Seine',
      continent: 'Europe',
      country: 'France',
      length: 777,
      difficulty: 'easy',
      wikiKeyword: 'Seine',
    },
    {
      name: 'Thames',
      continent: 'Europe',
      country: 'UK',
      length: 346,
      difficulty: 'easy',
      wikiKeyword: 'River_Thames',
    },
    {
      name: 'Elbe',
      continent: 'Europe',
      country: 'Germany',
      length: 1094,
      difficulty: 'medium',
      wikiKeyword: 'Elbe',
    },
    {
      name: 'Po',
      continent: 'Europe',
      country: 'Italy',
      length: 652,
      difficulty: 'medium',
      wikiKeyword: 'Po_(river)',
    },

    // Oceania
    {
      name: 'Murray',
      continent: 'Oceania',
      country: 'Australia',
      length: 2508,
      difficulty: 'easy',
      wikiKeyword: 'Murray_River',
    },
    {
      name: 'Darling',
      continent: 'Oceania',
      country: 'Australia',
      length: 1472,
      difficulty: 'medium',
      wikiKeyword: 'Darling_River',
    },
    {
      name: 'Waikato',
      continent: 'Oceania',
      country: 'New Zealand',
      length: 425,
      difficulty: 'easy',
      wikiKeyword: 'Waikato_River',
    },

    // Bonus
    {
      name: 'Shatt al-Arab',
      continent: 'Asia',
      country: 'Iraq',
      length: 200,
      difficulty: 'hard',
      wikiKeyword: 'Shatt_al-Arab',
    },
    {
      name: 'Tigris',
      continent: 'Asia',
      country: 'Iraq',
      length: 1850,
      difficulty: 'medium',
      wikiKeyword: 'Tigris',
    },
    {
      name: 'Euphrates',
      continent: 'Asia',
      country: 'Iraq',
      length: 2800,
      difficulty: 'medium',
      wikiKeyword: 'Euphrates',
    },
    {
      name: 'Jordan',
      continent: 'Asia',
      country: 'Israel/Jordan',
      length: 251,
      difficulty: 'easy',
      wikiKeyword: 'Jordan_River',
    },
    {
      name: 'Severn',
      continent: 'Europe',
      country: 'UK',
      length: 354,
      difficulty: 'medium',
      wikiKeyword: 'River_Severn',
    },
  ];

  // More data sources can be added similarly for a wider variety of questions
  const elements = [
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1 },
    { symbol: 'He', name: 'Helium', atomicNumber: 2 },
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3 },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4 },
    { symbol: 'B', name: 'Boron', atomicNumber: 5 },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6 },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7 },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8 },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9 },
    { symbol: 'Ne', name: 'Neon', atomicNumber: 10 },
    { symbol: 'Na', name: 'Sodium', atomicNumber: 11 },
    { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12 },
    { symbol: 'Al', name: 'Aluminium', atomicNumber: 13 },
    { symbol: 'Si', name: 'Silicon', atomicNumber: 14 },
    { symbol: 'P', name: 'Phosphorus', atomicNumber: 15 },
    { symbol: 'S', name: 'Sulfur', atomicNumber: 16 },
    { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17 },
    { symbol: 'Ar', name: 'Argon', atomicNumber: 18 },
    { symbol: 'K', name: 'Potassium', atomicNumber: 19 },
    { symbol: 'Ca', name: 'Calcium', atomicNumber: 20 },
    { symbol: 'Sc', name: 'Scandium', atomicNumber: 21 },
    { symbol: 'Ti', name: 'Titanium', atomicNumber: 22 },
    { symbol: 'V', name: 'Vanadium', atomicNumber: 23 },
    { symbol: 'Cr', name: 'Chromium', atomicNumber: 24 },
    { symbol: 'Mn', name: 'Manganese', atomicNumber: 25 },
    { symbol: 'Fe', name: 'Iron', atomicNumber: 26 },
    { symbol: 'Co', name: 'Cobalt', atomicNumber: 27 },
    { symbol: 'Ni', name: 'Nickel', atomicNumber: 28 },
    { symbol: 'Cu', name: 'Copper', atomicNumber: 29 },
    { symbol: 'Zn', name: 'Zinc', atomicNumber: 30 },
    { symbol: 'Ga', name: 'Gallium', atomicNumber: 31 },
    { symbol: 'Ge', name: 'Germanium', atomicNumber: 32 },
    { symbol: 'As', name: 'Arsenic', atomicNumber: 33 },
    { symbol: 'Se', name: 'Selenium', atomicNumber: 34 },
    { symbol: 'Br', name: 'Bromine', atomicNumber: 35 },
    { symbol: 'Kr', name: 'Krypton', atomicNumber: 36 },
    { symbol: 'Rb', name: 'Rubidium', atomicNumber: 37 },
    { symbol: 'Sr', name: 'Strontium', atomicNumber: 38 },
    { symbol: 'Y', name: 'Yttrium', atomicNumber: 39 },
    { symbol: 'Zr', name: 'Zirconium', atomicNumber: 40 },
    { symbol: 'Nb', name: 'Niobium', atomicNumber: 41 },
    { symbol: 'Mo', name: 'Molybdenum', atomicNumber: 42 },
    { symbol: 'Tc', name: 'Technetium', atomicNumber: 43 },
    { symbol: 'Ru', name: 'Ruthenium', atomicNumber: 44 },
    { symbol: 'Rh', name: 'Rhodium', atomicNumber: 45 },
    { symbol: 'Pd', name: 'Palladium', atomicNumber: 46 },
    { symbol: 'Ag', name: 'Silver', atomicNumber: 47 },
    { symbol: 'Cd', name: 'Cadmium', atomicNumber: 48 },
    { symbol: 'In', name: 'Indium', atomicNumber: 49 },
    { symbol: 'Sn', name: 'Tin', atomicNumber: 50 },
    { symbol: 'Sb', name: 'Antimony', atomicNumber: 51 },
    { symbol: 'Te', name: 'Tellurium', atomicNumber: 52 },
    { symbol: 'I', name: 'Iodine', atomicNumber: 53 },
    { symbol: 'Xe', name: 'Xenon', atomicNumber: 54 },
    { symbol: 'Cs', name: 'Cesium', atomicNumber: 55 },
    { symbol: 'Ba', name: 'Barium', atomicNumber: 56 },
    { symbol: 'La', name: 'Lanthanum', atomicNumber: 57 },
    { symbol: 'Ce', name: 'Cerium', atomicNumber: 58 },
    { symbol: 'Pr', name: 'Praseodymium', atomicNumber: 59 },
    { symbol: 'Nd', name: 'Neodymium', atomicNumber: 60 },
    { symbol: 'Pm', name: 'Promethium', atomicNumber: 61 },
    { symbol: 'Sm', name: 'Samarium', atomicNumber: 62 },
    { symbol: 'Eu', name: 'Europium', atomicNumber: 63 },
    { symbol: 'Gd', name: 'Gadolinium', atomicNumber: 64 },
    { symbol: 'Tb', name: 'Terbium', atomicNumber: 65 },
    { symbol: 'Dy', name: 'Dysprosium', atomicNumber: 66 },
    { symbol: 'Ho', name: 'Holmium', atomicNumber: 67 },
    { symbol: 'Er', name: 'Erbium', atomicNumber: 68 },
    { symbol: 'Tm', name: 'Thulium', atomicNumber: 69 },
    { symbol: 'Yb', name: 'Ytterbium', atomicNumber: 70 },
    { symbol: 'Lu', name: 'Lutetium', atomicNumber: 71 },
    { symbol: 'Hf', name: 'Hafnium', atomicNumber: 72 },
    { symbol: 'Ta', name: 'Tantalum', atomicNumber: 73 },
    { symbol: 'W', name: 'Tungsten', atomicNumber: 74 },
    { symbol: 'Re', name: 'Rhenium', atomicNumber: 75 },
    { symbol: 'Os', name: 'Osmium', atomicNumber: 76 },
    { symbol: 'Ir', name: 'Iridium', atomicNumber: 77 },
    { symbol: 'Pt', name: 'Platinum', atomicNumber: 78 },
    { symbol: 'Au', name: 'Gold', atomicNumber: 79 },
    { symbol: 'Hg', name: 'Mercury', atomicNumber: 80 },
    { symbol: 'Tl', name: 'Thallium', atomicNumber: 81 },
    { symbol: 'Pb', name: 'Lead', atomicNumber: 82 },
    { symbol: 'Bi', name: 'Bismuth', atomicNumber: 83 },
    { symbol: 'Po', name: 'Polonium', atomicNumber: 84 },
    { symbol: 'At', name: 'Astatine', atomicNumber: 85 },
    { symbol: 'Rn', name: 'Radon', atomicNumber: 86 },
    { symbol: 'Fr', name: 'Francium', atomicNumber: 87 },
    { symbol: 'Ra', name: 'Radium', atomicNumber: 88 },
    { symbol: 'Ac', name: 'Actinium', atomicNumber: 89 },
    { symbol: 'Th', name: 'Thorium', atomicNumber: 90 },
    { symbol: 'Pa', name: 'Protactinium', atomicNumber: 91 },
    { symbol: 'U', name: 'Uranium', atomicNumber: 92 },
    { symbol: 'Np', name: 'Neptunium', atomicNumber: 93 },
    { symbol: 'Pu', name: 'Plutonium', atomicNumber: 94 },
    { symbol: 'Am', name: 'Americium', atomicNumber: 95 },
    { symbol: 'Cm', name: 'Curium', atomicNumber: 96 },
    { symbol: 'Bk', name: 'Berkelium', atomicNumber: 97 },
    { symbol: 'Cf', name: 'Californium', atomicNumber: 98 },
    { symbol: 'Es', name: 'Einsteinium', atomicNumber: 99 },
    { symbol: 'Fm', name: 'Fermium', atomicNumber: 100 },
  ];

  const historicalEvents = [
    {
      event: 'Fall of the Berlin Wall',
      year: 1989,
      country: 'Germany',
      wikiKeyword: 'Fall_of_the_Berlin_Wall',
    },
    {
      event: 'Moon Landing',
      year: 1969,
      country: 'USA',
      wikiKeyword: 'Moon_landing',
    },
    {
      event: 'End of World War II',
      year: 1945,
      country: 'Global',
      wikiKeyword: 'End_of_World_War_II',
    },
    {
      event: 'French Revolution',
      year: 1789,
      country: 'France',
      wikiKeyword: 'French_Revolution',
    },
    {
      event: 'Independence of India',
      year: 1947,
      country: 'India',
      wikiKeyword: 'Indian_independence',
    },
    {
      event: 'American Declaration of Independence',
      year: 1776,
      country: 'USA',
      wikiKeyword: 'United_States_Declaration_of_Independence',
    },
    {
      event: 'Russian Revolution',
      year: 1917,
      country: 'Russia',
      wikiKeyword: 'Russian_Revolution',
    },
    {
      event: 'Start of World War I',
      year: 1914,
      country: 'Global',
      wikiKeyword: 'World_War_I',
    },
    {
      event: 'Start of World War II',
      year: 1939,
      country: 'Global',
      wikiKeyword: 'World_War_II',
    },
    {
      event: 'Cuban Missile Crisis',
      year: 1962,
      country: 'USA',
      wikiKeyword: 'Cuban_Missile_Crisis',
    },
    {
      event: 'Moon Landing Apollo 11',
      year: 1969,
      country: 'USA',
      wikiKeyword: 'Apollo_11',
    },
    {
      event: 'Fall of Ottoman Empire',
      year: 1922,
      country: 'Turkey',
      wikiKeyword: 'Dissolution_of_the_Ottoman_Empire',
    },
    {
      event: 'Indian Constitution Adopted',
      year: 1950,
      country: 'India',
      wikiKeyword: 'Constitution_of_India',
    },
    {
      event: 'Korean War Start',
      year: 1950,
      country: 'South Korea',
      wikiKeyword: 'Korean_War',
    },
    {
      event: 'Vietnam War Start',
      year: 1955,
      country: 'Vietnam',
      wikiKeyword: 'Vietnam_War',
    },
    {
      event: 'Cuban Revolution',
      year: 1959,
      country: 'Cuba',
      wikiKeyword: 'Cuban_Revolution',
    },
    {
      event: 'Assassination of JFK',
      year: 1963,
      country: 'USA',
      wikiKeyword: 'Assassination_of_John_F._Kennedy',
    },
    {
      event: 'Chernobyl Disaster',
      year: 1986,
      country: 'Soviet Union',
      wikiKeyword: 'Chernobyl_disaster',
    },
    {
      event: 'Tiananmen Square Protests',
      year: 1989,
      country: 'China',
      wikiKeyword: '1989_Tiananmen_Square_protests_and_massacre',
    },
    {
      event: 'Gulf War',
      year: 1991,
      country: 'Kuwait',
      wikiKeyword: 'Gulf_War',
    },
    {
      event: '9/11 Terrorist Attacks',
      year: 2001,
      country: 'USA',
      wikiKeyword: 'September_11_attacks',
    },
    {
      event: 'Indian Ocean Tsunami',
      year: 2004,
      country: 'Global',
      wikiKeyword: '2004_Indian_Ocean_earthquake_and_tsunami',
    },
    {
      event: 'Brexit Referendum',
      year: 2016,
      country: 'UK',
      wikiKeyword: '2016_United_Kingdom_European_Union_membership_referendum',
    },
  ];

  const planets = [
    {
      name: 'Mercury',
      type: 'Terrestrial',
      distanceFromSun: 57.9,
      radius: 2439.7,
      mass: 0.055,
      orbitalPeriod: 0.24,
      moons: 0,
      difficulty: 'easy',
    },
    {
      name: 'Venus',
      type: 'Terrestrial',
      distanceFromSun: 108.2,
      radius: 6051.8,
      mass: 0.815,
      orbitalPeriod: 0.62,
      moons: 0,
      difficulty: 'easy',
    },
    {
      name: 'Earth',
      type: 'Terrestrial',
      distanceFromSun: 149.6,
      radius: 6371,
      mass: 1,
      orbitalPeriod: 1,
      moons: 1,
      difficulty: 'easy',
    },
    {
      name: 'Mars',
      type: 'Terrestrial',
      distanceFromSun: 227.9,
      radius: 3389.5,
      mass: 0.107,
      orbitalPeriod: 1.88,
      moons: 2,
      difficulty: 'easy',
    },
    {
      name: 'Jupiter',
      type: 'Gas Giant',
      distanceFromSun: 778.5,
      radius: 69911,
      mass: 317.8,
      orbitalPeriod: 11.86,
      moons: 95,
      difficulty: 'medium',
    },
    {
      name: 'Saturn',
      type: 'Gas Giant',
      distanceFromSun: 1434,
      radius: 58232,
      mass: 95.2,
      orbitalPeriod: 29.46,
      moons: 146,
      difficulty: 'medium',
    },
    {
      name: 'Uranus',
      type: 'Ice Giant',
      distanceFromSun: 2871,
      radius: 25362,
      mass: 14.5,
      orbitalPeriod: 84,
      moons: 27,
      difficulty: 'hard',
    },
    {
      name: 'Neptune',
      type: 'Ice Giant',
      distanceFromSun: 4495,
      radius: 24622,
      mass: 17.1,
      orbitalPeriod: 164.8,
      moons: 14,
      difficulty: 'hard',
    },
  ];

  const animals = [
    { name: 'Blue Whale', type: 'Mammal', habitat: 'Ocean', weight: 190000 },
    { name: 'African Elephant', type: 'Mammal', habitat: 'Land', weight: 6000 },
    { name: 'Lion', type: 'Mammal', habitat: 'Land', weight: 190 },
    { name: 'Great White Shark', type: 'Fish', habitat: 'Ocean', weight: 2000 },
    { name: 'Giraffe', type: 'Mammal', habitat: 'Land', weight: 1200 },
    { name: 'Penguin', type: 'Bird', habitat: 'Ocean', weight: 30 },
    { name: 'Polar Bear', type: 'Mammal', habitat: 'Land', weight: 700 },
    { name: 'Sea Turtle', type: 'Reptile', habitat: 'Ocean', weight: 500 },
    { name: 'Eagle', type: 'Bird', habitat: 'Land', weight: 6 },
    { name: 'Crocodile', type: 'Reptile', habitat: 'Land', weight: 400 },
    { name: 'Kangaroo', type: 'Mammal', habitat: 'Land', weight: 90 },
    { name: 'Dolphin', type: 'Mammal', habitat: 'Ocean', weight: 300 },
    { name: 'Ostrich', type: 'Bird', habitat: 'Land', weight: 140 },
    { name: 'Cheetah', type: 'Mammal', habitat: 'Land', weight: 75 },
    { name: 'Octopus', type: 'Mollusk', habitat: 'Ocean', weight: 15 },
    { name: 'Red Panda', type: 'Mammal', habitat: 'Land', weight: 4 },
    { name: 'Manta Ray', type: 'Fish', habitat: 'Ocean', weight: 2000 },
    { name: 'Gorilla', type: 'Mammal', habitat: 'Land', weight: 160 },
    { name: 'Manatee', type: 'Mammal', habitat: 'Ocean', weight: 500 },
    { name: 'Zebra', type: 'Mammal', habitat: 'Land', weight: 350 },
    { name: 'Hippopotamus', type: 'Mammal', habitat: 'Land', weight: 1500 },
    { name: 'Anaconda', type: 'Reptile', habitat: 'Land', weight: 250 },
    {
      name: 'Blue-ringed Octopus',
      type: 'Mollusk',
      habitat: 'Ocean',
      weight: 0.1,
    },
    { name: 'Sloth', type: 'Mammal', habitat: 'Land', weight: 5 },
    { name: 'Beluga Whale', type: 'Mammal', habitat: 'Ocean', weight: 1600 },
  ];

  const technologies = [
    {
      name: 'Internet',
      inventor: 'Vint Cerf & Bob Kahn',
      year: 1983,
      difficulty: 'easy',
    },
    {
      name: 'Telephone',
      inventor: 'Alexander Graham Bell',
      year: 1876,
      difficulty: 'easy',
    },
    {
      name: 'Light Bulb',
      inventor: 'Thomas Edison',
      year: 1879,
      difficulty: 'easy',
    },
    {
      name: 'Printing Press',
      inventor: 'Johannes Gutenberg',
      year: 1440,
      difficulty: 'medium',
    },
    {
      name: 'Radio',
      inventor: 'Guglielmo Marconi',
      year: 1895,
      difficulty: 'easy',
    },
    {
      name: 'Television',
      inventor: 'Philo Farnsworth',
      year: 1927,
      difficulty: 'easy',
    },
    {
      name: 'Computer',
      inventor: 'Charles Babbage (concept), Alan Turing (foundations)',
      year: 1936,
      difficulty: 'medium',
    },
    {
      name: 'World Wide Web',
      inventor: 'Tim Berners-Lee',
      year: 1989,
      difficulty: 'easy',
    },
    {
      name: 'Airplane',
      inventor: 'Wright Brothers',
      year: 1903,
      difficulty: 'easy',
    },
    {
      name: 'Automobile',
      inventor: 'Karl Benz',
      year: 1886,
      difficulty: 'easy',
    },
    {
      name: 'Steam Engine',
      inventor: 'James Watt',
      year: 1769,
      difficulty: 'medium',
    },
    {
      name: 'Electric Motor',
      inventor: 'Michael Faraday',
      year: 1821,
      difficulty: 'medium',
    },
    {
      name: 'Camera',
      inventor: 'Joseph Nicéphore Niépce',
      year: 1816,
      difficulty: 'medium',
    },
    {
      name: 'Microscope',
      inventor: 'Zacharias Janssen',
      year: 1590,
      difficulty: 'hard',
    },
    {
      name: 'Telescope',
      inventor: 'Hans Lippershey',
      year: 1608,
      difficulty: 'hard',
    },
    {
      name: 'Vaccination',
      inventor: 'Edward Jenner',
      year: 1796,
      difficulty: 'medium',
    },
    {
      name: 'Penicillin',
      inventor: 'Alexander Fleming',
      year: 1928,
      difficulty: 'easy',
    },
    {
      name: 'X-ray',
      inventor: 'Wilhelm Röntgen',
      year: 1895,
      difficulty: 'medium',
    },
    {
      name: 'Nuclear Reactor',
      inventor: 'Enrico Fermi',
      year: 1942,
      difficulty: 'hard',
    },
    {
      name: 'Transistor',
      inventor: 'John Bardeen, Walter Brattain & William Shockley',
      year: 1947,
      difficulty: 'medium',
    },
    {
      name: 'Microchip',
      inventor: 'Jack Kilby & Robert Noyce',
      year: 1959,
      difficulty: 'medium',
    },
    {
      name: 'Laser',
      inventor: 'Theodore Maiman',
      year: 1960,
      difficulty: 'medium',
    },
    {
      name: 'Satellite',
      inventor: 'Sputnik (Soviet Union)',
      year: 1957,
      difficulty: 'medium',
    },
    {
      name: 'GPS',
      inventor: 'U.S. Department of Defense',
      year: 1978,
      difficulty: 'easy',
    },
    {
      name: 'Smartphone',
      inventor: 'IBM Simon (early), Apple iPhone (popularized)',
      year: 1992,
      difficulty: 'easy',
    },
    {
      name: 'Email',
      inventor: 'Ray Tomlinson',
      year: 1971,
      difficulty: 'easy',
    },
    {
      name: 'Blockchain',
      inventor: 'Satoshi Nakamoto',
      year: 2008,
      difficulty: 'medium',
    },
    {
      name: 'Artificial Intelligence',
      inventor: 'John McCarthy (term coined)',
      year: 1956,
      difficulty: 'hard',
    },
    {
      name: '3D Printing',
      inventor: 'Chuck Hull',
      year: 1983,
      difficulty: 'medium',
    },
    {
      name: 'Electric Battery',
      inventor: 'Alessandro Volta',
      year: 1800,
      difficulty: 'medium',
    },
    {
      name: 'Solar Cell',
      inventor: 'Charles Fritts',
      year: 1883,
      difficulty: 'medium',
    },
    {
      name: 'Wind Turbine',
      inventor: 'Charles F. Brush',
      year: 1888,
      difficulty: 'medium',
    },
    {
      name: 'Rocket',
      inventor: 'Konstantin Tsiolkovsky (concept), Robert Goddard (practical)',
      year: 1926,
      difficulty: 'hard',
    },
    {
      name: 'MRI Scanner',
      inventor: 'Paul Lauterbur & Peter Mansfield',
      year: 1973,
      difficulty: 'hard',
    },
    {
      name: 'CRISPR Gene Editing',
      inventor: 'Jennifer Doudna & Emmanuelle Charpentier',
      year: 2012,
      difficulty: 'hard',
    },
    {
      name: 'Electric Car',
      inventor: 'Thomas Parker',
      year: 1884,
      difficulty: 'medium',
    },
    {
      name: 'Steam Locomotive',
      inventor: 'George Stephenson',
      year: 1814,
      difficulty: 'medium',
    },
    {
      name: 'Refrigerator',
      inventor: 'Carl von Linde',
      year: 1876,
      difficulty: 'easy',
    },
    {
      name: 'Air Conditioning',
      inventor: 'Willis Carrier',
      year: 1902,
      difficulty: 'easy',
    },
    {
      name: 'Elevator Safety Brake',
      inventor: 'Elisha Otis',
      year: 1853,
      difficulty: 'easy',
    },
    {
      name: 'Typewriter',
      inventor: 'Christopher Latham Sholes',
      year: 1868,
      difficulty: 'medium',
    },
    {
      name: 'Mechanical Clock',
      inventor: 'Yi Xing (early), European refinements',
      year: 725,
      difficulty: 'hard',
    },
    {
      name: 'Calculator',
      inventor: 'Blaise Pascal',
      year: 1642,
      difficulty: 'medium',
    },
    {
      name: 'ATM',
      inventor: 'John Shepherd-Barron',
      year: 1967,
      difficulty: 'easy',
    },
    {
      name: 'Credit Card',
      inventor: 'Frank McNamara (Diners Club)',
      year: 1950,
      difficulty: 'easy',
    },
    {
      name: 'Microwave Oven',
      inventor: 'Percy Spencer',
      year: 1945,
      difficulty: 'easy',
    },
    {
      name: 'Compact Disc (CD)',
      inventor: 'James Russell',
      year: 1966,
      difficulty: 'medium',
    },
    {
      name: 'Digital Camera',
      inventor: 'Steven Sasson',
      year: 1975,
      difficulty: 'easy',
    },
    {
      name: 'Video Game Console',
      inventor: 'Ralph Baer',
      year: 1967,
      difficulty: 'easy',
    },
    {
      name: 'Laptop',
      inventor: 'Bill Moggridge (Grid Compass)',
      year: 1981,
      difficulty: 'easy',
    },
    {
      name: 'Tablet Computer',
      inventor: 'Apple (iPad)',
      year: 2010,
      difficulty: 'easy',
    },
  ];

  const mountains = [
    // Asia
    {
      name: 'Mount Everest',
      height: 8849,
      country: 'Nepal',
      difficulty: 'hard',
    },
    { name: 'K2', height: 8611, country: 'Pakistan', difficulty: 'hard' },
    {
      name: 'Kangchenjunga',
      height: 8586,
      country: 'India/Nepal',
      difficulty: 'hard',
    },
    { name: 'Lhotse', height: 8516, country: 'Nepal', difficulty: 'hard' },
    { name: 'Makalu', height: 8485, country: 'Nepal', difficulty: 'hard' },
    { name: 'Manaslu', height: 8163, country: 'Nepal', difficulty: 'hard' },
    {
      name: 'Nanga Parbat',
      height: 8126,
      country: 'Pakistan',
      difficulty: 'hard',
    },
    { name: 'Annapurna I', height: 8091, country: 'Nepal', difficulty: 'hard' },
    {
      name: 'Shishapangma',
      height: 8027,
      country: 'China',
      difficulty: 'hard',
    },
    { name: 'Mount Fuji', height: 3776, country: 'Japan', difficulty: 'easy' },

    // Europe
    {
      name: 'Mont Blanc',
      height: 4808,
      country: 'France/Italy',
      difficulty: 'medium',
    },
    {
      name: 'Matterhorn',
      height: 4478,
      country: 'Switzerland/Italy',
      difficulty: 'hard',
    },
    { name: 'Elbrus', height: 5642, country: 'Russia', difficulty: 'medium' },
    { name: 'Eiger', height: 3970, country: 'Switzerland', difficulty: 'hard' },
    {
      name: 'Ben Nevis',
      height: 1345,
      country: 'United Kingdom',
      difficulty: 'easy',
    },

    // Africa
    {
      name: 'Mount Kilimanjaro',
      height: 5895,
      country: 'Tanzania',
      difficulty: 'medium',
    },
    {
      name: 'Mount Kenya',
      height: 5199,
      country: 'Kenya',
      difficulty: 'medium',
    },
    {
      name: 'Ras Dashen',
      height: 4550,
      country: 'Ethiopia',
      difficulty: 'medium',
    },
    {
      name: 'Table Mountain',
      height: 1085,
      country: 'South Africa',
      difficulty: 'easy',
    },
    {
      name: 'Simien Mountains',
      height: 4620,
      country: 'Ethiopia',
      difficulty: 'hard',
    },

    // North America
    {
      name: 'Denali (Mount McKinley)',
      height: 6190,
      country: 'USA',
      difficulty: 'hard',
    },
    {
      name: 'Mount Logan',
      height: 5959,
      country: 'Canada',
      difficulty: 'hard',
    },
    {
      name: 'Pico de Orizaba',
      height: 5636,
      country: 'Mexico',
      difficulty: 'medium',
    },
    {
      name: 'Mount Rainier',
      height: 4392,
      country: 'USA',
      difficulty: 'medium',
    },
    {
      name: 'Mount Whitney',
      height: 4421,
      country: 'USA',
      difficulty: 'medium',
    },

    // South America
    {
      name: 'Aconcagua',
      height: 6961,
      country: 'Argentina',
      difficulty: 'hard',
    },
    { name: 'Huascarán', height: 6768, country: 'Peru', difficulty: 'hard' },
    {
      name: 'Chimborazo',
      height: 6263,
      country: 'Ecuador',
      difficulty: 'medium',
    },
    {
      name: 'Illimani',
      height: 6438,
      country: 'Bolivia',
      difficulty: 'medium',
    },
    {
      name: 'Cotopaxi',
      height: 5897,
      country: 'Ecuador',
      difficulty: 'medium',
    },

    // Oceania
    {
      name: 'Puncak Jaya (Carstensz Pyramid)',
      height: 4884,
      country: 'Indonesia',
      difficulty: 'hard',
    },
    {
      name: 'Mount Wilhelm',
      height: 4509,
      country: 'Papua New Guinea',
      difficulty: 'medium',
    },
    {
      name: 'Mount Cook (Aoraki)',
      height: 3724,
      country: 'New Zealand',
      difficulty: 'medium',
    },
    {
      name: 'Mount Kosciuszko',
      height: 2228,
      country: 'Australia',
      difficulty: 'easy',
    },

    // Antarctica
    {
      name: 'Mount Vinson',
      height: 4892,
      country: 'Antarctica',
      difficulty: 'hard',
    },
    {
      name: 'Mount Erebus',
      height: 3794,
      country: 'Antarctica',
      difficulty: 'hard',
    },
  ];
  const molecules = [
    // Simple inorganic
    {
      name: 'Water',
      formula: 'H2O',
      type: 'Inorganic',
      molarMass: 18.02,
      difficulty: 'easy',
    },
    {
      name: 'Carbon Dioxide',
      formula: 'CO2',
      type: 'Inorganic',
      molarMass: 44.01,
      difficulty: 'easy',
    },
    {
      name: 'Oxygen',
      formula: 'O2',
      type: 'Inorganic',
      molarMass: 32.0,
      difficulty: 'easy',
    },
    {
      name: 'Nitrogen',
      formula: 'N2',
      type: 'Inorganic',
      molarMass: 28.02,
      difficulty: 'easy',
    },
    {
      name: 'Methane',
      formula: 'CH4',
      type: 'Organic',
      molarMass: 16.04,
      difficulty: 'easy',
    },
    {
      name: 'Ammonia',
      formula: 'NH3',
      type: 'Inorganic',
      molarMass: 17.03,
      difficulty: 'medium',
    },
    {
      name: 'Sulfur Dioxide',
      formula: 'SO2',
      type: 'Inorganic',
      molarMass: 64.07,
      difficulty: 'medium',
    },
    {
      name: 'Hydrogen Peroxide',
      formula: 'H2O2',
      type: 'Inorganic',
      molarMass: 34.01,
      difficulty: 'medium',
    },
    {
      name: 'Ozone',
      formula: 'O3',
      type: 'Inorganic',
      molarMass: 48.0,
      difficulty: 'medium',
    },
    {
      name: 'Nitrous Oxide',
      formula: 'N2O',
      type: 'Inorganic',
      molarMass: 44.01,
      difficulty: 'medium',
    },

    // Everyday compounds
    {
      name: 'Table Salt (Sodium Chloride)',
      formula: 'NaCl',
      type: 'Inorganic',
      molarMass: 58.44,
      difficulty: 'easy',
    },
    {
      name: 'Glucose',
      formula: 'C6H12O6',
      type: 'Biomolecule',
      molarMass: 180.16,
      difficulty: 'medium',
    },
    {
      name: 'Ethanol',
      formula: 'C2H5OH',
      type: 'Organic',
      molarMass: 46.07,
      difficulty: 'medium',
    },
    {
      name: 'Sucrose',
      formula: 'C12H22O11',
      type: 'Biomolecule',
      molarMass: 342.3,
      difficulty: 'medium',
    },
    {
      name: 'Acetic Acid',
      formula: 'CH3COOH',
      type: 'Organic',
      molarMass: 60.05,
      difficulty: 'medium',
    },
    {
      name: 'Citric Acid',
      formula: 'C6H8O7',
      type: 'Organic',
      molarMass: 192.12,
      difficulty: 'medium',
    },
    {
      name: 'Baking Soda (Sodium Bicarbonate)',
      formula: 'NaHCO3',
      type: 'Inorganic',
      molarMass: 84.01,
      difficulty: 'easy',
    },
    {
      name: 'Calcium Carbonate',
      formula: 'CaCO3',
      type: 'Inorganic',
      molarMass: 100.09,
      difficulty: 'medium',
    },
    {
      name: 'Silicon Dioxide',
      formula: 'SiO2',
      type: 'Inorganic',
      molarMass: 60.08,
      difficulty: 'medium',
    },
    {
      name: 'Phosphoric Acid',
      formula: 'H3PO4',
      type: 'Inorganic',
      molarMass: 97.99,
      difficulty: 'medium',
    },

    // Biomolecules
    {
      name: 'DNA',
      formula: 'Nucleotides (A,T,G,C)',
      type: 'Biomolecule',
      molarMass: 650,
      difficulty: 'hard',
    },
    {
      name: 'RNA',
      formula: 'Nucleotides (A,U,G,C)',
      type: 'Biomolecule',
      molarMass: 650,
      difficulty: 'hard',
    },
    {
      name: 'Hemoglobin',
      formula: 'Protein Complex',
      type: 'Biomolecule',
      molarMass: 64500,
      difficulty: 'hard',
    },
    {
      name: 'Cholesterol',
      formula: 'C27H46O',
      type: 'Organic',
      molarMass: 386.65,
      difficulty: 'medium',
    },
    {
      name: 'ATP (Adenosine Triphosphate)',
      formula: 'C10H16N5O13P3',
      type: 'Biomolecule',
      molarMass: 507.18,
      difficulty: 'hard',
    },
    {
      name: 'Insulin',
      formula: 'Protein Hormone',
      type: 'Biomolecule',
      molarMass: 5800,
      difficulty: 'hard',
    },
    {
      name: 'Collagen',
      formula: 'Protein Complex',
      type: 'Biomolecule',
      molarMass: ~300000,
      difficulty: 'hard',
    },
    {
      name: 'Keratin',
      formula: 'Protein Complex',
      type: 'Biomolecule',
      molarMass: ~50000,
      difficulty: 'hard',
    },
    {
      name: 'Vitamin D',
      formula: 'C27H44O',
      type: 'Organic',
      molarMass: 384.65,
      difficulty: 'medium',
    },
    {
      name: 'Vitamin B12',
      formula: 'C63H88CoN14O14P',
      type: 'Biomolecule',
      molarMass: 1355.37,
      difficulty: 'hard',
    },

    // Pharmaceuticals
    {
      name: 'Aspirin',
      formula: 'C9H8O4',
      type: 'Pharmaceutical',
      molarMass: 180.16,
      difficulty: 'medium',
    },
    {
      name: 'Paracetamol (Acetaminophen)',
      formula: 'C8H9NO2',
      type: 'Pharmaceutical',
      molarMass: 151.16,
      difficulty: 'medium',
    },
    {
      name: 'Ibuprofen',
      formula: 'C13H18O2',
      type: 'Pharmaceutical',
      molarMass: 206.28,
      difficulty: 'medium',
    },
    {
      name: 'Penicillin',
      formula: 'C16H18N2O4S',
      type: 'Pharmaceutical',
      molarMass: 334.4,
      difficulty: 'hard',
    },
    {
      name: 'Morphine',
      formula: 'C17H19NO3',
      type: 'Pharmaceutical',
      molarMass: 285.34,
      difficulty: 'hard',
    },
    {
      name: 'Caffeine',
      formula: 'C8H10N4O2',
      type: 'Pharmaceutical',
      molarMass: 194.19,
      difficulty: 'medium',
    },
    {
      name: 'Nicotine',
      formula: 'C10H14N2',
      type: 'Pharmaceutical',
      molarMass: 162.23,
      difficulty: 'medium',
    },
    {
      name: 'Codeine',
      formula: 'C18H21NO3',
      type: 'Pharmaceutical',
      molarMass: 299.36,
      difficulty: 'hard',
    },
    {
      name: 'Diazepam',
      formula: 'C16H13ClN2O',
      type: 'Pharmaceutical',
      molarMass: 284.74,
      difficulty: 'hard',
    },
    {
      name: 'Amoxicillin',
      formula: 'C16H19N3O5S',
      type: 'Pharmaceutical',
      molarMass: 365.4,
      difficulty: 'hard',
    },

    // Industrial chemicals
    {
      name: 'Polyethylene',
      formula: '(C2H4)n',
      type: 'Polymer',
      molarMass: ~28000,
      difficulty: 'medium',
    },
    {
      name: 'Polyvinyl Chloride (PVC)',
      formula: '(C2H3Cl)n',
      type: 'Polymer',
      molarMass: ~60000,
      difficulty: 'medium',
    },
    {
      name: 'Polystyrene',
      formula: '(C8H8)n',
      type: 'Polymer',
      molarMass: ~100000,
      difficulty: 'medium',
    },
    {
      name: 'Teflon (PTFE)',
      formula: '(C2F4)n',
      type: 'Polymer',
      molarMass: ~100000,
      difficulty: 'medium',
    },
    {
      name: 'Nylon-6',
      formula: '(C6H11NO)n',
      type: 'Polymer',
      molarMass: ~113,
      difficulty: 'medium',
    },
    {
      name: 'Kevlar',
      formula: '(C14H10N2O2)n',
      type: 'Polymer',
      molarMass: ~238,
      difficulty: 'hard',
    },
    {
      name: 'Polyester',
      formula: '(C10H8O4)n',
      type: 'Polymer',
      molarMass: ~192,
      difficulty: 'medium',
    },
    {
      name: 'Polypropylene',
      formula: '(C3H6)n',
      type: 'Polymer',
      molarMass: ~42,
      difficulty: 'medium',
    },
    {
      name: 'Polycarbonate',
      formula: '(C16H14O3)n',
      type: 'Polymer',
      molarMass: ~254,
      difficulty: 'medium',
    },
    {
      name: 'Polyurethane',
      formula: '(C25H42N2O6)n',
      type: 'Polymer',
      molarMass: ~470,
      difficulty: 'medium',
    },
    {
      name: 'Polyethylene Terephthalate (PET)',
      formula: '(C10H8O4)n',
      type: 'Polymer',
      molarMass: ~192,
      difficulty: 'medium',
    },
    {
      name: 'Polylactic Acid (PLA)',
      formula: '(C3H4O2)n',
      type: 'Polymer',
      molarMass: ~72,
      difficulty: 'medium',
    },
    {
      name: 'Polyvinyl Alcohol (PVA)',
      formula: '(C2H4O)n',
      type: 'Polymer',
      molarMass: ~44,
      difficulty: 'medium',
    },

    // Environmental molecules
    {
      name: 'Carbon Monoxide',
      formula: 'CO',
      type: 'Inorganic',
      molarMass: 28.01,
      difficulty: 'medium',
    },
    {
      name: 'Nitric Oxide',
      formula: 'NO',
      type: 'Inorganic',
      molarMass: 30.01,
      difficulty: 'medium',
    },
    {
      name: 'Nitrogen Dioxide',
      formula: 'NO2',
      type: 'Inorganic',
      molarMass: 46.01,
      difficulty: 'medium',
    },
    {
      name: 'Sulfur Hexafluoride',
      formula: 'SF6',
      type: 'Inorganic',
      molarMass: 146.06,
      difficulty: 'hard',
    },
    {
      name: 'Chlorofluorocarbon (CFC-12)',
      formula: 'CCl2F2',
      type: 'Organic',
      molarMass: 120.91,
      difficulty: 'hard',
    },
    {
      name: 'Hydrochlorofluorocarbon (HCFC-22)',
      formula: 'CHClF2',
      type: 'Organic',
      molarMass: 86.47,
      difficulty: 'hard',
    },
    {
      name: 'Perfluorooctanoic Acid (PFOA)',
      formula: 'C8HF15O2',
      type: 'Organic',
      molarMass: 414.07,
      difficulty: 'hard',
    },

    // Advanced organics & biochemistry
    {
      name: 'Serotonin',
      formula: 'C10H12N2O',
      type: 'Biomolecule',
      molarMass: 176.21,
      difficulty: 'hard',
    },
    {
      name: 'Dopamine',
      formula: 'C8H11NO2',
      type: 'Biomolecule',
      molarMass: 153.18,
      difficulty: 'medium',
    },
    {
      name: 'Histamine',
      formula: 'C5H9N3',
      type: 'Biomolecule',
      molarMass: 111.15,
      difficulty: 'medium',
    },
    {
      name: 'Adrenaline (Epinephrine)',
      formula: 'C9H13NO3',
      type: 'Biomolecule',
      molarMass: 183.2,
      difficulty: 'medium',
    },
    {
      name: 'Thyroxine (T4)',
      formula: 'C15H11I4NO4',
      type: 'Biomolecule',
      molarMass: 776.87,
      difficulty: 'hard',
    },
    {
      name: 'Estrogen (Estradiol)',
      formula: 'C18H24O2',
      type: 'Biomolecule',
      molarMass: 272.39,
      difficulty: 'hard',
    },
    {
      name: 'Testosterone',
      formula: 'C19H28O2',
      type: 'Biomolecule',
      molarMass: 288.42,
      difficulty: 'hard',
    },
    {
      name: 'Progesterone',
      formula: 'C21H30O2',
      type: 'Biomolecule',
      molarMass: 314.47,
      difficulty: 'hard',
    },

    // Vitamins & nutrients
    {
      name: 'Vitamin A (Retinol)',
      formula: 'C20H30O',
      type: 'Organic',
      molarMass: 286.45,
      difficulty: 'medium',
    },
    {
      name: 'Vitamin E (Tocopherol)',
      formula: 'C29H50O2',
      type: 'Organic',
      molarMass: 430.71,
      difficulty: 'medium',
    },
    {
      name: 'Vitamin K1',
      formula: 'C31H46O2',
      type: 'Organic',
      molarMass: 450.72,
      difficulty: 'hard',
    },
    {
      name: 'Folic Acid',
      formula: 'C19H19N7O6',
      type: 'Biomolecule',
      molarMass: 441.4,
      difficulty: 'hard',
    },

    // Amino acids
    {
      name: 'Glycine',
      formula: 'C2H5NO2',
      type: 'Biomolecule',
      molarMass: 75.07,
      difficulty: 'medium',
    },
    {
      name: 'Alanine',
      formula: 'C3H7NO2',
      type: 'Biomolecule',
      molarMass: 89.09,
      difficulty: 'medium',
    },
    {
      name: 'Valine',
      formula: 'C5H11NO2',
      type: 'Biomolecule',
      molarMass: 117.15,
      difficulty: 'medium',
    },
    {
      name: 'Leucine',
      formula: 'C6H13NO2',
      type: 'Biomolecule',
      molarMass: 131.17,
      difficulty: 'medium',
    },
    {
      name: 'Isoleucine',
      formula: 'C6H13NO2',
      type: 'Biomolecule',
      molarMass: 131.17,
      difficulty: 'medium',
    },
    {
      name: 'Phenylalanine',
      formula: 'C9H11NO2',
      type: 'Biomolecule',
      molarMass: 165.19,
      difficulty: 'hard',
    },
    {
      name: 'Tryptophan',
      formula: 'C11H12N2O2',
      type: 'Biomolecule',
      molarMass: 204.23,
      difficulty: 'hard',
    },
    {
      name: 'Tyrosine',
      formula: 'C9H11NO3',
      type: 'Biomolecule',
      molarMass: 181.19,
      difficulty: 'hard',
    },

    // Carbohydrates
    {
      name: 'Lactose',
      formula: 'C12H22O11',
      type: 'Biomolecule',
      molarMass: 342.3,
      difficulty: 'medium',
    },
    {
      name: 'Maltose',
      formula: 'C12H22O11',
      type: 'Biomolecule',
      molarMass: 342.3,
      difficulty: 'medium',
    },
    {
      name: 'Cellulose',
      formula: '(C6H10O5)n',
      type: 'Polymer',
      molarMass: ~162,
      difficulty: 'hard',
    },
    {
      name: 'Starch',
      formula: '(C6H10O5)n',
      type: 'Polymer',
      molarMass: ~162,
      difficulty: 'hard',
    },
    {
      name: 'Glycogen',
      formula: '(C6H10O5)n',
      type: 'Polymer',
      molarMass: ~162,
      difficulty: 'hard',
    },

    // Lipids
    {
      name: 'Oleic Acid',
      formula: 'C18H34O2',
      type: 'Organic',
      molarMass: 282.47,
      difficulty: 'medium',
    },
    {
      name: 'Linoleic Acid',
      formula: 'C18H32O2',
      type: 'Organic',
      molarMass: 280.45,
      difficulty: 'medium',
    },
    {
      name: 'Palmitic Acid',
      formula: 'C16H32O2',
      type: 'Organic',
      molarMass: 256.42,
      difficulty: 'medium',
    },
    {
      name: 'Stearic Acid',
      formula: 'C18H36O2',
      type: 'Organic',
      molarMass: 284.48,
      difficulty: 'medium',
    },

    // Advanced & exotic
    {
      name: 'Fullerene (C60)',
      formula: 'C60',
      type: 'Organic',
      molarMass: 720.66,
      difficulty: 'hard',
    },
    {
      name: 'Graphene',
      formula: 'C',
      type: 'Allotrope',
      molarMass: 12.01,
      difficulty: 'hard',
    },
    {
      name: 'Carbon Nanotube',
      formula: 'C',
      type: 'Allotrope',
      molarMass: 12.01,
      difficulty: 'hard',
    },
    {
      name: 'Silicene',
      formula: 'Si',
      type: 'Allotrope',
      molarMass: 28.09,
      difficulty: 'hard',
    },
    {
      name: 'Benzene',
      formula: 'C6H6',
      type: 'Organic',
      molarMass: 78.11,
      difficulty: 'medium',
    },
    {
      name: 'Toluene',
      formula: 'C7H8',
      type: 'Organic',
      molarMass: 92.14,
      difficulty: 'medium',
    },
    {
      name: 'Phenol',
      formula: 'C6H5OH',
      type: 'Organic',
      molarMass: 94.11,
      difficulty: 'medium',
    },
    {
      name: 'Aniline',
      formula: 'C6H5NH2',
      type: 'Organic',
      molarMass: 93.13,
      difficulty: 'medium',
    },
  ];

  const medicines = [
    // Common painkillers & everyday medicines
    {
      name: 'Aspirin',
      treats: 'Pain, Inflammation, Cardiovascular Disease',
      year: 1899,
      difficulty: 'easy',
      wikiKeyword: 'Aspirin',
    },
    {
      name: 'Paracetamol (Acetaminophen)',
      treats: 'Fever, Pain',
      year: 1955,
      difficulty: 'easy',
      wikiKeyword: 'Paracetamol',
    },
    {
      name: 'Ibuprofen',
      treats: 'Pain, Inflammation',
      year: 1969,
      difficulty: 'easy',
      wikiKeyword: 'Ibuprofen',
    },
    {
      name: 'Morphine',
      treats: 'Severe Pain',
      year: 1804,
      difficulty: 'medium',
      wikiKeyword: 'Morphine',
    },
    {
      name: 'Codeine',
      treats: 'Pain, Cough',
      year: 1832,
      difficulty: 'medium',
      wikiKeyword: 'Codeine',
    },

    // Antibiotics
    {
      name: 'Penicillin',
      treats: 'Bacterial Infections',
      year: 1928,
      difficulty: 'easy',
      wikiKeyword: 'Penicillin',
    },
    {
      name: 'Amoxicillin',
      treats: 'Bacterial Infections',
      year: 1958,
      difficulty: 'medium',
      wikiKeyword: 'Amoxicillin',
    },
    {
      name: 'Tetracycline',
      treats: 'Bacterial Infections',
      year: 1948,
      difficulty: 'medium',
      wikiKeyword: 'Tetracycline',
    },
    {
      name: 'Ciprofloxacin',
      treats: 'Urinary Tract Infections, Respiratory Infections',
      year: 1987,
      difficulty: 'medium',
      wikiKeyword: 'Ciprofloxacin',
    },
    {
      name: 'Vancomycin',
      treats: 'Resistant Bacterial Infections',
      year: 1958,
      difficulty: 'hard',
      wikiKeyword: 'Vancomycin',
    },

    // Antivirals
    {
      name: 'Oseltamivir (Tamiflu)',
      treats: 'Influenza',
      year: 1999,
      difficulty: 'medium',
      wikiKeyword: 'Oseltamivir',
    },
    {
      name: 'Acyclovir',
      treats: 'Herpes Virus Infections',
      year: 1977,
      difficulty: 'medium',
      wikiKeyword: 'Acyclovir',
    },
    {
      name: 'AZT (Zidovudine)',
      treats: 'HIV/AIDS',
      year: 1987,
      difficulty: 'hard',
      wikiKeyword: 'Zidovudine',
    },
    {
      name: 'Remdesivir',
      treats: 'COVID-19',
      year: 2020,
      difficulty: 'hard',
      wikiKeyword: 'Remdesivir',
    },

    // Vaccines
    {
      name: 'Smallpox Vaccine',
      treats: 'Smallpox',
      year: 1796,
      difficulty: 'medium',
      wikiKeyword: 'Smallpox_vaccine',
    },
    {
      name: 'Polio Vaccine',
      treats: 'Polio',
      year: 1955,
      difficulty: 'medium',
      wikiKeyword: 'Polio_vaccine',
    },
    {
      name: 'MMR Vaccine',
      treats: 'Measles, Mumps, Rubella',
      year: 1971,
      difficulty: 'medium',
      wikiKeyword: 'MMR_vaccine',
    },
    {
      name: 'COVID-19 mRNA Vaccine',
      treats: 'COVID-19',
      year: 2020,
      difficulty: 'hard',
      wikiKeyword: 'COVID-19_vaccine',
    },

    // Chronic disease medicines
    {
      name: 'Insulin',
      treats: 'Diabetes',
      year: 1921,
      difficulty: 'easy',
      wikiKeyword: 'Insulin',
    },
    {
      name: 'Metformin',
      treats: 'Type 2 Diabetes',
      year: 1957,
      difficulty: 'medium',
      wikiKeyword: 'Metformin',
    },
    {
      name: 'Statins (Atorvastatin)',
      treats: 'Cholesterol',
      year: 1987,
      difficulty: 'medium',
      wikiKeyword: 'Statin',
    },
    {
      name: 'Beta-blockers (Propranolol)',
      treats: 'Hypertension, Heart Disease',
      year: 1964,
      difficulty: 'medium',
      wikiKeyword: 'Beta_blocker',
    },
    {
      name: 'ACE Inhibitors (Captopril)',
      treats: 'Hypertension, Heart Failure',
      year: 1981,
      difficulty: 'medium',
      wikiKeyword: 'ACE_inhibitor',
    },

    // Cancer treatments
    {
      name: 'Methotrexate',
      treats: 'Cancer, Autoimmune Diseases',
      year: 1947,
      difficulty: 'hard',
      wikiKeyword: 'Methotrexate',
    },
    {
      name: 'Cisplatin',
      treats: 'Cancer',
      year: 1978,
      difficulty: 'hard',
      wikiKeyword: 'Cisplatin',
    },
    {
      name: 'Imatinib (Gleevec)',
      treats: 'Leukemia',
      year: 2001,
      difficulty: 'hard',
      wikiKeyword: 'Imatinib',
    },
    {
      name: 'Trastuzumab (Herceptin)',
      treats: 'Breast Cancer',
      year: 1998,
      difficulty: 'hard',
      wikiKeyword: 'Trastuzumab',
    },

    // Mental health medicines
    {
      name: 'Diazepam (Valium)',
      treats: 'Anxiety, Seizures',
      year: 1963,
      difficulty: 'medium',
      wikiKeyword: 'Diazepam',
    },
    {
      name: 'Fluoxetine (Prozac)',
      treats: 'Depression',
      year: 1987,
      difficulty: 'medium',
      wikiKeyword: 'Fluoxetine',
    },
    {
      name: 'Lithium',
      treats: 'Bipolar Disorder',
      year: 1949,
      difficulty: 'hard',
      wikiKeyword: 'Lithium_(medication)',
    },
    {
      name: 'Haloperidol',
      treats: 'Schizophrenia',
      year: 1958,
      difficulty: 'hard',
      wikiKeyword: 'Haloperidol',
    },

    // Autoimmune & advanced therapies
    {
      name: 'Adalimumab (Humira)',
      treats: 'Rheumatoid Arthritis, Crohn’s Disease',
      year: 2002,
      difficulty: 'hard',
      wikiKeyword: 'Adalimumab',
    },
    {
      name: 'Etanercept (Enbrel)',
      treats: 'Rheumatoid Arthritis',
      year: 1998,
      difficulty: 'hard',
      wikiKeyword: 'Etanercept',
    },
    {
      name: 'Infliximab (Remicade)',
      treats: 'Autoimmune Diseases',
      year: 1998,
      difficulty: 'hard',
      wikiKeyword: 'Infliximab',
    },
  ];

  const ipcLaws = [
    {
      section: 'IPC 302',
      description: 'Punishment for Murder',
      category: 'Offences against Person',
      difficulty: 'easy',
    },
    {
      section: 'IPC 304',
      description: 'Punishment for Culpable Homicide not amounting to Murder',
      category: 'Offences against Person',
      difficulty: 'medium',
    },
    {
      section: 'IPC 307',
      description: 'Attempt to Murder',
      category: 'Offences against Person',
      difficulty: 'easy',
    },
    {
      section: 'IPC 376',
      description: 'Punishment for Rape',
      category: 'Offences against Person',
      difficulty: 'easy',
    },
    {
      section: 'IPC 377',
      description:
        'Unnatural Offences (historically used, now largely repealed)',
      category: 'Offences against Person',
      difficulty: 'medium',
    },
    {
      section: 'IPC 378',
      description: 'Definition of Theft',
      category: 'Offences against Property',
      difficulty: 'easy',
    },
    {
      section: 'IPC 379',
      description: 'Punishment for Theft',
      category: 'Offences against Property',
      difficulty: 'easy',
    },
    {
      section: 'IPC 380',
      description: 'Theft in Dwelling House',
      category: 'Offences against Property',
      difficulty: 'medium',
    },
    {
      section: 'IPC 390',
      description: 'Definition of Robbery',
      category: 'Offences against Property',
      difficulty: 'medium',
    },
    {
      section: 'IPC 392',
      description: 'Punishment for Robbery',
      category: 'Offences against Property',
      difficulty: 'easy',
    },
    {
      section: 'IPC 395',
      description: 'Punishment for Dacoity',
      category: 'Offences against Property',
      difficulty: 'medium',
    },
    {
      section: 'IPC 420',
      description: 'Cheating and Dishonestly Inducing Delivery of Property',
      category: 'Offences against Property',
      difficulty: 'easy',
    },
    {
      section: 'IPC 498A',
      description: 'Cruelty by Husband or Relatives of Husband',
      category: 'Offences against Person (Family)',
      difficulty: 'medium',
    },
    {
      section: 'IPC 120B',
      description: 'Criminal Conspiracy',
      category: 'General Offences',
      difficulty: 'medium',
    },
    {
      section: 'IPC 124A',
      description: 'Sedition (now largely struck down)',
      category: 'Offences against State',
      difficulty: 'hard',
    },
    {
      section: 'IPC 141',
      description: 'Definition of Unlawful Assembly',
      category: 'Public Order',
      difficulty: 'medium',
    },
    {
      section: 'IPC 146',
      description: 'Rioting',
      category: 'Public Order',
      difficulty: 'medium',
    },
    {
      section: 'IPC 153A',
      description: 'Promoting Enmity Between Different Groups',
      category: 'Public Order',
      difficulty: 'hard',
    },
    {
      section: 'IPC 186',
      description:
        'Obstructing Public Servant in Discharge of Public Functions',
      category: 'Public Order',
      difficulty: 'medium',
    },
    {
      section: 'IPC 201',
      description: 'Causing Disappearance of Evidence of Offence',
      category: 'General Offences',
      difficulty: 'medium',
    },
  ];
  const indianPolitics = [
    // Core Institutions
    {
      name: 'Constitution of India',
      category: 'Document',
      year: 1950,
      difficulty: 'hard',
      wikiKeyword: 'Constitution_of_India',
    },
    {
      name: 'Parliament of India',
      category: 'Institution',
      year: 1952,
      difficulty: 'medium',
      wikiKeyword: 'Parliament_of_India',
    },
    {
      name: 'Lok Sabha',
      category: 'Institution',
      year: 1952,
      difficulty: 'medium',
      wikiKeyword: 'Lok_Sabha',
    },
    {
      name: 'Rajya Sabha',
      category: 'Institution',
      year: 1952,
      difficulty: 'medium',
      wikiKeyword: 'Rajya_Sabha',
    },
    {
      name: 'President of India',
      category: 'Position',
      year: 1950,
      difficulty: 'easy',
      wikiKeyword: 'President_of_India',
    },
    {
      name: 'Prime Minister of India',
      category: 'Position',
      year: 1947,
      difficulty: 'easy',
      wikiKeyword: 'Prime_Minister_of_India',
    },
    {
      name: 'Supreme Court of India',
      category: 'Institution',
      year: 1950,
      difficulty: 'hard',
      wikiKeyword: 'Supreme_Court_of_India',
    },
    {
      name: 'Election Commission of India',
      category: 'Institution',
      year: 1950,
      difficulty: 'medium',
      wikiKeyword: 'Election_Commission_of_India',
    },

    // Political System & Concepts
    {
      name: 'Federalism in India',
      category: 'Concept',
      year: 1950,
      difficulty: 'hard',
      wikiKeyword: 'Federalism_in_India',
    },
    {
      name: 'Secularism in India',
      category: 'Concept',
      year: 1976,
      difficulty: 'hard',
      wikiKeyword: 'Secularism_in_India',
    },
    {
      name: 'Fundamental Rights in India',
      category: 'Concept',
      year: 1950,
      difficulty: 'medium',
      wikiKeyword: 'Fundamental_Rights_in_India',
    },
    {
      name: 'Directive Principles of State Policy',
      category: 'Concept',
      year: 1950,
      difficulty: 'hard',
      wikiKeyword: 'Directive_Principles_of_State_Policy',
    },
    {
      name: 'Panchayati Raj',
      category: 'System',
      year: 1992,
      difficulty: 'medium',
      wikiKeyword: 'Panchayati_raj',
    },
    {
      name: 'Reservation in India',
      category: 'Policy',
      year: 1950,
      difficulty: 'hard',
      wikiKeyword: 'Reservation_in_India',
    },

    // Landmark Events
    {
      name: 'Indian Independence Act',
      category: 'Event',
      year: 1947,
      difficulty: 'medium',
      wikiKeyword: 'Indian_Independence_Act_1947',
    },
    {
      name: 'Emergency in India',
      category: 'Event',
      year: 1975,
      difficulty: 'hard',
      wikiKeyword: 'The_Emergency_(India)',
    },
    {
      name: 'Green Revolution in India',
      category: 'Event',
      year: 1960,
      difficulty: 'medium',
      wikiKeyword: 'Green_Revolution_in_India',
    },
    {
      name: 'Economic Liberalisation in India',
      category: 'Event',
      year: 1991,
      difficulty: 'hard',
      wikiKeyword: 'Economic_liberalisation_in_India',
    },
    {
      name: 'Right to Information Act',
      category: 'Law',
      year: 2005,
      difficulty: 'medium',
      wikiKeyword: 'Right_to_Information_Act,_2005',
    },
    {
      name: 'Goods and Services Tax (GST)',
      category: 'Law',
      year: 2017,
      difficulty: 'medium',
      wikiKeyword: 'Goods_and_Services_Tax_(India)',
    },

    // Major Political Parties
    {
      name: 'Indian National Congress',
      category: 'Party',
      year: 1885,
      difficulty: 'medium',
      wikiKeyword: 'Indian_National_Congress',
    },
    {
      name: 'Bharatiya Janata Party',
      category: 'Party',
      year: 1980,
      difficulty: 'medium',
      wikiKeyword: 'Bharatiya_Janata_Party',
    },
    {
      name: 'Communist Party of India',
      category: 'Party',
      year: 1925,
      difficulty: 'hard',
      wikiKeyword: 'Communist_Party_of_India',
    },
    {
      name: 'Aam Aadmi Party',
      category: 'Party',
      year: 2012,
      difficulty: 'easy',
      wikiKeyword: 'Aam_Aadmi_Party',
    },
    {
      name: 'Bahujan Samaj Party',
      category: 'Party',
      year: 1984,
      difficulty: 'medium',
      wikiKeyword: 'Bahujan_Samaj_Party',
    },

    // Key Amendments
    {
      name: '42nd Amendment',
      category: 'Amendment',
      year: 1976,
      difficulty: 'hard',
      wikiKeyword: 'Forty-second_Amendment_of_the_Constitution_of_India',
    },
    {
      name: '73rd Amendment',
      category: 'Amendment',
      year: 1992,
      difficulty: 'hard',
      wikiKeyword: 'Seventy-third_Amendment_of_the_Constitution_of_India',
    },
    {
      name: '74th Amendment',
      category: 'Amendment',
      year: 1992,
      difficulty: 'hard',
      wikiKeyword: 'Seventy-fourth_Amendment_of_the_Constitution_of_India',
    },

    // Landmark Supreme Court Cases
    {
      name: 'Kesavananda Bharati Case',
      category: 'Judgment',
      year: 1973,
      difficulty: 'hard',
      wikiKeyword: 'Kesavananda_Bharati_v._State_of_Kerala',
    },
    {
      name: 'Indira Gandhi vs Raj Narain',
      category: 'Judgment',
      year: 1975,
      difficulty: 'hard',
      wikiKeyword: 'Indira_Nehru_Gandhi_v._Raj_Narain',
    },
    {
      name: 'Maneka Gandhi vs Union of India',
      category: 'Judgment',
      year: 1978,
      difficulty: 'hard',
      wikiKeyword: 'Maneka_Gandhi_v._Union_of_India',
    },
    {
      name: 'Shah Bano Case',
      category: 'Judgment',
      year: 1985,
      difficulty: 'hard',
      wikiKeyword: 'Mohd._Ahmed_Khan_v._Shah_Bano_Begum',
    },
    {
      name: 'S.R. Bommai Case',
      category: 'Judgment',
      year: 1994,
      difficulty: 'hard',
      wikiKeyword: 'S._R._Bommai_v._Union_of_India',
    },

    // Political Movements
    {
      name: 'Quit India Movement',
      category: 'Movement',
      year: 1942,
      difficulty: 'medium',
      wikiKeyword: 'Quit_India_Movement',
    },
    {
      name: 'Non-Cooperation Movement',
      category: 'Movement',
      year: 1920,
      difficulty: 'medium',
      wikiKeyword: 'Non-cooperation_movement',
    },
    {
      name: 'Civil Disobedience Movement',
      category: 'Movement',
      year: 1930,
      difficulty: 'medium',
      wikiKeyword: 'Civil_disobedience_movement',
    },
    {
      name: 'Anna Hazare Anti-Corruption Movement',
      category: 'Movement',
      year: 2011,
      difficulty: 'medium',
      wikiKeyword: '2011_Indian_anti-corruption_movement',
    },
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

  const findPoints = (difficulty: Difficulty): number => {
    switch (difficulty) {
      case 'easy':
        return 10;
      case 'medium':
        return 20;
      case 'hard':
        return 30;
      default:
        return 10;
    }
  };

  // Helper function to get unique options
  const getUniqueOptions = (
    correctAnswer: string,
    options: string[],
    count: number = 4
  ): string[] => {
    const uniqueOptions = new Set<string>([correctAnswer]);
    const availableOptions = options.filter((opt) => opt !== correctAnswer);

    // Shuffle available options
    const shuffled = shuffle(availableOptions);

    // Add unique options until we have enough
    for (const opt of shuffled) {
      if (uniqueOptions.size >= count) break;
      uniqueOptions.add(opt);
    }

    // If we still don't have enough unique options, we need to create variants
    while (uniqueOptions.size < count) {
      const variant = `${correctAnswer} (${uniqueOptions.size})`;
      if (!uniqueOptions.has(variant)) {
        uniqueOptions.add(variant);
      } else {
        uniqueOptions.add(`${correctAnswer} variant ${uniqueOptions.size}`);
      }
    }

    return shuffle(Array.from(uniqueOptions));
  };

  // Generate questions

  // Geography questions - Countries and Capitals
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    const availableCapitals = countries.map((c) => c.capital);
    const capitalOptions = getUniqueOptions(country.capital, availableCapitals);
    const shuffledOptions = shuffle(capitalOptions);
    questions.push({
      category: 'general',
      question: `What is the capital of ${country.name}?`,
      subCategory: 'geography',
      keyword: country.wikiKeyword,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(country.capital),
      difficulty: 'medium',
      points: 20,
    });
  }
  // indian politics questions - Institutions, Events, Parties
  for (let i = 0; i < indianPolitics.length; i++) {
    const indianpolitic = indianPolitics[i];
    const availableOptons = indianPolitics.map((c) => c.year.toString());
    const capitalOptions = getUniqueOptions(
      indianpolitic.year.toString(),
      availableOptons
    );
    const shuffledOptions = shuffle(capitalOptions);
    questions.push({
      category: 'general',
      question: `When was ${indianpolitic.name} established?`,
      subCategory: 'indian politics',
      keyword: indianpolitic.wikiKeyword,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(indianpolitic.year.toString()),
      difficulty: 'medium',
      points: 20,
    });
  }
  //IPC law questions
  // Section description questions
  for (let i = 0; i < ipcLaws.length; i++) {
    const law = ipcLaws[i];
    const availableDescriptions = ipcLaws.map((l) => l.description);
    const descriptionOptions = getUniqueOptions(
      law.description,
      availableDescriptions
    );
    const shuffledOptions = shuffle(descriptionOptions);
    questions.push({
      category: 'general',
      question: `What does IPC Section ${law.section} deal with?`,
      options: shuffledOptions,
      keyword: law.section,
      subCategory: 'Indian law',
      correctAnswer: shuffledOptions.indexOf(law.description),
      difficulty: law.difficulty as Difficulty,
      points: findPoints(law.difficulty as Difficulty),
    });
  }

  // Category questions
  for (let i = 0; i < ipcLaws.length; i++) {
    const law = ipcLaws[i];
    const availableCategories = ipcLaws.map((l) => l.category);
    const categoryOptions = getUniqueOptions(law.category, availableCategories);
    const shuffledOptions = shuffle(categoryOptions);
    questions.push({
      category: 'general',
      question: `IPC Section ${law.section} belongs to which category of offences?`,
      options: shuffledOptions,
      keyword: law.section,
      subCategory: 'Indian law',
      correctAnswer: shuffledOptions.indexOf(law.category),
      difficulty: law.difficulty as Difficulty,
      points: findPoints(law.difficulty as Difficulty),
    });
  }

  // Reverse lookup questions
  for (let i = 0; i < ipcLaws.length; i++) {
    const law = ipcLaws[i];
    const availableSections = ipcLaws.map((l) => l.section);
    const sectionOptions = getUniqueOptions(law.section, availableSections);
    const shuffledOptions = shuffle(sectionOptions);
    questions.push({
      category: 'general',
      question: `Which IPC Section deals with "${law.description}"?`,
      options: shuffledOptions,
      keyword: law.description.replace(' ', '_'),
      subCategory: 'Indian law',
      correctAnswer: shuffledOptions.indexOf(law.section),
      difficulty: law.difficulty as Difficulty,
      points: findPoints(law.difficulty as Difficulty),
    });
  }

  // Science questions - Elements
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const availableSymbols = elements.map((e) => e.symbol);
    const symbolOptions = getUniqueOptions(element.symbol, availableSymbols);
    const shuffledOptions = shuffle(symbolOptions);
    questions.push({
      category: 'general',
      question: `What is the chemical symbol for ${element.name}?`,
      options: shuffledOptions,
      keyword: element.name,
      subCategory: 'Elements',
      correctAnswer: shuffledOptions.indexOf(element.symbol),
      difficulty: 'hard',
      points: 30,
    });
  }

  // Science questions - Elements
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const availableAtomicNumbers = elements.map((e) =>
      e.atomicNumber.toString()
    );
    const atomicNumberOption = getUniqueOptions(
      element.atomicNumber.toString(),
      availableAtomicNumbers
    );
    const shuffledOptions = shuffle(atomicNumberOption);
    questions.push({
      category: 'general',
      question: `What is the atomic number of ${element.name}?`,
      options: shuffledOptions,
      keyword: element.name,
      subCategory: 'Elements',
      correctAnswer: shuffledOptions.indexOf(element.atomicNumber.toString()),
      difficulty: 'hard',
      points: 40,
    });
  }

  // History questions - Years and Events
  for (let i = 0; i < historicalEvents.length; i++) {
    const event = historicalEvents[i];
    const correctYearStr = event.year.toString();
    const availableYears = historicalEvents.map((e) => e.year.toString());
    const yearOptions = getUniqueOptions(correctYearStr, availableYears);
    const shuffledOptions = shuffle(yearOptions);
    questions.push({
      category: 'general',
      question: `In which year did the ${event.event} occur?`,
      options: shuffledOptions,
      keyword: event.wikiKeyword,
      subCategory: 'History',
      correctAnswer: shuffledOptions.indexOf(correctYearStr),
      difficulty: 'hard',
      points: 30,
    });
  }

  // Year questions
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const availableYears = medicines.map((m) => m.year.toString());
    const yearOptions = getUniqueOptions(
      medicine.year.toString(),
      availableYears
    );
    const shuffledOptions = shuffle(yearOptions);
    questions.push({
      category: 'general',
      question: `In which year was "${medicine.name}" introduced/discovered?`,
      options: shuffledOptions,
      keyword: medicine.wikiKeyword,
      subCategory: 'Medicine',
      correctAnswer: shuffledOptions.indexOf(medicine.year.toString()),
      difficulty: medicine.difficulty as Difficulty,
      points: findPoints(medicine.difficulty as Difficulty),
    });
  }

  // Disease questions
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const availableDiseases = medicines.map((m) => m.treats);
    const diseaseOptions = getUniqueOptions(medicine.treats, availableDiseases);
    const shuffledOptions = shuffle(diseaseOptions);
    questions.push({
      category: 'general',
      question: `Which disease or condition does "${medicine.name}" treat?`,
      options: shuffledOptions,
      subCategory: 'Medicine',
      keyword: medicine.wikiKeyword,
      correctAnswer: shuffledOptions.indexOf(medicine.treats),
      difficulty: medicine.difficulty as Difficulty,
      points: findPoints(medicine.difficulty as Difficulty),
    });
  }

  // Medicine questions (reverse lookup)
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    const availableMedicines = medicines.map((m) => m.name);
    const medicineOptions = getUniqueOptions(medicine.name, availableMedicines);
    const shuffledOptions = shuffle(medicineOptions);
    questions.push({
      category: 'general',
      question: `Which medicine is commonly used to treat "${medicine.treats}"?`,
      options: shuffledOptions,
      keyword: medicine.wikiKeyword,
      subCategory: 'Medicine',
      correctAnswer: shuffledOptions.indexOf(medicine.name),
      difficulty: medicine.difficulty as Difficulty,
      points: findPoints(medicine.difficulty as Difficulty),
    });
  }

  // Literature questions - Books and Authors
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const availableAuthors = books.map((b) => b.author);
    const authorOptions = getUniqueOptions(book.author, availableAuthors);
    const shuffledOptions = shuffle(authorOptions);
    questions.push({
      category: 'general',
      question: `Who is the author of "${book.title}"?`,
      options: shuffledOptions,
      keyword: book.wikiKeyword,
      subCategory: 'Literature',
      correctAnswer: shuffledOptions.indexOf(book.author),
      difficulty: book.difficulty as Difficulty,
      points: findPoints(book.difficulty as Difficulty),
    });
  }

  // Literature questions - Books and Authors
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const availableYears = books.map((b) => b.year.toString());
    const yearOptions = getUniqueOptions(book.year.toString(), availableYears);
    const shuffledOptions = shuffle(yearOptions);
    questions.push({
      category: 'general',
      question: `In which year was "${book.title}" published?`,
      options: shuffledOptions,
      keyword: book.wikiKeyword,
      subCategory: 'Literature',
      correctAnswer: shuffledOptions.indexOf(book.year.toString()),
      difficulty: book.difficulty as Difficulty,
      points: findPoints(book.difficulty as Difficulty),
    });
  }

  // Formula questions
  for (let i = 0; i < molecules.length; i++) {
    const molecule = molecules[i];
    const availableFormulas = molecules.map((m) => m.formula);
    const formulaOptions = getUniqueOptions(
      molecule.formula,
      availableFormulas
    );
    const shuffledOptions = shuffle(formulaOptions);
    questions.push({
      category: 'general',
      question: `What is the chemical formula of "${molecule.name}"?`,
      options: shuffledOptions,
      keyword: molecule.name,
      subCategory: 'Chemistry',
      correctAnswer: shuffledOptions.indexOf(molecule.formula),
      difficulty: molecule.difficulty as Difficulty,
      points: findPoints(molecule.difficulty as Difficulty),
    });
  }

  // Type questions
  for (let i = 0; i < molecules.length; i++) {
    const molecule = molecules[i];
    const availableTypes = molecules.map((m) => m.type);
    const typeOptions = getUniqueOptions(molecule.type, availableTypes);
    const shuffledOptions = shuffle(typeOptions);
    questions.push({
      category: 'general',
      question: `What type of molecule is "${molecule.name}"?`,
      options: shuffledOptions,
      keyword: molecule.name,
      subCategory: 'Chemistry',
      correctAnswer: shuffledOptions.indexOf(molecule.type),
      difficulty: molecule.difficulty as Difficulty,
      points: findPoints(molecule.difficulty as Difficulty),
    });
  }

  // Molar mass questions
  for (let i = 0; i < molecules.length; i++) {
    const molecule = molecules[i];
    const availableMasses = molecules.map((m) => m.molarMass.toString());
    const massOptions = getUniqueOptions(
      molecule.molarMass.toString(),
      availableMasses
    );
    const shuffledOptions = shuffle(massOptions);
    questions.push({
      category: 'general',
      question: `What is the molar mass of "${molecule.name}"? (g/mol)`,
      options: shuffledOptions,
      keyword: molecule.name,
      subCategory: 'Chemistry',
      correctAnswer: shuffledOptions.indexOf(molecule.molarMass.toString()),
      difficulty: molecule.difficulty as Difficulty,
      points: findPoints(molecule.difficulty as Difficulty),
    });
  }

  // Rivers questions
  for (let i = 0; i < rivers.length; i++) {
    const river = rivers[i];
    const availableCountries = rivers.map((r) => r.country);
    const countryOptions = getUniqueOptions(river.country, availableCountries);
    const shuffledOptions = shuffle(countryOptions);
    questions.push({
      category: 'general',
      question: `Which country does the ${river.name} River flow through?`,
      options: shuffledOptions,
      keyword: river.wikiKeyword,
      subCategory: 'Geography',
      correctAnswer: shuffledOptions.indexOf(river.country),
      difficulty: river.difficulty as Difficulty,
      points: findPoints(river.difficulty as Difficulty),
    });
  }

  // Rivers questions
  for (let i = 0; i < rivers.length; i++) {
    const river = rivers[i];
    const availableLengths = rivers.map((r) => r.length.toString());
    const lengthOptions = getUniqueOptions(
      river.length.toString(),
      availableLengths
    );
    const shuffledOptions = shuffle(lengthOptions);
    questions.push({
      category: 'general',
      question: `What is the length of the ${river.name} River?`,
      options: shuffledOptions,
      keyword: river.wikiKeyword,
      subCategory: 'Geography',
      correctAnswer: shuffledOptions.indexOf(river.length.toString()),
      difficulty: river.difficulty as Difficulty,
      points: findPoints(river.difficulty as Difficulty),
    });
  }

  // Scientists and their discoveries
  for (let i = 0; i < scientists.length; i++) {
    const scientist = scientists[i];
    const availableFields = scientists.map((s) => s.field);
    const fieldOptions = getUniqueOptions(scientist.field, availableFields);
    const shuffledOptions = shuffle(fieldOptions);
    questions.push({
      category: 'general',
      question: `${scientist.name} was a renowned scientist in which field?`,
      options: shuffledOptions,
      keyword: scientist.wikiKeyword,
      subCategory: 'Science',
      correctAnswer: shuffledOptions.indexOf(scientist.field),
      difficulty: 'medium',
      points: 20,
    });
  }

  for (let i = 0; i < scientists.length; i++) {
    const scientist = scientists[i];
    const availableFields = scientists.map((s) => s.discovery);
    const fieldOptions = getUniqueOptions(scientist.discovery, availableFields);
    const shuffledOptions = shuffle(fieldOptions);
    questions.push({
      category: 'general',
      question: `${scientist.name} was a renowned scientist in which discovery?`,
      options: shuffledOptions,
      keyword: scientist.wikiKeyword,
      subCategory: 'Science',
      correctAnswer: shuffledOptions.indexOf(scientist.discovery),
      difficulty: 'hard',
      points: 30,
    });
  }

  // Planets questions
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const availableTypes = planets.map((p) => p.distanceFromSun.toString());
    const typeOptions = getUniqueOptions(
      planet.distanceFromSun.toString(),
      availableTypes
    );
    const shuffledOptions = shuffle(typeOptions);

    questions.push({
      category: 'general',
      question: `What is average distance of planet ${planet.name} from the Sun?`,
      options: shuffledOptions,
      keyword: planet.name,
      subCategory: 'Astronomy',
      correctAnswer: shuffledOptions.indexOf(planet.distanceFromSun.toString()),
      difficulty: 'hard',
      points: 30,
    });
  }
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const availableTypes = planets.map((p) => p.orbitalPeriod.toString());
    const typeOptions = getUniqueOptions(
      planet.orbitalPeriod.toString(),
      availableTypes
    );
    const shuffledOptions = shuffle(typeOptions);

    questions.push({
      category: 'general',
      question: `How many years will ${planet.name} take to orbit the Sun?`,
      options: shuffledOptions,
      keyword: planet.name,
      subCategory: 'Astronomy',
      correctAnswer: shuffledOptions.indexOf(planet.orbitalPeriod.toString()),
      difficulty: planet.difficulty as Difficulty,
      points: findPoints(planet.difficulty as Difficulty),
    });
  }

  // Animals questions
  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];
    const availableHabitats = animals.map((a) => a.weight.toString());
    const habitatOptions = getUniqueOptions(
      animal.weight.toString(),
      availableHabitats
    );
    const shuffledOptions = shuffle(habitatOptions);
    questions.push({
      category: 'general',
      question: `What is the average weight(kg) of ${animal.name}?`,
      options: shuffledOptions,
      keyword: animal.name,
      subCategory: 'Biology',
      correctAnswer: shuffledOptions.indexOf(animal.weight.toString()),
      difficulty: 'medium',
      points: 20,
    });
  }
  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];
    const availableTypes = animals.map((a) => a.type);
    const typeOptions = getUniqueOptions(animal.type, availableTypes);
    const shuffledOptions = shuffle(typeOptions);
    questions.push({
      category: 'general',
      question: `What type of animal is ${animal.name}?`,
      options: shuffledOptions,
      keyword: animal.name,
      subCategory: 'Biology',
      correctAnswer: shuffledOptions.indexOf(animal.type),
      difficulty: 'medium',
      points: 20,
    });
  }

  // Technology & Inventions
  for (let i = 0; i < technologies.length; i++) {
    const tech = technologies[i];
    const availableInventors = technologies.map((t) => t.inventor);
    const inventorOptions = getUniqueOptions(tech.inventor, availableInventors);
    const shuffledOptions = shuffle(inventorOptions);

    questions.push({
      category: 'general',
      question: `Who invented the ${tech.name}?`,
      options: shuffledOptions,
      keyword: tech.name.replace(' ', '_'),
      subCategory: 'Technology',
      correctAnswer: shuffledOptions.indexOf(tech.inventor),
      difficulty: tech.difficulty as Difficulty,
      points: findPoints(tech.difficulty as Difficulty),
    });
  }
  for (let i = 0; i < technologies.length; i++) {
    const tech = technologies[i];
    const availableYears = technologies.map((t) => t.year.toString());
    const yearOptions = getUniqueOptions(tech.year.toString(), availableYears);
    const shuffledOptions = shuffle(yearOptions);

    questions.push({
      category: 'general',
      question: `In which year was the ${tech.name} invented?`,
      options: shuffledOptions,
      keyword: tech.name.replace(' ', '_'),
      subCategory: 'Technology',
      correctAnswer: shuffledOptions.indexOf(tech.year.toString()),
      difficulty: tech.difficulty as Difficulty,
      points: findPoints(tech.difficulty as Difficulty),
    });
  }

  // Mountains questions
  for (let i = 0; i < mountains.length; i++) {
    const mountain = mountains[i];
    const availableCountries = mountains.map((m) => m.country);
    const countryOptions = getUniqueOptions(
      mountain.country,
      availableCountries
    );
    const shuffledOptions = shuffle(countryOptions);

    questions.push({
      category: 'general',
      question: `${mountain.name} is located in which country?`,
      options: shuffledOptions,
      keyword: mountain.name.replace(' ', '_'),
      subCategory: 'Geography',
      correctAnswer: shuffledOptions.indexOf(mountain.country),
      difficulty: mountain.difficulty as Difficulty,
      points: findPoints(mountain.difficulty as Difficulty),
    });
  }
  for (let i = 0; i < mountains.length; i++) {
    const mountain = mountains[i];
    const mountainHeight = mountains.map((m) => m.height.toString());
    const heightOptions = getUniqueOptions(
      mountain.height.toString(),
      mountainHeight
    );
    const shuffledOptions = shuffle(heightOptions);

    questions.push({
      category: 'general',
      question: `What is the height of ${mountain.name}?`,
      options: shuffledOptions,
      keyword: mountain.name.replace(' ', '_'),
      subCategory: 'Geography',
      correctAnswer: shuffledOptions.indexOf(mountain.height.toString()),
      difficulty: mountain.difficulty as Difficulty,
      points: findPoints(mountain.difficulty as Difficulty),
    });
  }
  const arithmeticBasicsQuestions = [
    {
      q: 'What is 25% of 200?',
      opts: ['25', '50', '75', '100'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Percentage',
    },
    {
      q: 'Simplify: 3/4 + 2/3',
      opts: ['17/12', '13/12', '5/7', '19/12'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Fraction',
    },
    {
      q: 'A shopkeeper buys an item for ₹500 and sells it for ₹600. What is the profit percentage?',
      opts: ['10%', '15%', '20%', '25%'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Profit_(accounting)',
    },
    {
      q: 'If 12 workers can complete a task in 8 days, how many days will 24 workers take?',
      opts: ['2', '3', '4', '6'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },
    {
      q: 'A train travels 120 km in 2 hours. What is its average speed?',
      opts: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    {
      q: 'The average of 10, 20, 30, 40, and 50 is:',
      opts: ['20', '25', '30', '35'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },
    {
      q: 'Find the compound interest on ₹1000 at 10% per annum for 2 years.',
      opts: ['₹100', '₹200', '₹210', '₹220'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Compound_interest',
    },
    {
      q: 'Solve: If x + 5 = 12, then x = ?',
      opts: ['5', '6', '7', '8'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Linear_equation',
    },
    {
      q: 'A man spends 1/3 of his salary on rent and 1/4 on food. If his salary is ₹12,000, how much is left?',
      opts: ['₹4000', '₹5000', '₹6000', '₹7000'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Salary',
    },
    {
      q: 'The ratio of ages of A and B is 3:5. If A is 15 years old, how old is B?',
      opts: ['20', '22', '24', '25'],
      ans: 3,
      difficulty: 'easy',
      wikiKeyword: 'Ratio',
    },
    {
      q: 'What is 40% of 250?',
      opts: ['80', '90', '100', '110'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Percentage',
    },
    {
      q: 'If a student scores 180 out of 200, what is the percentage?',
      opts: ['85%', '90%', '92%', '95%'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Percentage',
    },

    // Fractions & Decimals
    {
      q: 'Simplify: 5/8 + 3/4',
      opts: ['1', '11/8', '9/8', '7/8'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Fraction',
    },
    {
      q: 'Convert 0.75 into a fraction.',
      opts: ['3/4', '2/3', '5/8', '7/10'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Decimal',
    },

    // Ratios & Proportions
    {
      q: 'Divide ₹600 in the ratio 2:3.',
      opts: [
        '₹240 and ₹360',
        '₹200 and ₹400',
        '₹300 and ₹300',
        '₹250 and ₹350',
      ],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Ratio',
    },
    {
      q: 'If 4 pencils cost ₹20, what is the cost of 10 pencils?',
      opts: ['₹40', '₹45', '₹50', '₹55'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Proportion',
    },

    // Averages
    {
      q: 'The average of 12, 18, and 24 is:',
      opts: ['16', '18', '20', '22'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },
    {
      q: 'The average age of 5 students is 20 years. What is their total age?',
      opts: ['80', '90', '100', '120'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },

    // Profit & Loss
    {
      q: 'A man buys a book for ₹200 and sells it for ₹250. What is the profit percentage?',
      opts: ['20%', '25%', '30%', '35%'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Profit_(accounting)',
    },
    {
      q: 'A shopkeeper incurs a loss of ₹50 on selling a pen for ₹150. What is the loss percentage?',
      opts: ['20%', '25%', '30%', '35%'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Loss_(accounting)',
    },

    // Simple & Compound Interest
    {
      q: 'Find the simple interest on ₹1000 at 5% per annum for 3 years.',
      opts: ['₹100', '₹150', '₹200', '₹250'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Simple_interest',
    },
    {
      q: 'Find the compound interest on ₹2000 at 10% per annum for 2 years.',
      opts: ['₹200', '₹400', '₹420', '₹440'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Compound_interest',
    },

    // Time & Work
    {
      q: 'If 10 men can build a wall in 15 days, how many days will 5 men take?',
      opts: ['20', '25', '30', '35'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },
    {
      q: 'A can finish a job in 12 days, B in 18 days. Together, how many days will they take?',
      opts: ['6', '7', '8', '9'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },

    // Time, Speed & Distance
    {
      q: 'A car travels 180 km in 3 hours. What is its speed?',
      opts: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    {
      q: 'If a train travels at 60 km/h, how long will it take to cover 240 km?',
      opts: ['3 hours', '4 hours', '5 hours', '6 hours'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    // Percentages
    {
      q: 'What is 20% of 150?',
      opts: ['20', '25', '30', '35'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Percentage',
    },
    {
      q: 'If a student scores 360 out of 400, what is the percentage?',
      opts: ['85%', '90%', '92%', '95%'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Percentage',
    },
    {
      q: 'The population of a town increases by 10% annually. If the current population is 10,000, what will it be after 2 years?',
      opts: ['11,000', '12,100', '12,000', '11,500'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Percentage',
    },

    // Fractions & Decimals
    {
      q: 'Simplify: 2/3 + 3/4',
      opts: ['17/12', '19/12', '7/12', '5/6'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Fraction',
    },
    {
      q: 'Convert 0.125 into a fraction.',
      opts: ['1/8', '1/4', '1/6', '1/10'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Decimal',
    },
    {
      q: 'Which is greater: 3/5 or 0.55?',
      opts: ['3/5', '0.55', 'Equal', 'Cannot be determined'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Fraction',
    },

    // Ratios & Proportions
    {
      q: 'Divide ₹900 in the ratio 2:1.',
      opts: [
        '₹600 and ₹300',
        '₹450 and ₹450',
        '₹500 and ₹400',
        '₹700 and ₹200',
      ],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Ratio',
    },
    {
      q: 'If 5 kg of rice costs ₹250, what is the cost of 8 kg?',
      opts: ['₹350', '₹400', '₹450', '₹500'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Proportion',
    },
    {
      q: 'The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?',
      opts: ['15', '18', '20', '25'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Ratio',
    },

    // Averages
    {
      q: 'The average of 5, 10, 15, 20, 25 is:',
      opts: ['10', '12', '15', '20'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },
    {
      q: 'The average of 4 numbers is 25. If three numbers are 20, 25, and 30, what is the fourth number?',
      opts: ['20', '25', '30', '35'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Average',
    },
    {
      q: 'The average age of 40 students is 15 years. If the teacher’s age is included, the average becomes 16. What is the teacher’s age?',
      opts: ['55', '56', '57', '58'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Average',
    },

    // Profit & Loss
    {
      q: 'A man buys a pen for ₹50 and sells it for ₹60. What is the profit percentage?',
      opts: ['10%', '15%', '20%', '25%'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Profit_(accounting)',
    },
    {
      q: 'A shopkeeper incurs a loss of ₹40 on selling a book for ₹160. What is the loss percentage?',
      opts: ['20%', '25%', '30%', '35%'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Loss_(accounting)',
    },
    {
      q: 'A trader marks goods 20% above cost price and allows a discount of 10%. What is the profit percentage?',
      opts: ['8%', '10%', '12%', '15%'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Profit_(accounting)',
    },

    // Simple & Compound Interest
    {
      q: 'Find the simple interest on ₹2000 at 5% per annum for 4 years.',
      opts: ['₹300', '₹400', '₹500', '₹600'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Simple_interest',
    },
    {
      q: 'Find the compound interest on ₹5000 at 8% per annum for 2 years.',
      opts: ['₹800', '₹832', '₹860', '₹900'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Compound_interest',
    },
    {
      q: 'At what rate of interest will ₹1000 become ₹1210 in 2 years compounded annually?',
      opts: ['5%', '8%', '10%', '12%'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Compound_interest',
    },

    // Time & Work
    {
      q: 'If 12 men can build a wall in 18 days, how many days will 6 men take?',
      opts: ['30', '32', '34', '36'],
      ans: 3,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },
    {
      q: 'A can finish a job in 10 days, B in 15 days. Together, how many days will they take?',
      opts: ['5', '6', '7', '8'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },
    {
      q: 'A and B together can do a job in 12 days. A alone can do it in 18 days. How many days will B alone take?',
      opts: ['24', '30', '36', '40'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Work_(physics)',
    },

    // Time, Speed & Distance
    {
      q: 'A car travels 240 km in 4 hours. What is its speed?',
      opts: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    {
      q: 'If a train travels at 80 km/h, how long will it take to cover 400 km?',
      opts: ['4 hours', '5 hours', '6 hours', '7 hours'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    {
      q: 'A man walks at 5 km/h. How long will it take him to cover 15 km?',
      opts: ['2 hours', '2.5 hours', '3 hours', '3.5 hours'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    {
      q: 'A boat goes 30 km downstream in 3 hours and returns upstream in 5 hours. Find the speed of the boat in still water.',
      opts: ['6 km/h', '7 km/h', '8 km/h', '9 km/h'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Speed',
    },
  ];

  const grammarVocabularyQuestions = [
    // --- Synonyms (10) ---
    {
      q: 'Choose the synonym of "Big".',
      opts: ['Small', 'Huge', 'Tiny', 'Weak'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Quick".',
      opts: ['Slow', 'Rapid', 'Lazy', 'Weak'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Beautiful".',
      opts: ['Ugly', 'Pretty', 'Bad', 'Sad'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Angry".',
      opts: ['Calm', 'Furious', 'Happy', 'Gentle'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Brave".',
      opts: ['Cowardly', 'Fearless', 'Weak', 'Lazy'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Intelligent".',
      opts: ['Smart', 'Dull', 'Slow', 'Weak'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Strong".',
      opts: ['Weak', 'Powerful', 'Lazy', 'Gentle'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Happy".',
      opts: ['Sad', 'Joyful', 'Angry', 'Tired'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Fast".',
      opts: ['Quick', 'Slow', 'Lazy', 'Weak'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Synonym',
    },
    {
      q: 'Choose the synonym of "Honest".',
      opts: ['Truthful', 'False', 'Cheat', 'Lie'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Synonym',
    },

    // --- Antonyms (10) ---
    {
      q: 'Choose the antonym of "Hot".',
      opts: ['Cold', 'Warm', 'Boiling', 'Heat'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Victory".',
      opts: ['Defeat', 'Success', 'Triumph', 'Win'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Light".',
      opts: ['Dark', 'Bright', 'Shiny', 'Glow'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Rich".',
      opts: ['Poor', 'Wealthy', 'Strong', 'Happy'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Love".',
      opts: ['Hate', 'Like', 'Care', 'Affection'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Brave".',
      opts: ['Cowardly', 'Strong', 'Fearless', 'Bold'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Success".',
      opts: ['Failure', 'Win', 'Triumph', 'Victory'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Happy".',
      opts: ['Sad', 'Joyful', 'Excited', 'Glad'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Increase".',
      opts: ['Rise', 'Grow', 'Decrease', 'Expand'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Antonym',
    },
    {
      q: 'Choose the antonym of "Friend".',
      opts: ['Enemy', 'Companion', 'Ally', 'Partner'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Antonym',
    },

    // --- Vocabulary (10) ---
    {
      q: 'Which word means "a place where books are kept"?',
      opts: ['Library', 'Bookshop', 'Archive', 'Museum'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Library',
    },
    {
      q: 'Which word means "a person who writes books"?',
      opts: ['Author', 'Reader', 'Editor', 'Publisher'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Author',
    },
    {
      q: 'Which word means "a place where animals are kept"?',
      opts: ['Zoo', 'Museum', 'Library', 'Garden'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Zoo',
    },
    {
      q: 'Which word means "a person who repairs shoes"?',
      opts: ['Cobbler', 'Tailor', 'Carpenter', 'Mason'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Cobbler',
    },
    {
      q: 'Which word means "a person who teaches"?',
      opts: ['Teacher', 'Doctor', 'Engineer', 'Pilot'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Teacher',
    },
    {
      q: 'Which word means "a person who flies an aircraft"?',
      opts: ['Pilot', 'Driver', 'Captain', 'Sailor'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Pilot',
    },
    {
      q: 'Which word means "a person who builds houses"?',
      opts: ['Mason', 'Carpenter', 'Painter', 'Plumber'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Mason',
    },
    {
      q: 'Which word means "a person who treats sick people"?',
      opts: ['Doctor', 'Nurse', 'Teacher', 'Lawyer'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Doctor',
    },
    {
      q: 'Which word means "a person who defends in court"?',
      opts: ['Lawyer', 'Judge', 'Doctor', 'Teacher'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Lawyer',
    },
    {
      q: 'Which word means "a person who makes clothes"?',
      opts: ['Tailor', 'Cobbler', 'Carpenter', 'Painter'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Tailor',
    },

    // --- Parts of Speech (10)
    {
      q: 'Identify the verb: "She runs fast."',
      opts: ['She', 'Runs', 'Fast', 'None'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Verb',
    },
    {
      q: 'Identify the noun: "The sun rises in the east."',
      opts: ['Sun', 'Rises', 'East', 'In'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Noun',
    },
    {
      q: 'Identify the adjective: "The clever boy solved the puzzle."',
      opts: ['Clever', 'Boy', 'Puzzle', 'Solved'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Adjective',
    },
    {
      q: 'Identify the adverb: "He speaks loudly."',
      opts: ['He', 'Speaks', 'Loudly', 'None'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Adverb',
    },
    {
      q: 'Identify the pronoun: "They are playing football."',
      opts: ['They', 'Playing', 'Football', 'Are'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Pronoun',
    },
    {
      q: 'Identify the conjunction: "She is poor but honest."',
      opts: ['Poor', 'But', 'Honest', 'She'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Conjunction',
    },
    {
      q: 'Identify the preposition: "The cat is under the table."',
      opts: ['Cat', 'Under', 'Table', 'Is'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Preposition',
    },
    {
      q: 'Identify the interjection: "Wow! That’s amazing."',
      opts: ['Wow', 'That’s', 'Amazing', 'None'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Interjection',
    },
    {
      q: 'Identify the verb: "He writes a letter."',
      opts: ['He', 'Writes', 'Letter', 'A'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Verb',
    },
    {
      q: 'Identify the noun: "The moon is bright tonight."',
      opts: ['Moon', 'Bright', 'Tonight', 'Is'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Noun',
    },
    {
      q: 'Identify the adjective: "The tall building collapsed."',
      opts: ['Tall', 'Building', 'Collapsed', 'The'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Adjective',
    },
    {
      q: 'Identify the pronoun: "She is my best friend."',
      opts: ['She', 'Best', 'Friend', 'My'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Pronoun',
    },
    {
      q: 'Identify the verb: "Birds fly in the sky."',
      opts: ['Birds', 'Fly', 'Sky', 'In'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Verb',
    },
    {
      q: 'Identify the adverb: "He answered correctly."',
      opts: ['He', 'Answered', 'Correctly', 'None'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Adverb',
    },

    // --- Tenses (10) ---
    {
      q: 'Fill in the blank: "She ___ a letter yesterday."',
      opts: ['write', 'writes', 'wrote', 'written'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Past_tense',
    },
    {
      q: 'Choose the correct tense: "They ___ playing football now."',
      opts: ['is', 'are', 'was', 'were'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Present_continuous',
    },
    {
      q: 'Fill in the blank: "He ___ to school every day."',
      opts: ['go', 'goes', 'gone', 'going'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Present_simple',
    },
    {
      q: 'Choose the correct tense: "She ___ finished her homework."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },
    {
      q: 'Choose the correct tense: "They ___ watching TV when I arrived."',
      opts: ['was', 'were', 'are', 'is'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Past_continuous',
    },
    {
      q: 'Fill in the blank: "He ___ gone to the market."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },
    {
      q: 'Choose the correct tense: "She ___ cooking when I called."',
      opts: ['is', 'was', 'were', 'has'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Past_continuous',
    },
    {
      q: 'Fill in the blank: "They ___ completed the project."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },
    {
      q: 'Choose the correct tense: "He ___ reading a book now."',
      opts: ['is', 'are', 'was', 'were'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Present_continuous',
    },
    {
      q: 'Fill in the blank: "She ___ gone to school."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },

    // --- Articles & Plurals (10) ---
    {
      q: 'Choose the correct article: "He bought ___ apple."',
      opts: ['a', 'an', 'the', 'no article'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Article_(grammar)',
    },
    {
      q: 'Choose the correct article: "___ sun rises in the east."',
      opts: ['a', 'an', 'the', 'no article'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Article_(grammar)',
    },
    {
      q: 'Pick the correct plural form of "Child".',
      opts: ['Childs', 'Children', 'Childes', 'Childrens'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Mouse".',
      opts: ['Mouses', 'Mice', 'Mouse', 'Mices'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Goose".',
      opts: ['Gooses', 'Geese', 'Goose', 'Goosen'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Tooth".',
      opts: ['Tooths', 'Teeth', 'Tooth', 'Teeths'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Foot".',
      opts: ['Foots', 'Feet', 'Foot', 'Feets'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Person".',
      opts: ['Persons', 'People', 'Person', 'Peoples'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Cactus".',
      opts: ['Cactuses', 'Cacti', 'Cactus', 'Cactii'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Plural',
    },
    {
      q: 'Pick the correct plural form of "Analysis".',
      opts: ['Analysises', 'Analyses', 'Analysis', 'Analysii'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Plural',
    },

    // --- Sentence Correction (10) ---
    {
      q: 'Choose the correct sentence.',
      opts: [
        'He go to school.',
        'He goes to school.',
        'He going to school.',
        'He gone to school.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: [
        'She have a book.',
        'She has a book.',
        'She having a book.',
        'She had a book.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: [
        'They is playing.',
        'They are playing.',
        'They was playing.',
        'They be playing.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: ['I am go.', 'I am going.', 'I going.', 'I gone.'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: ['We was happy.', 'We were happy.', 'We is happy.', 'We be happy.'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: [
        'She are my friend.',
        'She is my friend.',
        'She was my friend.',
        'She be my friend.',
      ],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: [
        'He do his homework.',
        'He does his homework.',
        'He did his homework.',
        'He done his homework.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: [
        'They has gone.',
        'They have gone.',
        'They had gone.',
        'They having gone.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: [
        'I has a pen.',
        'I have a pen.',
        'I had a pen.',
        'I having a pen.',
      ],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Sentence_(linguistics)',
    },
    {
      q: 'Choose the correct sentence.',
      opts: ['She were late.', 'She was late.', 'She is late.', 'She be late.'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Sentence_(linguistics)',
    },

    // --- Idioms & Phrases (10) ---
    {
      q: 'What does "Break the ice" mean?',
      opts: [
        'Start a conversation',
        'Destroy something',
        'Be rude',
        'Win a game',
      ],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Hit the nail on the head" mean?',
      opts: [
        'Do something wrong',
        'Say exactly the right thing',
        'Be careless',
        'Be angry',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Once in a blue moon" mean?',
      opts: ['Very often', 'Rarely', 'Always', 'Never'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    // --- Idioms & Phrases (continued) ---
    {
      q: 'What does "A piece of cake" mean?',
      opts: [
        'Difficult task',
        'Easy task',
        'Impossible task',
        'Dangerous task',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Burn the midnight oil" mean?',
      opts: ['Work late at night', 'Waste time', 'Sleep early', 'Be lazy'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Let the cat out of the bag" mean?',
      opts: ['Reveal a secret', 'Hide something', 'Be careless', 'Be angry'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Kick the bucket" mean?',
      opts: ['Start a game', 'Die', 'Be happy', 'Be careless'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Under the weather" mean?',
      opts: ['Feeling sick', 'Feeling happy', 'Feeling angry', 'Feeling lazy'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Spill the beans" mean?',
      opts: ['Reveal a secret', 'Cook food', 'Be careless', 'Be angry'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "In hot water" mean?',
      opts: ['In trouble', 'In happiness', 'In anger', 'In peace'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "On cloud nine" mean?',
      opts: ['Very happy', 'Very sad', 'Very angry', 'Very tired'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Once bitten, twice shy" mean?',
      opts: [
        'Careful after bad experience',
        'Always careless',
        'Always happy',
        'Always angry',
      ],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Idiom',
    },
    {
      q: 'What does "Rome was not built in a day" mean?',
      opts: [
        'Great things take time',
        'Everything is easy',
        'Work is fast',
        'Be lazy',
      ],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Idiom',
    },

    // --- Reported Speech (10) ---
    {
      q: 'Choose the correct reported speech: He said, "I am busy."',
      opts: [
        'He said that he is busy.',
        'He said that he was busy.',
        'He said he had busy.',
        'He said he will be busy.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: She said, "I will help you."',
      opts: [
        'She said that she will help me.',
        'She said that she would help me.',
        'She said she helps me.',
        'She said she helped me.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: They said, "We are playing."',
      opts: [
        'They said they are playing.',
        'They said they were playing.',
        'They said they had played.',
        'They said they will play.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: He said, "I have finished my work."',
      opts: [
        'He said he has finished his work.',
        'He said he had finished his work.',
        'He said he finished his work.',
        'He said he will finish his work.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: She said, "I am cooking."',
      opts: [
        'She said she is cooking.',
        'She said she was cooking.',
        'She said she had cooked.',
        'She said she will cook.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: He said, "I went to the market."',
      opts: [
        'He said he goes to the market.',
        'He said he had gone to the market.',
        'He said he will go to the market.',
        'He said he is going to the market.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: They said, "We will win."',
      opts: [
        'They said they will win.',
        'They said they would win.',
        'They said they won.',
        'They said they are winning.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: She said, "I can sing."',
      opts: [
        'She said she can sing.',
        'She said she could sing.',
        'She said she sings.',
        'She said she sang.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: He said, "I may come."',
      opts: [
        'He said he may come.',
        'He said he might come.',
        'He said he comes.',
        'He said he came.',
      ],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Reported_speech',
    },
    {
      q: 'Choose the correct reported speech: She said, "I must go."',
      opts: [
        'She said she must go.',
        'She said she had to go.',
        'She said she goes.',
        'She said she went.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Reported_speech',
    },

    // --- Cloze Tests (10) ---
    {
      q: 'Fill in the blank: "He is ___ honest man."',
      opts: ['a', 'an', 'the', 'no article'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Article_(grammar)',
    },
    {
      q: 'Fill in the blank: "She ___ reading a book."',
      opts: ['is', 'are', 'was', 'were'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_continuous',
    },
    {
      q: 'Fill in the blank: "They ___ completed the project."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },
    {
      q: 'Fill in the blank: "He ___ gone to school."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },
    {
      q: 'Fill in the blank: "She ___ cooking when I called."',
      opts: ['is', 'was', 'were', 'has'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Past_continuous',
    },
    {
      q: 'Fill in the blank: "They ___ watching TV now."',
      opts: ['is', 'are', 'was', 'were'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Present_continuous',
    },
    {
      q: 'Fill in the blank: "He ___ to school every day."',
      opts: ['go', 'goes', 'gone', 'going'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Present_simple',
    },
    {
      q: 'Fill in the blank: "She ___ finished her homework."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },
    {
      q: 'Fill in the blank: "They ___ playing football."',
      opts: ['is', 'are', 'was', 'were'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Present_continuous',
    },
    {
      q: 'Fill in the blank: "He ___ gone to the market."',
      opts: ['has', 'have', 'had', 'having'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Present_perfect',
    },

    // --- Advanced Grammar (10) ---
    {
      q: 'Choose the correct passive voice: "They are watching a movie."',
      opts: [
        'A movie is watched by them.',
        'A movie is being watched by them.',
        'A movie was watched by them.',
        'A movie has been watched by them.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Passive_voice',
    },
    {
      q: 'Choose the correct passive voice: "She writes a letter."',
      opts: [
        'A letter is written by her.',
        'A letter was written by her.',
        'A letter has written by her.',
        'A letter will be written by her.',
      ],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Passive_voice',
    },
    {
      q: 'Choose the correct passive voice: "He is cleaning the room."',
      opts: [
        'The room is cleaned by him.',
        'The room is being cleaned by him.',
        'The room was cleaned by him.',
        'The room has been cleaned by him.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Passive_voice',
    },
    {
      q: 'Choose the correct conditional sentence: "If she ___ earlier, she would have caught the train."',
      opts: ['leave', 'left', 'had left', 'leaves'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Conditional_sentence',
    },
    {
      q: 'Choose the correct conditional sentence: "If it ___ tomorrow, we will cancel the trip."',
      opts: ['rains', 'rain', 'rained', 'raining'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Conditional_sentence',
    },
    {
      q: 'Choose the correct passive voice: "They built a house."',
      opts: [
        'A house is built by them.',
        'A house was built by them.',
        'A house has been built by them.',
        'A house will be built by them.',
      ],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Passive_voice',
    },
    {
      q: 'Choose the correct conditional sentence: "If I ___ you, I would apologize."',
      opts: ['am', 'was', 'were', 'be'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Conditional_sentence',
    },
    {
      q: 'Choose the correct passive voice: "She will finish the work."',
      opts: [
        'The work is finished by her.',
        'The work was finished by her.',
        'The work will be finished by her.',
        'The work has been finished by her.',
      ],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Passive_voice',
    },
    {
      q: 'Choose the correct conditional sentence: "If they ___ harder, they could have won."',
      opts: ['try', 'tried', 'had tried', 'tries'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Conditional_sentence',
    },
    {
      q: 'Choose the correct passive voice: "He has completed the project."',
      opts: [
        'The project is completed by him.',
        'The project was completed by him.',
        'The project has been completed by him.',
        'The project will be completed by him.',
      ],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Passive_voice',
    },
    {
      q: 'Choose the correct conditional sentence: "If you ___ the rules, you will be punished."',
      opts: ['break', 'broke', 'broken', 'breaking'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Conditional_sentence',
    },
  ];

  const mathMentalAbilityQuestions = [
    // --- Arithmetic Basics (15) ---
    {
      q: 'What is 25% of 200?',
      opts: ['25', '50', '75', '100'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Percentage',
    },
    {
      q: 'Simplify: 3/4 + 2/3',
      opts: ['17/12', '13/12', '5/7', '19/12'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Fraction',
    },
    {
      q: 'A shopkeeper buys an item for ₹500 and sells it for ₹600. What is the profit percentage?',
      opts: ['10%', '15%', '20%', '25%'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Profit_(accounting)',
    },
    {
      q: 'If 12 workers can complete a task in 8 days, how many days will 24 workers take?',
      opts: ['2', '3', '4', '6'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },
    {
      q: 'A train travels 120 km in 2 hours. What is its average speed?',
      opts: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },
    {
      q: 'The average of 10, 20, 30, 40, and 50 is:',
      opts: ['20', '25', '30', '35'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },
    {
      q: 'Find the compound interest on ₹1000 at 10% per annum for 2 years.',
      opts: ['₹100', '₹200', '₹210', '₹220'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Compound_interest',
    },
    {
      q: 'Solve: If x + 5 = 12, then x = ?',
      opts: ['5', '6', '7', '8'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Linear_equation',
    },
    {
      q: 'A man spends 1/3 of his salary on rent and 1/4 on food. If his salary is ₹12,000, how much is left?',
      opts: ['₹4000', '₹5000', '₹6000', '₹7000'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Salary',
    },
    {
      q: 'The ratio of ages of A and B is 3:5. If A is 15 years old, how old is B?',
      opts: ['20', '22', '24', '25'],
      ans: 3,
      difficulty: 'easy',
      wikiKeyword: 'Ratio',
    },
    {
      q: 'Find the simple interest on ₹2000 at 5% per annum for 4 years.',
      opts: ['₹300', '₹400', '₹500', '₹600'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Simple_interest',
    },
    {
      q: 'Divide ₹900 in the ratio 2:1.',
      opts: [
        '₹600 and ₹300',
        '₹450 and ₹450',
        '₹500 and ₹400',
        '₹700 and ₹200',
      ],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Ratio',
    },
    {
      q: 'If 5 kg of rice costs ₹250, what is the cost of 8 kg?',
      opts: ['₹350', '₹400', '₹450', '₹500'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Proportion',
    },
    {
      q: 'A trader marks goods 20% above cost price and allows a discount of 10%. What is the profit percentage?',
      opts: ['8%', '10%', '12%', '15%'],
      ans: 2,
      difficulty: 'hard',
      wikiKeyword: 'Profit_(accounting)',
    },
    {
      q: 'A car travels 240 km in 4 hours. What is its speed?',
      opts: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Speed',
    },

    // --- Algebra (10) ---
    {
      q: 'Solve: 2x + 5 = 15',
      opts: ['x=3', 'x=4', 'x=5', 'x=6'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Linear_equation',
    },
    {
      q: 'Solve: x² - 9 = 0',
      opts: ['x=±3', 'x=±9', 'x=±1', 'x=±0'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Quadratic_equation',
    },
    {
      q: 'Simplify: (x+2)(x+3)',
      opts: ['x²+5x+6', 'x²+6x+5', 'x²+4x+6', 'x²+5x+5'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Algebra',
    },
    {
      q: 'If 2x=10, then x=?',
      opts: ['2', '3', '4', '5'],
      ans: 3,
      difficulty: 'easy',
      wikiKeyword: 'Linear_equation',
    },
    {
      q: 'Solve: x²+2x+1=0',
      opts: ['x=-1', 'x=1', 'x=0', 'x=2'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Quadratic_equation',
    },
    {
      q: 'Simplify: (x-1)(x-1)',
      opts: ['x²-2x+1', 'x²+2x+1', 'x²-1', 'x²+1'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Algebra',
    },
    {
      q: 'Solve: 3x-7=11',
      opts: ['x=6', 'x=7', 'x=8', 'x=9'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Linear_equation',
    },
    {
      q: 'Solve: x²-4=0',
      opts: ['x=±2', 'x=±4', 'x=±1', 'x=±0'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Quadratic_equation',
    },
    {
      q: 'Simplify: (x+5)(x-5)',
      opts: ['x²-25', 'x²+25', 'x²-10x+25', 'x²+10x+25'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Algebra',
    },
    {
      q: 'Solve: 5x=25',
      opts: ['x=4', 'x=5', 'x=6', 'x=7'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Linear_equation',
    },

    // --- Geometry & Mensuration (10) ---
    {
      q: 'Area of a rectangle with length 10 and breadth 5?',
      opts: ['40', '50', '60', '70'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Rectangle',
    },
    {
      q: 'Area of a triangle with base 6 and height 4?',
      opts: ['10', '12', '14', '15'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Triangle',
    },
    {
      q: 'Circumference of a circle with radius 7?',
      opts: ['44', '46', '48', '50'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Circle',
    },
    {
      q: 'Volume of a cube with side 3?',
      opts: ['9', '18', '27', '36'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Cube',
    },
    {
      q: 'Surface area of a sphere with radius 7?',
      opts: ['616', '618', '620', '622'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Sphere',
    },
    {
      q: 'Area of a square with side 8?',
      opts: ['64', '65', '66', '67'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Square',
    },
    {
      q: 'Volume of a cylinder with radius 7 and height 10?',
      opts: ['1540', '1550', '1560', '1570'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Cylinder',
    },
    {
      q: 'Area of a parallelogram with base 12 and height 5?',
      opts: ['50', '55', '60', '65'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Parallelogram',
    },
    {
      q: 'Surface area of a cube with side 4?',
      opts: ['64', '96', '128', '160'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Cube',
    },
    {
      q: 'Volume of a cone with radius 3 and height 5?',
      opts: ['15', '30', '45', '60'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Cone',
    },
    {
      q: 'The mean of 5, 10, 15, 20, 25 is:',
      opts: ['10', '15', '20', '25'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Mean',
    },
    {
      q: 'The median of 2, 4, 6, 8, 10 is:',
      opts: ['4', '6', '8', '10'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Median',
    },
    {
      q: 'The mode of 2, 3, 3, 4, 5 is:',
      opts: ['2', '3', '4', '5'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Mode',
    },
    {
      q: 'If a coin is tossed once, probability of getting heads is:',
      opts: ['0.25', '0.5', '0.75', '1'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Probability',
    },
    {
      q: 'If a die is rolled, probability of getting an even number is:',
      opts: ['1/2', '1/3', '1/6', '2/3'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Probability',
    },
    {
      q: 'Number of ways to arrange 3 books on a shelf:',
      opts: ['3', '6', '9', '12'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Permutation',
    },
    {
      q: 'Number of ways to choose 2 items from 4:',
      opts: ['4', '6', '8', '12'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Combination',
    },
    {
      q: 'Probability of drawing a red card from a deck of 52:',
      opts: ['1/2', '1/4', '1/3', '1/52'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Probability',
    },
    {
      q: 'Mean of first 5 natural numbers:',
      opts: ['2', '3', '4', '5'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Mean',
    },
    {
      q: 'Variance measures:',
      opts: ['Central tendency', 'Spread of data', 'Probability', 'Frequency'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Variance',
    },

    // --- Logical Reasoning (15) ---
    {
      q: 'Find the missing term: 2, 4, 8, 16, ?',
      opts: ['24', '30', '32', '36'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Number_series',
    },
    {
      q: 'Find the odd one out: Apple, Banana, Mango, Carrot',
      opts: ['Apple', 'Banana', 'Mango', 'Carrot'],
      ans: 3,
      difficulty: 'easy',
      wikiKeyword: 'Classification',
    },
    {
      q: 'If A=1, B=2, then CAT = ?',
      opts: ['24', '27', '30', '36'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Coding_theory',
    },
    {
      q: 'Father’s son’s son is?',
      opts: ['Brother', 'Son', 'Grandson', 'Nephew'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Family_relationships',
    },
    {
      q: 'If North is 0°, East is 90°, then South is?',
      opts: ['90°', '180°', '270°', '360°'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Cardinal_direction',
    },
    {
      q: 'In a row of 10 people, A is 3rd from left. Position from right?',
      opts: ['7th', '8th', '9th', '10th'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Seating_arrangement',
    },
    {
      q: 'All cats are animals. All animals are living beings. Conclusion: All cats are living beings?',
      opts: ['True', 'False', 'Cannot say', 'None'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Syllogism',
    },
    {
      q: 'Venn diagram: Students, Boys, Girls — correct relation?',
      opts: [
        'Overlapping circles',
        'Separate circles',
        'Nested circles',
        'None',
      ],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Venn_diagram',
    },
    {
      q: 'Analogy: Hand : Glove :: Foot : ?',
      opts: ['Shoe', 'Sock', 'Slipper', 'Boot'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Analogy',
    },
    {
      q: 'Series: 2, 6, 12, 20, ?',
      opts: ['28', '30', '32', '34'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Number_series',
    },
    {
      q: 'Odd one: Circle, Square, Triangle, Rectangle',
      opts: ['Circle', 'Square', 'Triangle', 'Rectangle'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Classification',
    },
    {
      q: 'Coding: If CAT=3120, then DOG=?',
      opts: ['4157', '4156', '4158', '4160'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Coding_theory',
    },
    {
      q: 'Blood relation: A is B’s mother. B is C’s father. Relation of A to C?',
      opts: ['Grandmother', 'Mother', 'Aunt', 'Sister'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Family_relationships',
    },
    {
      q: 'Direction: Facing East, turn right, then left. Final direction?',
      opts: ['North', 'South', 'East', 'West'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Cardinal_direction',
    },
    {
      q: 'Puzzle: If 5 pens cost ₹50, how much do 12 pens cost?',
      opts: ['100', '110', '120', '130'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Puzzle',
    },

    // --- Calendar & Clock Problems (10) ---
    {
      q: 'How many days are there in a leap year?',
      opts: ['365', '366', '364', '367'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Leap_year',
    },
    {
      q: 'If 1 Jan 2020 was Wednesday, what day was 1 Jan 2021?',
      opts: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Calendar',
    },
    {
      q: 'Angle between hands of clock at 3:00?',
      opts: ['60°', '90°', '120°', '180°'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Clock',
    },
    {
      q: 'Angle between hands at 6:00?',
      opts: ['90°', '120°', '180°', '150°'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Clock',
    },
    {
      q: 'Day after 100 days from 1 Jan 2022?',
      opts: ['10 April', '11 April', '12 April', '13 April'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Calendar',
    },
    {
      q: 'If today is Monday, what day will it be after 45 days?',
      opts: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Calendar',
    },
    {
      q: 'How many right angles in a clock at 12 hours?',
      opts: ['22', '44', '48', '50'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Clock',
    },
    {
      q: 'If 15 August 1947 was Friday, what was 15 August 1948?',
      opts: ['Saturday', 'Sunday', 'Monday', 'Tuesday'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Calendar',
    },
    {
      q: 'How many minutes between 4:15 and 5:00?',
      opts: ['30', '35', '40', '45'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Clock',
    },
    {
      q: 'If 1 Jan 2000 was Saturday, what was 1 Jan 2001?',
      opts: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Calendar',
    },

    // --- Data Interpretation (10) ---
    {
      q: 'If a student scores 80, 90, 70, average is?',
      opts: ['75', '80', '85', '90'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },
    {
      q: 'If a student scores 80, 90, 70, average is?',
      opts: ['75', '80', '85', '90'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Average',
    },
    {
      q: 'Pie chart: If 25% students study Science, 50% Arts, 25% Commerce, which stream has maximum students?',
      opts: ['Science', 'Arts', 'Commerce', 'None'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Pie_chart',
    },
    {
      q: 'Bar graph: If sales in Jan=200, Feb=300, Mar=250, which month had highest sales?',
      opts: ['Jan', 'Feb', 'Mar', 'Equal'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Bar_chart',
    },
    {
      q: 'Line graph: If production rises from 100 to 200 in 5 years, average increase per year?',
      opts: ['10', '15', '20', '25'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Line_chart',
    },
    {
      q: 'Table: If 4 students scored 50, 60, 70, 80, total score?',
      opts: ['240', '250', '260', '270'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Data_analysis',
    },
    {
      q: 'Pie chart: If 40% employees are male, 60% female, ratio of male to female?',
      opts: ['2:3', '3:2', '1:2', '2:1'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Pie_chart',
    },
    {
      q: 'Bar graph: If sales doubled from 200 to 400, percentage increase?',
      opts: ['50%', '100%', '150%', '200%'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Bar_chart',
    },
    {
      q: 'Line graph: If population grows 10% annually, initial=1000, after 1 year?',
      opts: ['1050', '1100', '1150', '1200'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Line_chart',
    },
    {
      q: 'Table: If 5 workers produce 100 units, average per worker?',
      opts: ['15', '18', '20', '25'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Data_analysis',
    },
    {
      q: 'Pie chart: If 30% students passed, 70% failed, ratio of pass to fail?',
      opts: ['3:7', '7:3', '30:70', '70:30'],
      ans: 0,
      difficulty: 'medium',
      wikiKeyword: 'Pie_chart',
    },
    // --- Puzzles & Advanced Reasoning (15) ---
    {
      q: 'Five friends are sitting in a row. A is left of B, C is right of B, D is left of A, E is right of C. Who is in the middle?',
      opts: ['A', 'B', 'C', 'D'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Seating_arrangement',
    },
    {
      q: 'In a family of 6, P is father, Q is mother, R and S are sons, T and U are daughters. How many females?',
      opts: ['2', '3', '4', '5'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Family_relationships',
    },
    {
      q: 'If 2 pencils cost ₹10, how much do 12 pencils cost?',
      opts: ['50', '55', '60', '65'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Puzzle',
    },
    {
      q: 'A clock shows 3:15. What is the angle between hands?',
      opts: ['37.5°', '45°', '47.5°', '50°'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Clock',
    },
    {
      q: 'If 1=2, 2=4, 3=6, then 5=?',
      opts: ['8', '9', '10', '12'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Number_series',
    },
    {
      q: 'Arrange: Mango, Apple, Banana, Orange alphabetically.',
      opts: [
        'Apple, Banana, Mango, Orange',
        'Banana, Apple, Orange, Mango',
        'Orange, Mango, Apple, Banana',
        'Mango, Orange, Apple, Banana',
      ],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Alphabetical_order',
    },
    {
      q: 'If A is taller than B, B taller than C, who is shortest?',
      opts: ['A', 'B', 'C', 'Cannot say'],
      ans: 2,
      difficulty: 'easy',
      wikiKeyword: 'Logical_deduction',
    },
    {
      q: 'Find missing term: 3, 6, 12, 24, ?',
      opts: ['36', '42', '48', '50'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Number_series',
    },
    {
      q: 'If 1 Jan 2020 was Wednesday, what day was 1 Jan 2022?',
      opts: ['Friday', 'Saturday', 'Sunday', 'Monday'],
      ans: 1,
      difficulty: 'hard',
      wikiKeyword: 'Calendar',
    },
    {
      q: 'Puzzle: A man has 3 sons. Each son has 2 sisters. How many children?',
      opts: ['5', '6', '7', '8'],
      ans: 1,
      difficulty: 'medium',
      wikiKeyword: 'Puzzle',
    },
    {
      q: 'If 2x=10, then 4x=?',
      opts: ['15', '20', '25', '30'],
      ans: 1,
      difficulty: 'easy',
      wikiKeyword: 'Algebra',
    },
    {
      q: 'Odd one: Dog, Cat, Cow, Chair',
      opts: ['Dog', 'Cat', 'Cow', 'Chair'],
      ans: 3,
      difficulty: 'easy',
      wikiKeyword: 'Classification',
    },
    {
      q: 'Analogy: Bird : Nest :: Bee : ?',
      opts: ['Hive', 'Tree', 'Cave', 'Burrow'],
      ans: 0,
      difficulty: 'easy',
      wikiKeyword: 'Analogy',
    },
    {
      q: 'Coding: If CAT=3120, then BAT=?',
      opts: ['2120', '3120', '4120', '5120'],
      ans: 0,
      difficulty: 'hard',
      wikiKeyword: 'Coding_theory',
    },
    {
      q: 'Puzzle: If 3 men can dig a pit in 6 days, how many days will 6 men take?',
      opts: ['2', '3', '4', '5'],
      ans: 2,
      difficulty: 'medium',
      wikiKeyword: 'Work_(physics)',
    },
  ];

  // Additional miscellaneous questions
  const miscQuestions = [
    {
      q: 'What is the largest continent by area?',
      opts: ['Africa', 'Asia', 'Europe', 'North America'],
      ans: 1,
      wikiKeyword: 'Asia',
    },
    {
      q: 'How many colors are in the rainbow?',
      opts: ['5', '6', '7', '8'],
      ans: 2,
      wikiKeyword: 'Rainbow',
    },
    {
      q: 'What is the smallest country in the world?',
      opts: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
      ans: 2,
      wikiKeyword: 'Vatican_City',
    },
    {
      q: 'Which planet is known as the Red Planet?',
      opts: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      ans: 1,
      wikiKeyword: 'Mars',
    },
    {
      q: 'Who wrote "Romeo and Juliet"?',
      opts: [
        'Charles Dickens',
        'William Shakespeare',
        'Jane Austen',
        'Mark Twain',
      ],
      ans: 1,
      wikiKeyword: 'William_Shakespeare',
    },
    {
      q: 'What is the capital of Japan?',
      opts: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'],
      ans: 2,
      wikiKeyword: 'Tokyo',
    },
    {
      q: 'Which gas do plants absorb from the atmosphere?',
      opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      ans: 1,
      wikiKeyword: 'Carbon_dioxide',
    },
    {
      q: 'What is the largest ocean on Earth?',
      opts: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
      ans: 2,
      wikiKeyword: 'Pacific_Ocean',
    },
    {
      q: 'Which country invented pizza?',
      opts: ['France', 'Italy', 'USA', 'Greece'],
      ans: 1,
      wikiKeyword: 'Italy',
    },
    {
      q: 'What is the hardest natural substance?',
      opts: ['Gold', 'Iron', 'Diamond', 'Quartz'],
      ans: 2,
      wikiKeyword: 'Diamond',
    },
    {
      q: 'Which element has the chemical symbol O?',
      opts: ['Oxygen', 'Osmium', 'Oganesson', 'Oxide'],
      ans: 0,
      wikiKeyword: 'Oxygen',
    },
    {
      q: 'Who painted the Mona Lisa?',
      opts: [
        'Leonardo da Vinci',
        'Pablo Picasso',
        'Vincent van Gogh',
        'Michelangelo',
      ],
      ans: 0,
      wikiKeyword: 'Mona_Lisa',
    },
    {
      q: 'Which is the longest river in the world?',
      opts: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
      ans: 1,
      wikiKeyword: 'Nile',
    },
    {
      q: 'What is the currency of the United Kingdom?',
      opts: ['Euro', 'Dollar', 'Pound Sterling', 'Franc'],
      ans: 2,
      wikiKeyword: 'Pound_sterling',
    },
    {
      q: 'Which organ in the human body pumps blood?',
      opts: ['Lungs', 'Brain', 'Heart', 'Kidneys'],
      ans: 2,
      wikiKeyword: 'Heart',
    },
    {
      q: 'Which country is known as the Land of the Rising Sun?',
      opts: ['China', 'Japan', 'Thailand', 'South Korea'],
      ans: 1,
      wikiKeyword: 'Japan',
    },
    {
      q: 'What is the tallest mountain in the world?',
      opts: ['K2', 'Mount Everest', 'Kangchenjunga', 'Makalu'],
      ans: 1,
      wikiKeyword: 'Mount_Everest',
    },
    {
      q: 'Which language has the most native speakers?',
      opts: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi'],
      ans: 1,
      wikiKeyword: 'Mandarin_Chinese',
    },
    {
      q: 'Which planet is closest to the Sun?',
      opts: ['Mercury', 'Venus', 'Earth', 'Mars'],
      ans: 0,
      wikiKeyword: 'Mercury_(planet)',
    },
    {
      q: 'What is the largest desert in the world?',
      opts: ['Sahara', 'Gobi', 'Antarctic Desert', 'Kalahari'],
      ans: 2,
      wikiKeyword: 'Antarctic_Desert',
    },
    {
      q: 'Who discovered gravity?',
      opts: [
        'Albert Einstein',
        'Isaac Newton',
        'Galileo Galilei',
        'Nikola Tesla',
      ],
      ans: 1,
      wikiKeyword: 'Isaac_Newton',
    },
    {
      q: 'Which country hosted the 2016 Summer Olympics?',
      opts: ['China', 'Brazil', 'UK', 'Japan'],
      ans: 1,
      wikiKeyword: '2016_Summer_Olympics',
    },
    {
      q: 'What is the national animal of India?',
      opts: ['Elephant', 'Tiger', 'Lion', 'Peacock'],
      ans: 1,
      wikiKeyword: 'Bengal_tiger',
    },
    {
      q: 'Which blood type is known as the universal donor?',
      opts: ['A', 'B', 'AB', 'O'],
      ans: 3,
      wikiKeyword: 'Blood_donation#Universal_donor',
    },
    {
      q: 'What is the capital of Australia?',
      opts: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
      ans: 2,
      wikiKeyword: 'Canberra',
    },
    {
      q: 'Which instrument has 88 keys?',
      opts: ['Guitar', 'Piano', 'Violin', 'Flute'],
      ans: 1,
      wikiKeyword: 'Piano',
    },
    {
      q: 'Which country is famous for tulips?',
      opts: ['Netherlands', 'Belgium', 'France', 'Germany'],
      ans: 0,
      wikiKeyword: 'Netherlands',
    },
    {
      q: 'What is the boiling point of water at sea level?',
      opts: ['90°C', '95°C', '100°C', '110°C'],
      ans: 2,
      wikiKeyword: 'Boiling_point',
    },
    {
      q: 'Which bird is a universal symbol of peace?',
      opts: ['Crow', 'Dove', 'Eagle', 'Sparrow'],
      ans: 1,
      wikiKeyword: 'Dove',
    },
    {
      q: 'Which continent has the most countries?',
      opts: ['Asia', 'Africa', 'Europe', 'South America'],
      ans: 1,
      wikiKeyword: 'Africa',
    },
    {
      q: 'What is the capital of Canada?',
      opts: ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'],
      ans: 1,
      wikiKeyword: 'Ottawa',
    },
    {
      q: 'Which is the fastest land animal?',
      opts: ['Lion', 'Cheetah', 'Horse', 'Tiger'],
      ans: 1,
      wikiKeyword: 'Cheetah',
    },
    {
      q: 'Who invented the telephone?',
      opts: [
        'Alexander Graham Bell',
        'Thomas Edison',
        'Nikola Tesla',
        'James Watt',
      ],
      ans: 0,
      wikiKeyword: 'Alexander_Graham_Bell',
    },
    {
      q: 'Which country is known as the Land of a Thousand Lakes?',
      opts: ['Norway', 'Finland', 'Sweden', 'Denmark'],
      ans: 1,
      wikiKeyword: 'Finland',
    },
    {
      q: 'What is the capital of Egypt?',
      opts: ['Cairo', 'Alexandria', 'Luxor', 'Giza'],
      ans: 0,
      wikiKeyword: 'Cairo',
    },
    {
      q: 'Which planet is known for its rings?',
      opts: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
      ans: 1,
      wikiKeyword: 'Saturn',
    },
    {
      q: 'Which vitamin is produced when the skin is exposed to sunlight?',
      opts: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
      ans: 3,
      wikiKeyword: 'Vitamin_D',
    },
    {
      q: 'Which country is home to the kangaroo?',
      opts: ['India', 'Australia', 'South Africa', 'New Zealand'],
      ans: 1,
      wikiKeyword: 'Australia',
    },
    {
      q: 'What is the capital of France?',
      opts: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      ans: 2,
      wikiKeyword: 'Paris',
    },
    {
      q: 'Which is the largest mammal?',
      opts: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
      ans: 1,
      wikiKeyword: 'Blue_whale',
    },
    {
      q: 'Who was the first man to walk on the moon?',
      opts: [
        'Buzz Aldrin',
        'Yuri Gagarin',
        'Neil Armstrong',
        'Michael Collins',
      ],
      ans: 2,
      wikiKeyword: 'Neil_Armstrong',
    },
    {
      q: 'Which country is famous for sushi?',
      opts: ['China', 'Japan', 'Thailand', 'Vietnam'],
      ans: 1,
      wikiKeyword: 'Japan',
    },
    {
      q: 'What is the capital of Germany?',
      opts: ['Munich', 'Berlin', 'Frankfurt', 'Hamburg'],
      ans: 1,
      wikiKeyword: 'Berlin',
    },
    {
      q: 'Which gas is essential for breathing?',
      opts: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
      ans: 1,
      wikiKeyword: 'Oxygen',
    },
  ];
  for (let i = 0; i < miscQuestions.length; i++) {
    const misc = miscQuestions[i];
    const shuffledOptions = shuffle(misc.opts);
    questions.push({
      category: 'general',
      question: misc.q,
      options: shuffledOptions,
      keyword: misc.wikiKeyword,
      subCategory: 'Miscellaneous',
      correctAnswer: shuffledOptions.indexOf(misc.opts[misc.ans]),
      difficulty: 'medium',
      points: 10,
    });
  }
  for (let i = 0; i < arithmeticBasicsQuestions.length; i++) {
    const misc = arithmeticBasicsQuestions[i];
    const shuffledOptions = shuffle(misc.opts);
    questions.push({
      category: 'general',
      question: misc.q,
      options: shuffledOptions,
      keyword: misc.wikiKeyword,
      subCategory: 'Arithmetic Basics',
      correctAnswer: shuffledOptions.indexOf(misc.opts[misc.ans]),
      difficulty: misc.difficulty as Difficulty,
      points: findPoints(misc.difficulty as Difficulty),
    });
  }
  for (let i = 0; i < mathMentalAbilityQuestions.length; i++) {
    const misc = mathMentalAbilityQuestions[i];
    const shuffledOptions = shuffle(misc.opts);
    questions.push({
      category: 'general',
      question: misc.q,
      options: shuffledOptions,
      keyword: misc.wikiKeyword,
      subCategory: 'Mathematical Mental Ability',
      correctAnswer: shuffledOptions.indexOf(misc.opts[misc.ans]),
      difficulty: misc.difficulty as Difficulty,
      points: findPoints(misc.difficulty as Difficulty),
    });
  }
  for (let i = 0; i < grammarVocabularyQuestions.length; i++) {
    const misc = grammarVocabularyQuestions[i];
    const shuffledOptions = shuffle(misc.opts);
    questions.push({
      category: 'general',
      question: misc.q,
      options: shuffledOptions,
      keyword: misc.wikiKeyword,
      subCategory: 'Grammar and Vocabulary',
      correctAnswer: shuffledOptions.indexOf(misc.opts[misc.ans]),
      difficulty: misc.difficulty as Difficulty,
      points: findPoints(misc.difficulty as Difficulty),
    });
  }

  // Return requested number of questions, or all if less available
  return questions.slice(0, count);
}

async function seed() {
  await dbConnect();

  // Always clear quiz questions to refresh question bank
  console.log('🗑️  Clearing quiz questions to refresh...');
  await QuizQuestion.deleteMany({});

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
        'Which investment typically offers the hardest returns but also the hardest risk?',
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

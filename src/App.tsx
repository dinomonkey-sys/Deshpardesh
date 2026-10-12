/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  History, 
  Sparkles, 
  ChevronRight, 
  Play,
  Send, 
  X, 
  Lock,
  Info,
  Trophy,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Award,
  UserCircle,
  BarChart,
  Map as MapIcon,
  CheckCircle2,
  PawPrint,
  Castle,
  Lightbulb,
  Cpu,
  User,
  Gamepad2,
  Move,
  Building2,
  PartyPopper,
  Music,
  Pyramid,
  Waves,
  Scroll,
  Sword,
  Sun,
  Mountain,
  Flame,
  Trees,
  Anchor,
  BookOpen,
  Cloud,
  Gem,
  Hammer,
  Heart,
  Moon,
  Star,
  Wind,
  Crown,
  Skull,
  Calculator,
  Telescope,
  Theater,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useKey } from 'react-use';
import { cn } from './lib/utils';
import { getCountryFact, askCountryQuestion, generateQuiz } from './services/gemini';

import { sounds } from './lib/sounds';

// --- Types ---
interface Country {
  id: string;
  name: string;
  flag: string;
  gradient: string;
  accent: string;
  textColor: string;
  mapIcon: React.ReactNode;
  topics: Topic[];
  worldX: number;
  worldY: number;
}

interface Topic {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  image: string;
  x: number; // World position X (%)
  y: number; // World position Y (%)
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Skin {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PlayerStats {
  completedCountries: string[];
  totalQuizScore: number;
  quizzesTaken: number;
  unlockedBadges: string[];
  exploredTopicsCount: number;
  allExploredTopics: string[];
}

// --- Constants ---
const SKINS: Skin[] = [
  { id: 'explorer', name: 'Adventurer', icon: '🤠', color: 'bg-amber-500' },
  { id: 'scholar', name: 'Scholar', icon: '🎓', color: 'bg-blue-500' },
  { id: 'artist', name: 'Artist', icon: '🎨', color: 'bg-pink-500' },
  { id: 'techie', name: 'Techie', icon: '💻', color: 'bg-purple-500' },
  { id: 'diver', name: 'Diver', icon: '🤿', color: 'bg-cyan-500' },
  { id: 'nature', name: 'Nature Lover', icon: '🌿', color: 'bg-green-500' },
  { id: 'chef', name: 'Chef', icon: '👨‍🍳', color: 'bg-orange-500' },
  { id: 'musician', name: 'Musician', icon: '🎸', color: 'bg-indigo-500' },
  { id: 'photographer', name: 'Photographer', icon: '📸', color: 'bg-slate-500' },
  { id: 'athlete', name: 'Athlete', icon: '🏃', color: 'bg-red-500' }
];

const COUNTRIES: Country[] = [
  {
    id: 'inca',
    name: 'Inca Empire',
    flag: '🇵🇪',
    gradient: 'bg-gradient-to-r from-orange-600 to-red-500',
    accent: 'text-orange-800',
    textColor: 'text-orange-800',
    mapIcon: <Mountain className="w-[80%] h-[80%] text-orange-200" />,
    topics: [
      { id: 'machu', title: 'Machu Picchu', icon: <Mountain className="w-6 h-6" />, color: 'bg-green-100 text-green-700', description: 'The lost city in the clouds.', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800', x: 40, y: 30 }
    ],
    worldX: 25,
    worldY: 75
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    gradient: 'bg-gradient-to-r from-red-600 to-yellow-500',
    accent: 'text-red-700',
    textColor: 'text-red-700',
    mapIcon: <MapIcon className="w-[80%] h-[80%] text-red-200" />,
    topics: [
      {
        id: 'animals',
        title: 'Giant Pandas',
        icon: <PawPrint className="w-6 h-6" />,
        color: 'bg-green-100 text-green-700 border-green-200',
        description: 'The beloved Giant Panda and the diverse wildlife of the Sichuan mountains.',
        image: 'https://images.unsplash.com/photo-1564349683136-77e08bef1ef1?auto=format&fit=crop&q=80&w=800',
        x: 25, y: 40
      },
      {
        id: 'monuments',
        title: 'The Great Wall',
        icon: <Castle className="w-6 h-6" />,
        color: 'bg-red-100 text-red-700 border-red-200',
        description: 'Walk through history on the Great Wall and explore the Forbidden City.',
        image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=800',
        x: 75, y: 30
      },
      {
        id: 'history',
        title: 'Imperial Dynasties',
        icon: <History className="w-6 h-6" />,
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        description: 'From the Qin Dynasty to the Ming and Qing, discover 5,000 years of history.',
        image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=80&w=800',
        x: 50, y: 65
      },
      {
        id: 'inventions',
        title: 'Four Great Inventions',
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        description: 'Discover paper, printing, gunpowder, and the compass.',
        image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&q=80&w=800',
        x: 85, y: 75
      },
      {
        id: 'tech',
        title: 'Future Tech',
        icon: <Cpu className="w-6 h-6" />,
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        description: 'High-speed rail, AI, and China\'s ambitious space exploration program.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        x: 15, y: 75
      }
    ],
    worldX: 82,
    worldY: 45
  },
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    flag: '🇪🇬',
    gradient: 'bg-gradient-to-r from-yellow-600 to-orange-500',
    accent: 'text-orange-700',
    textColor: 'text-orange-700',
    mapIcon: <Pyramid className="w-[80%] h-[80%] text-orange-200" />,
    topics: [
      { id: 'pyramids', title: 'Great Pyramids', icon: <Pyramid className="w-6 h-6" />, color: 'bg-orange-100 text-orange-700', description: 'The Giza complex and the Sphinx.', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800', x: 30, y: 20 },
      { id: 'nile', title: 'The River Nile', icon: <Waves className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700', description: 'The lifeblood of the civilization.', image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800', x: 50, y: 50 },
      { id: 'hieroglyphs', title: 'Hieroglyphs', icon: <Scroll className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'Ancient writing and papyrus.', image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=800', x: 70, y: 80 },
      { id: 'pharaohs', title: 'Pharaohs & Queens', icon: <Crown className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'The divine rulers like Ramses and Cleopatra.', image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=800', x: 15, y: 45 },
      { id: 'mummy', title: 'Mummification', icon: <Skull className="w-6 h-6" />, color: 'bg-slate-100 text-slate-700', description: 'The secrets of the afterlife and preservation.', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800', x: 80, y: 25 },
      { id: 'valley', title: 'Valley of the Kings', icon: <Mountain className="w-6 h-6" />, color: 'bg-stone-100 text-stone-700', description: 'The hidden tombs of the New Kingdom.', image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800', x: 40, y: 75 },
      { id: 'gods', title: 'Ancient Gods', icon: <Sun className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'Ra, Anubis, Isis, and the pantheon.', image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=800', x: 85, y: 60 }
    ],
    worldX: 55,
    worldY: 50
  },
  {
    id: 'greece',
    name: 'Ancient Greece',
    flag: '🇬🇷',
    gradient: 'bg-gradient-to-r from-blue-600 to-white',
    accent: 'text-blue-700',
    textColor: 'text-blue-700',
    mapIcon: <Building2 className="w-[80%] h-[80%] text-blue-200" />,
    topics: [
      { id: 'philosophy', title: 'Philosophy', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700', description: 'Socrates, Plato, and Aristotle.', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800', x: 20, y: 30 },
      { id: 'olympics', title: 'Olympics', icon: <Trophy className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'The origin of the games.', image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800', x: 80, y: 40 },
      { id: 'mythology', title: 'Mythology', icon: <Sparkles className="w-6 h-6" />, color: 'bg-purple-100 text-purple-700', description: 'Gods and heroes of Olympus.', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800', x: 50, y: 70 },
      { id: 'mathematics', title: 'Greek Mathematics', icon: <Calculator className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'Pythagoras, Euclid, and the foundations of geometry.', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', x: 15, y: 60 },
      { id: 'astronomy', title: 'Ancient Astronomy', icon: <Telescope className="w-6 h-6" />, color: 'bg-indigo-100 text-indigo-700', description: 'Mapping the stars and the first heliocentric models.', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800', x: 85, y: 15 },
      { id: 'theater', title: 'Greek Theater', icon: <Theater className="w-6 h-6" />, color: 'bg-pink-100 text-pink-700', description: 'The origin of tragedy and comedy in Athens.', image: 'https://images.unsplash.com/photo-1503095396549-807a8bc36675?auto=format&fit=crop&q=80&w=800', x: 35, y: 10 }
    ],
    worldX: 50,
    worldY: 40
  },
  {
    id: 'rome',
    name: 'Ancient Rome',
    flag: '🇮🇹',
    gradient: 'bg-gradient-to-r from-red-800 to-yellow-600',
    accent: 'text-red-800',
    textColor: 'text-red-800',
    mapIcon: <Sword className="w-[80%] h-[80%] text-red-200" />,
    topics: [
      { id: 'colosseum', title: 'Colosseum', icon: <Castle className="w-6 h-6" />, color: 'bg-red-100 text-red-700', description: 'Gladiators and grand spectacles.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800', x: 40, y: 20 },
      { id: 'legions', title: 'Roman Legions', icon: <Sword className="w-6 h-6" />, color: 'bg-slate-100 text-slate-700', description: 'The military might of the empire.', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', x: 60, y: 60 },
      { id: 'engineering', title: 'Engineering', icon: <Hammer className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700', description: 'Aqueducts and Roman roads.', image: 'https://images.unsplash.com/photo-1503387762-592dec58ef4e?auto=format&fit=crop&q=80&w=800', x: 20, y: 80 },
      { id: 'pantheon', title: 'The Pantheon', icon: <Building2 className="w-6 h-6" />, color: 'bg-stone-100 text-stone-700', description: 'The temple of all gods with its massive dome.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800', x: 80, y: 30 },
      { id: 'pompeii', title: 'Pompeii', icon: <Flame className="w-6 h-6" />, color: 'bg-orange-100 text-orange-700', description: 'A city frozen in time by Mount Vesuvius.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800', x: 70, y: 85 },
      { id: 'republic', title: 'Roman Republic', icon: <Scroll className="w-6 h-6" />, color: 'bg-red-50 text-red-800', description: 'The birth of representative government and the Senate.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800', x: 15, y: 45 }
    ],
    worldX: 45,
    worldY: 35
  },
  {
    id: 'mesopotamia',
    name: 'Mesopotamia',
    flag: '🇮🇶',
    gradient: 'bg-gradient-to-r from-amber-600 to-yellow-400',
    accent: 'text-amber-800',
    textColor: 'text-amber-800',
    mapIcon: <Sun className="w-[80%] h-[80%] text-amber-200" />,
    topics: [
      { id: 'ziggurats', title: 'Ziggurats', icon: <Mountain className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'Temples reaching for the heavens.', image: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=800', x: 30, y: 30 },
      { id: 'writing', title: 'Cuneiform', icon: <Scroll className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'The world\'s first writing system.', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800', x: 70, y: 50 },
      { id: 'code', title: 'Hammurabi\'s Code', icon: <BookOpen className="w-6 h-6" />, color: 'bg-slate-100 text-slate-700', description: 'The foundation of law.', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800', x: 50, y: 80 },
      { id: 'gardens', title: 'Hanging Gardens', icon: <Trees className="w-6 h-6" />, color: 'bg-green-100 text-green-700', description: 'The legendary terraced gardens of Babylon.', image: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=800', x: 85, y: 20 },
      { id: 'babylon', title: 'City of Babylon', icon: <Building2 className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-800', description: 'The majestic capital of the Babylonian empire.', image: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=800', x: 15, y: 65 },
      { id: 'irrigation', title: 'Irrigation Systems', icon: <Waves className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700', description: 'Mastering the Tigris and Euphrates rivers.', image: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=800', x: 45, y: 10 }
    ],
    worldX: 62,
    worldY: 45
  },
  {
    id: 'maya',
    name: 'Maya Empire',
    flag: '🇲🇽',
    gradient: 'bg-gradient-to-r from-green-700 to-yellow-600',
    accent: 'text-green-800',
    textColor: 'text-green-800',
    mapIcon: <Trees className="w-[80%] h-[80%] text-green-200" />,
    topics: [
      { id: 'astronomy', title: 'Astronomy', icon: <Moon className="w-6 h-6" />, color: 'bg-indigo-100 text-indigo-700', description: 'Advanced calendars and star charts.', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800', x: 20, y: 20 },
      { id: 'temples', title: 'Chichen Itza', icon: <Pyramid className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'The great step pyramids.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800', x: 80, y: 40 },
      { id: 'jungle', title: 'Jungle Cities', icon: <Trees className="w-6 h-6" />, color: 'bg-green-100 text-green-700', description: 'Hidden cities in the rainforest.', image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&q=80&w=800', x: 50, y: 80 },
      { id: 'writing', title: 'Maya Glyphs', icon: <Scroll className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'The complex logosyllabic writing system.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800', x: 40, y: 50 },
      { id: 'ballgame', title: 'Pok-ta-pok', icon: <Gamepad2 className="w-6 h-6" />, color: 'bg-red-100 text-red-700', description: 'The ritual ball game played across Mesoamerica.', image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&q=80&w=800', x: 65, y: 15 }
    ],
    worldX: 20,
    worldY: 55
  },

  {
    id: 'persia',
    name: 'Ancient Persia',
    flag: '🇮🇷',
    gradient: 'bg-gradient-to-r from-teal-600 to-green-500',
    accent: 'text-teal-800',
    textColor: 'text-teal-800',
    mapIcon: <Flame className="w-[80%] h-[80%] text-teal-200" />,
    topics: [
      { id: 'persepolis', title: 'Persepolis', icon: <Castle className="w-6 h-6" />, color: 'bg-teal-100 text-teal-700', description: 'The ceremonial capital of the empire.', image: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?auto=format&fit=crop&q=80&w=800', x: 50, y: 30 },
      { id: 'gardens', title: 'Paradise Gardens', icon: <Trees className="w-6 h-6" />, color: 'bg-green-100 text-green-700', description: 'The origin of the word "paradise".', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800', x: 20, y: 60 },
      { id: 'silk', title: 'Silk Road', icon: <Anchor className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'The bridge between East and West.', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800', x: 80, y: 80 },
      { id: 'cyrus', title: 'Cyrus the Great', icon: <Crown className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'The founder of the Achaemenid Empire and his Cylinder of human rights.', image: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?auto=format&fit=crop&q=80&w=800', x: 35, y: 75 },
      { id: 'religion', title: 'Zoroastrianism', icon: <Flame className="w-6 h-6" />, color: 'bg-orange-100 text-orange-700', description: 'One of the world\'s oldest monotheistic religions.', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800', x: 70, y: 15 }
    ],
    worldX: 65,
    worldY: 45
  },
  {
    id: 'japan',
    name: 'Ancient Japan',
    flag: '🇯🇵',
    gradient: 'bg-gradient-to-r from-red-500 to-white',
    accent: 'text-red-700',
    textColor: 'text-red-700',
    mapIcon: <Sun className="w-[80%] h-[80%] text-red-100" />,
    topics: [
      { id: 'samurai', title: 'Samurai', icon: <Sword className="w-6 h-6" />, color: 'bg-slate-100 text-slate-700', description: 'The noble warriors and Bushido.', image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=800', x: 30, y: 40 },
      { id: 'shinto', title: 'Shinto Shrines', icon: <Sparkles className="w-6 h-6" />, color: 'bg-red-100 text-red-700', description: 'The spirits of nature and Torii gates.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', x: 70, y: 20 },
      { id: 'tea', title: 'Tea Ceremony', icon: <Music className="w-6 h-6" />, color: 'bg-green-100 text-green-700', description: 'The art of Zen and tea.', image: 'https://images.unsplash.com/photo-1544787210-282713df82ef?auto=format&fit=crop&q=80&w=800', x: 50, y: 80 }
    ],
    worldX: 90,
    worldY: 40
  },
  {
    id: 'ethiopia',
    name: 'Kingdom of Aksum',
    flag: '🇪🇹',
    gradient: 'bg-gradient-to-r from-green-600 to-red-600',
    accent: 'text-green-800',
    textColor: 'text-green-800',
    mapIcon: <Star className="w-[80%] h-[80%] text-green-200" />,
    topics: [
      { id: 'obelisks', title: 'Obelisks', icon: <Building2 className="w-6 h-6" />, color: 'bg-slate-100 text-slate-700', description: 'Towering stone monuments of Aksum.', image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800', x: 40, y: 20 },
      { id: 'trade', title: 'Red Sea Trade', icon: <Anchor className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700', description: 'A global trading powerhouse.', image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800', x: 60, y: 50 },
      { id: 'churches', title: 'Rock Churches', icon: <Castle className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'Lalibela\'s carved stone wonders.', image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800', x: 20, y: 80 },
      { id: 'script', title: 'Ge\'ez Script', icon: <Scroll className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'The ancient and sacred writing system of Ethiopia.', image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800', x: 75, y: 35 },
      { id: 'coinage', title: 'Aksumite Currency', icon: <Gem className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'One of the few ancient African civilizations to mint its own gold coins.', image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800', x: 15, y: 65 }
    ],
    worldX: 58,
    worldY: 60
  },
  {
    id: 'mali',
    name: 'Mali Empire',
    flag: '🇲🇱',
    gradient: 'bg-gradient-to-r from-yellow-500 to-green-600',
    accent: 'text-yellow-800',
    textColor: 'text-yellow-800',
    mapIcon: <Gem className="w-[80%] h-[80%] text-yellow-200" />,
    topics: [
      { id: 'mansa', title: 'Mansa Musa', icon: <Gem className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700', description: 'The richest man in history.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', x: 50, y: 20 },
      { id: 'timbuktu', title: 'Timbuktu', icon: <BookOpen className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'The legendary center of learning.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', x: 30, y: 60 },
      { id: 'gold_salt', title: 'Gold & Salt', icon: <RefreshCw className="w-6 h-6" />, color: 'bg-orange-100 text-orange-700', description: 'The trade that built an empire.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', x: 80, y: 80 }
    ],
    worldX: 45,
    worldY: 55
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    gradient: 'india-gradient',
    accent: 'text-india-blue',
    textColor: 'text-india-blue',
    mapIcon: <MapIcon className="w-[80%] h-[80%] text-india-green" />,
    topics: [
      { id: 'taj', title: 'Taj Mahal', icon: <Castle className="w-6 h-6" />, color: 'bg-white text-india-blue', description: 'The crown of palaces.', image: 'https://images.unsplash.com/photo-1564507592333-c60657ece523?auto=format&fit=crop&q=80&w=800', x: 50, y: 30 },
      { id: 'ganges', title: 'Holy Ganges', icon: <Waves className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700', description: 'The sacred river of India.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800', x: 70, y: 50 },
      { id: 'math', title: 'Ancient Math', icon: <Calculator className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700', description: 'The invention of zero and decimals.', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', x: 30, y: 70 }
    ],
    worldX: 75,
    worldY: 50
  }
];

// --- Components ---

const SkinSelection = ({ onSelect }: { onSelect: (skin: Skin) => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-earth-bg">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="w-20 h-20 india-gradient rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl">
        <User className="w-10 h-10" />
      </div>
      <h1 className="text-5xl font-serif font-bold mb-4">Choose Your Explorer</h1>
      <p className="text-xl text-gray-500 font-serif italic">Select a skin to begin your journey</p>
    </motion.div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl w-full">
      {SKINS.map((skin) => (
        <motion.button
          key={skin.id}
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sounds.playClick();
            onSelect(skin);
          }}
          className="group relative flex flex-col items-center p-8 rounded-[2.5rem] bg-white shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-india-saffron"
        >
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner", skin.color)}>
            {skin.icon}
          </div>
          <h3 className="text-xl font-bold">{skin.name}</h3>
          <div className="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="px-4 py-1 bg-india-saffron text-white text-xs font-bold rounded-full shadow-lg">Select</span>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

const BADGES: Badge[] = [
  { id: 'first_expedition', name: 'First Expedition', icon: '🚀', description: 'Complete your first country quiz!' },
  { id: 'scholar', name: 'Scholar', icon: '🎓', description: 'Score 100% on any quiz' },
  { id: 'world_traveler', name: 'World Traveler', icon: '🌍', description: 'Visit 3 different countries' },
  { id: 'master_explorer', name: 'Master Explorer', icon: '👑', description: 'Explore all topics in a single country' },
  { id: 'curious_mind', name: 'Curious Mind', icon: '💡', description: 'Ask the AI 5 questions' },
  { id: 'topic_expert', name: 'Topic Expert', icon: '📚', description: 'Explore 10 different topics' },
  { id: 'hard_mode_hero', name: 'Hard Mode Hero', icon: '⚔️', description: 'Complete a quiz on Hard difficulty' },
  { id: 'globetrotter', name: 'Globetrotter', icon: '🗺️', description: 'Visit all available countries' },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Explore the world after 8 PM' },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Start an expedition before 8 AM' },
];

const PlayerProfile = ({ 
  skin, 
  stats, 
  onBack,
  onReset,
  onChangeSkin
}: { 
  skin: Skin | null, 
  stats: PlayerStats, 
  onBack: () => void,
  onReset: () => void,
  onChangeSkin: () => void
}) => {
  const averageScore = stats.quizzesTaken > 0 
    ? Math.round((stats.totalQuizScore / (stats.quizzesTaken * 10)) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-earth-bg p-6 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => {
              sounds.playClick();
              onBack();
            }}
            className="flex items-center gap-2 text-gray-500 font-bold hover:text-india-blue transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" /> Back
          </button>
          <h1 className="text-4xl font-serif font-bold">Explorer Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl text-center border-4 border-white">
              <div className={cn("w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl shadow-inner", skin?.color || 'bg-gray-200')}>
                {skin?.icon || '👤'}
              </div>
              <h2 className="text-2xl font-bold mb-2">{skin?.name || 'New Explorer'}</h2>
              <p className="text-gray-500 italic mb-6">Rank: Junior Historian</p>
              <button 
                onClick={() => {
                  sounds.playClick();
                  onChangeSkin();
                }}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Change Skin
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-india-blue" /> Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Countries Visited</span>
                  <span className="font-bold">{stats.completedCountries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Quizzes Taken</span>
                  <span className="font-bold">{stats.quizzesTaken}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Avg. Quiz Score</span>
                  <span className="font-bold">{averageScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Topics Explored</span>
                  <span className="font-bold">{stats.exploredTopicsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Progress & Badges */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-white">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Award className="w-5 h-5 text-india-saffron" /> Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {BADGES.map(badge => {
                  const isUnlocked = stats.unlockedBadges?.includes(badge.id);
                  return (
                    <div 
                      key={badge.id}
                      className={cn(
                        "flex flex-col items-center text-center p-4 rounded-3xl transition-all",
                        isUnlocked ? "bg-amber-50 border-2 border-amber-200" : "bg-gray-50 border-2 border-transparent grayscale opacity-50"
                      )}
                    >
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-tight">{badge.description}</p>
                      {isUnlocked && (
                        <div className="mt-2 text-amber-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-india-green" /> Recent Expeditions
              </h3>
              {stats.completedCountries.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {stats.completedCountries.map(id => {
                    const country = COUNTRIES.find(c => c.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                        <span>{country?.flag}</span>
                        <span className="font-bold text-sm">{country?.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 italic text-center py-4">No expeditions completed yet. Start exploring!</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all your progress? This cannot be undone.")) {
                sounds.playIncorrect();
                onReset();
              }
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors text-sm font-bold opacity-50 hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Progress
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const WorldMap = ({ onSelect, completedCountries }: { onSelect: (country: Country) => void, completedCountries: string[] }) => {
  return (
    <div className="relative w-full aspect-[2/1] bg-blue-50/50 rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden group">
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Stylized Continents (Simplified SVG) */}
      <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none fill-india-green/30">
        <path d="M150,100 Q200,80 250,120 T350,150 Q400,200 380,300 T300,400 Q200,450 150,350 T100,200 Z" /> {/* Americas */}
        <path d="M450,100 Q550,80 650,120 T750,150 Q800,200 780,300 T700,400 Q600,450 550,350 T500,200 Z" /> {/* Eurasia/Africa */}
        <path d="M800,300 Q850,280 900,320 T950,350 Q980,400 930,450 T850,400 Z" /> {/* Oceania */}
      </svg>

      {/* Country Markers */}
      {COUNTRIES.map((country) => {
        const isCompleted = completedCountries?.includes(country.id);
        return (
          <motion.button
            key={country.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -5, 0] 
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              },
              scale: { duration: 0.5 },
              opacity: { duration: 0.5 }
            }}
            whileHover={{ scale: 1.2, zIndex: 10, y: -10 }}
            onClick={() => {
              sounds.playClick();
              onSelect(country);
            }}
            style={{ left: `${country.worldX}%`, top: `${country.worldY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/marker"
          >
            {/* Subtle Pulse Ring */}
            <motion.div 
              className={cn("absolute inset-0 rounded-full", isCompleted ? "bg-yellow-400/50" : "bg-white/50")}
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
            />
            
            <div className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white transition-all group-hover/marker:shadow-2xl",
              country.gradient,
              isCompleted && "ring-4 ring-yellow-400 ring-offset-2"
            )}>
              {country.flag}
              {isCompleted && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-0.5 shadow-md">
                  <Trophy className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-white px-3 py-1 rounded-full shadow-xl border border-gray-100 whitespace-nowrap flex items-center gap-2">
                <span className="text-sm font-bold">{country.name}</span>
                {isCompleted && <Trophy className="w-3 h-3 text-yellow-500" />}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

const CountrySelection = ({ onSelect, completedCountries }: { onSelect: (country: Country) => void, completedCountries: string[] }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-earth-bg overflow-y-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="w-16 h-16 india-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-xl">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-serif font-bold mb-2">The World is Yours to Explore</h1>
      <p className="text-lg text-gray-500 font-serif italic">Select a destination on the map to begin your expedition</p>
    </motion.div>

    <div className="max-w-6xl w-full space-y-12">
      <WorldMap onSelect={onSelect} completedCountries={completedCountries} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {COUNTRIES.map((country) => {
          const isCompleted = completedCountries?.includes(country.id);
          return (
            <motion.button
              key={country.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playClick();
                onSelect(country);
              }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all border",
                isCompleted ? "border-yellow-400 bg-yellow-50/30" : "border-gray-100"
              )}
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="text-left min-w-0">
                <h3 className="font-bold text-sm truncate">{country.name}</h3>
                {isCompleted && (
                  <div className="flex items-center gap-1 text-[8px] font-bold text-yellow-600 uppercase tracking-tighter">
                    <Trophy className="w-2 h-2" />
                    Completed
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  </div>
);

const Quiz = ({ onBack, exploredTopics, country, onComplete }: { onBack: () => void, exploredTopics: string[], country: Country, onComplete: (score: number, total: number, difficulty: string) => void }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [savedProgress, setSavedProgress] = useState<any>(null);

  // Load progress on mount
  useEffect(() => {
    const progress = localStorage.getItem('desh_pardesh_quiz_progress');
    if (progress) {
      try {
        const parsed = JSON.parse(progress);
        // Only resume if it's the same country
        if (parsed.countryId === country.id) {
          setSavedProgress(parsed);
        } else {
          // Progress for a different country - clear it to avoid confusion
          localStorage.removeItem('desh_pardesh_quiz_progress');
        }
      } catch (e) {
        console.error("Failed to load quiz progress", e);
      }
    }
  }, [country.id]);

  // Save progress on state change
  useEffect(() => {
    if (difficulty && questions.length > 0 && !finished) {
      const progress = {
        countryId: country.id,
        difficulty,
        questions,
        currentIndex,
        score,
        hintsRemaining
      };
      localStorage.setItem('desh_pardesh_quiz_progress', JSON.stringify(progress));
    }
  }, [country.id, difficulty, questions, currentIndex, score, hintsRemaining, finished]);

  useEffect(() => {
    if (!difficulty || questions.length > 0) return;
    
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const data = await generateQuiz(country.name, exploredTopics, difficulty);
        setQuestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [exploredTopics, country.name, difficulty, questions.length]);

  const handleResume = () => {
    if (savedProgress) {
      sounds.playTransition();
      setDifficulty(savedProgress.difficulty);
      setQuestions(savedProgress.questions);
      setCurrentIndex(savedProgress.currentIndex);
      setScore(savedProgress.score);
      setHintsRemaining(savedProgress.hintsRemaining);
      setSavedProgress(null);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }
    setShowExplanation(true);
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0 || selectedOption || eliminatedOptions.length > 0) return;
    
    sounds.playClick();
    setHintsRemaining(prev => prev - 1);
    
    // 50/50 logic: eliminate 2 incorrect options
    const incorrectOptions = questions[currentIndex].options.filter(
      opt => opt !== questions[currentIndex].correctAnswer
    );
    
    // Shuffle and pick 2
    const toEliminate = incorrectOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
      
    setEliminatedOptions(toEliminate);
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setEliminatedOptions([]);
    } else {
      setFinished(true);
      localStorage.removeItem('desh_pardesh_quiz_progress');
      onComplete(score, questions.length, difficulty || 'medium');
    }
  };

  if (!difficulty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-earth-bg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 india-gradient rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-serif font-bold mb-4">Select Difficulty</h1>
          <p className="text-xl text-gray-500 font-serif italic">How challenging should the expedition quiz be?</p>
        </motion.div>

        {savedProgress && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResume}
            className="mb-12 p-6 bg-india-blue text-white rounded-[2.5rem] shadow-xl flex items-center gap-6 hover:bg-blue-700 transition-all group max-w-xl w-full border-4 border-white"
          >
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
              <Play className="w-8 h-8 fill-current" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-xl mb-1">Resume Previous Expedition</h3>
              <p className="text-sm opacity-80">Question {savedProgress.currentIndex + 1} of {savedProgress.questions.length} • {savedProgress.difficulty} Mode</p>
            </div>
            <ChevronRight className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </motion.button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            { id: 'easy', name: 'Easy', icon: '🌱', color: 'bg-green-500', desc: '5 basic questions' },
            { id: 'medium', name: 'Medium', icon: '🌿', color: 'bg-blue-500', desc: '8 balanced questions' },
            { id: 'hard', name: 'Hard', icon: '🌲', color: 'bg-purple-500', desc: '10 challenging questions' }
          ].map((level) => (
            <motion.button
              key={level.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playTransition();
                setDifficulty(level.id as any);
              }}
              className="group relative flex flex-col items-center p-8 rounded-[2.5rem] bg-white shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-india-saffron"
            >
              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner", level.color)}>
                {level.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{level.name}</h3>
              <p className="text-sm text-gray-500">{level.desc}</p>
            </motion.button>
          ))}
        </div>
        
        <button 
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="mt-12 text-gray-500 font-bold hover:text-india-blue transition-colors"
        >
          Back to Map
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <RefreshCw className="w-16 h-16 text-india-saffron" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-serif font-bold mb-4"
        >
          Preparing Your Expedition...
        </motion.h2>
        <p className="text-gray-500 max-w-md mx-auto italic">
          Our historians are gathering the most challenging questions for your journey. This may take a moment for advanced difficulty levels.
        </p>
        
        <div className="mt-12 w-full max-w-xs h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-india-saffron"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!loading && questions.length === 0 && difficulty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">No questions found</h3>
        <p className="text-gray-500 mb-8 max-w-md">We couldn't generate a quiz for this country. Please try again or choose a different difficulty.</p>
        <button
          onClick={() => {
            sounds.playClick();
            setDifficulty(null);
          }}
          className="px-8 py-3 bg-india-saffron text-white rounded-full font-bold shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-12 px-6 glass-card rounded-3xl"
      >
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Expedition Complete!</h2>
        <p className="text-xl mb-8">You scored {score} out of {questions.length}</p>
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="w-full py-4 bg-india-saffron text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors"
        >
          Return to Map
        </button>
      </motion.div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-4 mt-1">
            <span className="px-3 py-0.5 bg-india-blue text-white rounded-full text-[10px] font-bold">
              Score: {score}
            </span>
            <div className="flex items-center gap-1 text-india-saffron">
              <Lightbulb className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Hints: {hintsRemaining}</span>
            </div>
          </div>
        </div>
        
        {!selectedOption && hintsRemaining > 0 && eliminatedOptions.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUseHint}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-india-saffron text-india-saffron rounded-full text-xs font-bold hover:bg-india-saffron hover:text-white transition-all shadow-sm"
          >
            <Lightbulb className="w-4 h-4" />
            Use 50/50 Hint
          </motion.button>
        )}
      </div>

      <h2 className="text-2xl font-serif font-bold mb-8 leading-tight">
        {current.question}
      </h2>

      <div className="space-y-4 mb-8">
        {current.options.map((option) => {
          const isEliminated = eliminatedOptions?.includes(option);
          return (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              disabled={!!selectedOption || isEliminated}
              className={cn(
                "w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 relative overflow-hidden",
                isEliminated ? "opacity-30 grayscale cursor-not-allowed border-gray-100" :
                selectedOption === option 
                  ? (option === current.correctAnswer ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700")
                  : (selectedOption && option === current.correctAnswer ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-gray-100 hover:border-india-saffron")
              )}
            >
              {option}
              {isEliminated && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                  <X className="w-8 h-8 text-red-400 opacity-50" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-blue-50 border border-blue-100 rounded-2xl mb-8"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-blue-800 leading-relaxed">
                {current.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOption && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            sounds.playClick();
            handleNext();
          }}
          className="w-full py-4 bg-india-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors"
        >
          {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

const ProgressModal = ({ 
  countries, 
  completedCountries, 
  currentCountry, 
  onClose 
}: { 
  countries: Country[], 
  completedCountries: string[], 
  currentCountry: Country, 
  onClose: () => void 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-ink/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[3rem] p-8 max-w-2xl w-full shadow-2xl border-8 border-india-blue/10 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-india-saffron via-white to-india-blue" />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-india-blue/10 rounded-2xl flex items-center justify-center text-india-blue">
              <BarChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">My Progress</h2>
              <p className="text-sm text-gray-500 italic">Your journey through history</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Current Country */}
          <div className="p-6 bg-india-blue/5 rounded-3xl border-2 border-india-blue/10">
            <h3 className="text-xs font-bold text-india-blue uppercase tracking-widest mb-4 flex items-center gap-2">
              <Compass className="w-3 h-3" /> Currently Exploring
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentCountry.flag}</span>
              <div>
                <h4 className="text-xl font-bold">{currentCountry.name}</h4>
                <p className="text-sm text-gray-500">Master the topics to unlock the next stage!</p>
              </div>
            </div>
          </div>

          {/* Progress List of Stages */}
          <div className="grid grid-cols-1 gap-3">
            {countries.map((country, index) => {
              const isCompleted = completedCountries?.includes(country.id);
              const isCurrent = country.id === currentCountry.id;
              const isLocked = !isCompleted && !isCurrent;

              return (
                <div 
                  key={country.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    isCompleted ? "bg-blue-50 border-blue-100" : 
                    isCurrent ? "bg-india-blue/5 border-india-blue/20 ring-2 ring-india-blue/10" :
                    "bg-gray-50 border-gray-100 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm text-lg font-bold text-gray-400">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className={cn("font-bold", isLocked ? "text-gray-400" : "text-gray-800")}>
                        Stage {index + 1}
                      </h5>
                      <p className="text-[10px] uppercase tracking-tighter font-bold opacity-60">
                        {isCompleted ? "Completed" : isCurrent ? "" : "Locked"}
                      </p>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 italic">
            "The more you know about the past, the better prepared you are for the future."
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BadgeModal = ({ badge, onClose }: { badge: Badge, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-ink/60 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.5, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.5, y: 100 }}
      className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border-8 border-amber-100"
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -10, 10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-8xl mb-8"
      >
        {badge.icon}
      </motion.div>
      <h2 className="text-3xl font-serif font-bold mb-2">Achievement Unlocked!</h2>
      <h3 className="text-xl font-bold text-amber-600 mb-4">{badge.name}</h3>
      <p className="text-gray-500 italic mb-8">{badge.description}</p>
      <button
        onClick={() => {
          sounds.playCorrect();
          onClose();
        }}
        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-colors"
      >
        Awesome!
      </button>
    </motion.div>
  </motion.div>
);

export default function App() {
  const [gameState, setGameState] = useState<'skin-selection' | 'country-selection' | 'playing' | 'quiz' | 'profile'>('skin-selection');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(() => {
    const saved = localStorage.getItem('desh_pardesh_skin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return SKINS.find(s => s.id === parsed.id) || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const defaultStats: PlayerStats = {
      completedCountries: [],
      totalQuizScore: 0,
      quizzesTaken: 0,
      unlockedBadges: [],
      exploredTopicsCount: 0,
      allExploredTopics: [],
    };
    const saved = localStorage.getItem('desh_pardesh_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStats,
          ...parsed,
          // Ensure arrays are actually arrays
          completedCountries: Array.isArray(parsed.completedCountries) ? parsed.completedCountries : defaultStats.completedCountries,
          unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : defaultStats.unlockedBadges,
          allExploredTopics: Array.isArray(parsed.allExploredTopics) ? parsed.allExploredTopics : defaultStats.allExploredTopics,
        };
      } catch (e) {
        console.error("Failed to parse saved stats", e);
      }
    }
    return defaultStats;
  });

  // Persist stats
  useEffect(() => {
    localStorage.setItem('desh_pardesh_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  // Persist skin and skip selection if already chosen
  useEffect(() => {
    if (selectedSkin) {
      localStorage.setItem('desh_pardesh_skin', JSON.stringify(selectedSkin));
      if (gameState === 'skin-selection') {
        setGameState('country-selection');
      }
    }
  }, [selectedSkin]);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [showProgress, setShowProgress] = useState(false);
  const [playerTrail, setPlayerTrail] = useState<{x: number, y: number, id: number}[]>([]);
  const [nearestTopic, setNearestTopic] = useState<Topic | null>(null);

  useEffect(() => {
    let minDistance = Infinity;
    let nearest = null;
    selectedCountry.topics.forEach(topic => {
      const dist = Math.sqrt(Math.pow(topic.x - playerPos.x, 2) + Math.pow(topic.y - playerPos.y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        nearest = topic;
      }
    });
    setNearestTopic(nearest);
  }, [playerPos, selectedCountry]);
  const trailIdCounter = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerTrail(prev => {
        const newTrail = [...prev, { ...playerPos, id: trailIdCounter.current++ }];
        if (newTrail.length > 20) return newTrail.slice(1);
        return newTrail;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playerPos]);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [lastNearbyTopicId, setLastNearbyTopicId] = useState<string | null>(null);
  const [exploredTopics, setExploredTopics] = useState<string[]>([]);
  const [fact, setFact] = useState<string | null>(null);
  const [loadingFact, setLoadingFact] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // --- Movement Logic ---
  const MOVE_SPEED = 2;
  
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (activeTopic || chatOpen || gameState !== 'playing') return;
    setPlayerPos(prev => ({
      x: Math.max(2, Math.min(98, prev.x + dx)),
      y: Math.max(2, Math.min(98, prev.y + dy))
    }));
    sounds.playStep();
  }, [activeTopic, chatOpen, gameState]);

  useKey('ArrowUp', () => movePlayer(0, -MOVE_SPEED), {}, [movePlayer]);
  useKey('ArrowDown', () => movePlayer(0, MOVE_SPEED), {}, [movePlayer]);
  useKey('ArrowLeft', () => movePlayer(-MOVE_SPEED, 0), {}, [movePlayer]);
  useKey('ArrowRight', () => movePlayer(MOVE_SPEED, 0), {}, [movePlayer]);
  useKey('w', () => movePlayer(0, -MOVE_SPEED), {}, [movePlayer]);
  useKey('s', () => movePlayer(0, MOVE_SPEED), {}, [movePlayer]);
  useKey('a', () => movePlayer(-MOVE_SPEED, 0), {}, [movePlayer]);
  useKey('d', () => movePlayer(MOVE_SPEED, 0), {}, [movePlayer]);

  // --- Collision Detection ---
  useEffect(() => {
    const nearbyTopic = selectedCountry.topics.find(topic => {
      const dist = Math.sqrt(Math.pow(topic.x - playerPos.x, 2) + Math.pow(topic.y - playerPos.y, 2));
      return dist < 12;
    });

    if (nearbyTopic) {
      if (nearbyTopic.id !== lastNearbyTopicId) {
        handleTopicInteraction(nearbyTopic);
        setLastNearbyTopicId(nearbyTopic.id);
      }
    } else {
      setLastNearbyTopicId(null);
    }
  }, [playerPos, lastNearbyTopicId, selectedCountry]);

  useEffect(() => {
    if (exploredTopics.length === selectedCountry.topics.length && selectedCountry.topics.length > 0) {
      setPlayerStats(prev => {
        if (!prev.unlockedBadges?.includes('master_explorer')) {
          return { ...prev, unlockedBadges: [...prev.unlockedBadges, 'master_explorer'] };
        }
        return prev;
      });
    }
  }, [exploredTopics, selectedCountry]);

  const handleTopicInteraction = async (topic: Topic) => {
    sounds.playInteraction();
    setActiveTopic(topic);
    setLoadingFact(true);
    setFact(null);
    
    // Add to explored topics if not already there
    setExploredTopics(prev => (prev || []).includes(topic.title) ? prev : [...(prev || []), topic.title]);
    
    const topicKey = `${selectedCountry.id}-${topic.id}`;
    setPlayerStats(prev => {
      if (prev.allExploredTopics?.includes(topicKey)) return prev;
      const newAllExplored = [...prev.allExploredTopics, topicKey];
      const newStats = { 
        ...prev, 
        allExploredTopics: newAllExplored,
        exploredTopicsCount: newAllExplored.length
      };
      
      // Check for topic_expert badge
      if (newAllExplored.length >= 10 && !newStats.unlockedBadges?.includes('topic_expert')) {
        newStats.unlockedBadges = [...newStats.unlockedBadges, 'topic_expert'];
        setUnlockedBadge(BADGES.find(b => b.id === 'topic_expert') || null);
        sounds.playInteraction();
      }
      
      return newStats;
    });

    try {
      const data = await getCountryFact(selectedCountry.name, topic.title);
      setFact(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFact(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sounds.playClick();
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    try {
      const aiMsg = await askCountryQuestion(selectedCountry.name, userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: aiMsg }]);
      
      // Check for curious mind badge
      setPlayerStats(prev => {
        const askCount = prev.unlockedBadges.filter(b => b === 'curious_mind_count').length + 1;
        const newBadges = [...prev.unlockedBadges];
        if (askCount >= 5 && !newBadges?.includes('curious_mind')) {
          newBadges.push('curious_mind');
          setUnlockedBadge(BADGES.find(b => b.id === 'curious_mind') || null);
          sounds.playInteraction();
        }
        // We use a dummy badge ID to count questions
        return { ...prev, unlockedBadges: [...newBadges, 'curious_mind_count'] };
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuizComplete = (score: number, total: number, difficulty: string) => {
    setPlayerStats(prev => {
      const newStats = { ...prev };
      newStats.totalQuizScore += score;
      newStats.quizzesTaken += 1;
      
      if (!newStats.completedCountries?.includes(selectedCountry.id)) {
        newStats.completedCountries.push(selectedCountry.id);
      }

      const newBadges = [...prev.unlockedBadges];
      let newlyUnlocked: Badge | null = null;
      
      const checkAndUnlock = (badgeId: string) => {
        if (!newBadges?.includes(badgeId)) {
          newBadges.push(badgeId);
          if (!newlyUnlocked) {
            newlyUnlocked = BADGES.find(b => b.id === badgeId) || null;
          }
        }
      };

      // 1. First Expedition
      checkAndUnlock('first_expedition');
      
      // 2. Scholar (Perfect score)
      if (score === total) {
        checkAndUnlock('scholar');
      } 
      
      // 3. World Traveler (3 countries)
      if (newStats.completedCountries.length >= 3) {
        checkAndUnlock('world_traveler');
      }

      // 4. Quiz Master (50 total points)
      if (newStats.totalQuizScore >= 50) {
        checkAndUnlock('quiz_master');
      }

      // 5. Hard Mode Hero
      if (difficulty === 'hard' && score >= total * 0.7) { // 70% or more on hard
        checkAndUnlock('hard_mode_hero');
      }

      // 6. Globetrotter (All countries)
      if (newStats.completedCountries.length >= 12) {
        checkAndUnlock('globetrotter');
      }

      // 7. Time-based badges
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 5) {
        checkAndUnlock('night_owl');
      }
      if (hour >= 5 && hour < 9) {
        checkAndUnlock('early_bird');
      }

      if (newlyUnlocked) {
        setUnlockedBadge(newlyUnlocked);
        sounds.playInteraction();
      }

      newStats.unlockedBadges = newBadges;
      return newStats;
    });
  };

  if (gameState === 'profile') {
    return (
      <PlayerProfile 
        skin={selectedSkin} 
        stats={playerStats} 
        onBack={() => setGameState('playing')} 
        onChangeSkin={() => setGameState('skin-selection')}
        onReset={() => {
          localStorage.removeItem('desh_pardesh_stats');
          localStorage.removeItem('desh_pardesh_skin');
          localStorage.removeItem('desh_pardesh_quiz_progress');
          setPlayerStats({
            completedCountries: [],
            totalQuizScore: 0,
            quizzesTaken: 0,
            unlockedBadges: [],
            exploredTopicsCount: 0,
            allExploredTopics: [],
          });
          setSelectedSkin(null);
          setGameState('skin-selection');
        }}
      />
    );
  }

  if (gameState === 'skin-selection') {
    return <SkinSelection onSelect={(skin) => {
      sounds.playTransition();
      setSelectedSkin(skin);
      setGameState('country-selection');
    }} />;
  }

  if (gameState === 'country-selection') {
    return <CountrySelection 
      completedCountries={playerStats.completedCountries}
      onSelect={(country) => {
        sounds.playTransition();
        setSelectedCountry(country);
        setExploredTopics([]);
        setPlayerPos({ x: 50, y: 50 });
        setGameState('playing');
      }} 
    />;
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-earth-bg texture-overlay">
      {/* --- Navigation --- */}
      <nav className="z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", selectedCountry.gradient)}>
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Desh Pardesh Explorer</h1>
            <p className={cn("text-[10px] uppercase tracking-widest font-bold opacity-70", selectedCountry.accent)}>Expedition: {selectedCountry.name}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              sounds.playTransition();
              setGameState('quiz');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-india-saffron/10 text-india-saffron font-bold text-sm hover:bg-india-saffron/20 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Quiz
          </button>
          <button 
            onClick={() => {
              sounds.playClick();
              setShowProgress(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-india-blue/10 text-india-blue font-bold text-sm hover:bg-india-blue/20 transition-colors"
          >
            <BarChart className="w-4 h-4" />
            My Progress
          </button>
          <button 
            onClick={() => {
              sounds.playTransition();
              setGameState('profile');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-india-blue/10 text-india-blue font-bold text-sm hover:bg-india-blue/20 transition-colors"
          >
            <UserCircle className="w-4 h-4" />
            Profile
          </button>
          <button 
            onClick={() => {
              sounds.playClick();
              setChatOpen(true);
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-india-blue" />
          </button>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {gameState === 'quiz' ? (
          <div className="h-full overflow-y-auto">
            <Quiz 
              onBack={() => setGameState('playing')} 
              exploredTopics={exploredTopics}
              country={selectedCountry}
              onComplete={(score, total, difficulty) => handleQuizComplete(score, total, difficulty)}
            />
          </div>
        ) : (
          <div 
            ref={gameContainerRef}
            className="w-full h-full relative bg-[#f4f1ea] overflow-hidden"
            style={{ 
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px),
                url('https://www.transparenttextures.com/patterns/paper-fibers.png')
              `, 
              backgroundSize: '100px 100px, 100px 100px, auto' 
            }}
          >
            {/* --- Decorative Elements --- */}
            <div className="absolute top-10 right-10 opacity-20 pointer-events-none rotate-12">
              <Compass className="w-32 h-32 text-earth-ink" />
            </div>
            
            <div className="absolute bottom-10 left-10 opacity-10 pointer-events-none -rotate-12">
              <MapIcon className="w-48 h-48 text-earth-ink" />
            </div>

            {/* --- Nautical Lines (Decorative) --- */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
              <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" />
              <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" />
              <circle cx="50%" cy="50%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" />
            </svg>

            {/* --- Map Background --- */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none flex items-center justify-center">
              <div className="scale-[3] transform-gpu">
                {selectedCountry.mapIcon}
              </div>
            </div>

            {/* --- Connection Beam --- */}
            {nearestTopic && (
              (() => {
                const dist = Math.sqrt(Math.pow(nearestTopic.x - playerPos.x, 2) + Math.pow(nearestTopic.y - playerPos.y, 2));
                if (dist < 15) {
                  return (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      <motion.line
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                          pathLength: 1, 
                          opacity: [0.1, 0.4, 0.1],
                          strokeDashoffset: [0, -20]
                        }}
                        transition={{ 
                          opacity: { duration: 2, repeat: Infinity },
                          strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                        }}
                        x1={`${playerPos.x}%`}
                        y1={`${playerPos.y}%`}
                        x2={`${nearestTopic.x}%`}
                        y2={`${nearestTopic.y}%`}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        className="text-india-saffron"
                      />
                    </svg>
                  );
                }
                return null;
              })()
            )}

            {/* --- Interaction Stations --- */}
              {selectedCountry.topics.map((topic) => {
                const isNearby = Math.sqrt(Math.pow(topic.x - playerPos.x, 2) + Math.pow(topic.y - playerPos.y, 2)) < 12;
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute flex flex-col items-center cursor-pointer group"
                    style={{ left: `${topic.x}%`, top: `${topic.y}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={() => handleTopicInteraction(topic)}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white transition-all duration-500 relative",
                      topic.color,
                      isNearby ? "scale-110 ring-8 ring-india-saffron/20 shadow-india-saffron/40" : "group-hover:scale-105 shadow-lg"
                    )}>
                      {topic.icon}
                      
                      {/* Pulse effect for nearby stations */}
                      {isNearby && (
                        <>
                          <motion.div 
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-2xl bg-current"
                          />
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-2 border-2 border-dashed border-india-saffron/30 rounded-3xl"
                          />
                          <div className="absolute -top-1 -right-1">
                            <motion.div
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Sparkles className="w-4 h-4 text-india-saffron fill-current" />
                            </motion.div>
                          </div>
                        </>
                      )}

                      {isNearby && !activeTopic && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-12 bg-india-saffron text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
                        >
                          CLICK TO EXPLORE
                        </motion.div>
                      )}
                    </div>
                    <span className="mt-2 px-3 py-1 bg-white/95 backdrop-blur rounded-full text-[11px] font-bold uppercase tracking-widest shadow-md text-gray-800 border border-gray-100">
                      {topic.title}
                    </span>
                  </motion.div>
                );
              })}

            {/* --- Ambient Particles --- */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 10 + Math.random() * 20, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%` 
                }}
              />
            ))}

            {/* --- Navigation Guide --- */}
            {nearestTopic && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-100">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", nearestTopic.color)}>
                  {nearestTopic.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Nearest Station</p>
                  <p className="text-sm font-bold text-gray-800">{nearestTopic.title}</p>
                </div>
                <div className="ml-4 flex items-center gap-1 text-india-blue font-bold text-xs">
                  <Move className="w-4 h-4 animate-bounce" />
                  <span>{Math.round(Math.sqrt(Math.pow(nearestTopic.x - playerPos.x, 2) + Math.pow(nearestTopic.y - playerPos.y, 2)))}m</span>
                </div>
              </div>
            )}

            {/* --- Player Trail --- */}
            {playerTrail.map((dot, index) => (
              <motion.div
                key={dot.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.2, scale: 1 }}
                className="absolute w-2 h-2 rounded-full bg-india-blue"
                style={{ 
                  left: `${dot.x}%`, 
                  top: `${dot.y}%`, 
                  transform: 'translate(-50%, -50%)',
                  opacity: (index / playerTrail.length) * 0.3
                }}
              />
            ))}

            {/* --- Player --- */}
            <motion.div
              animate={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="absolute z-20 flex flex-col items-center"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-2xl border-4 border-white", selectedSkin?.color)}>
                {selectedSkin?.icon}
              </div>
              <div className="mt-2 px-2 py-0.5 bg-india-blue text-white text-[8px] font-bold rounded-full uppercase">
                {selectedSkin?.name}
              </div>
            </motion.div>

            {/* --- Interaction Overlay --- */}
            <AnimatePresence>
              {activeTopic && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-earth-ink/40 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                  >
                    <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                      <img 
                        src={activeTopic.image} 
                        alt={activeTopic.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => {
                          sounds.playClick();
                          setActiveTopic(null);
                        }}
                        className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg md:hidden"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                      <div className="hidden md:flex justify-end mb-4">
                        <button 
                          onClick={() => {
                            sounds.playClick();
                            setActiveTopic(null);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={cn("p-3 rounded-2xl", activeTopic.color)}>
                          {activeTopic.icon}
                        </div>
                        <h3 className="text-3xl font-bold">{activeTopic.title}</h3>
                      </div>
                      
                      {loadingFact ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 bg-gray-100 rounded w-3/4" />
                          <div className="h-4 bg-gray-100 rounded w-full" />
                          <div className="h-4 bg-gray-100 rounded w-5/6" />
                          <div className="h-4 bg-gray-100 rounded w-2/3" />
                        </div>
                      ) : (
                        <div className="prose prose-stone max-w-none text-lg leading-relaxed text-gray-700 font-serif italic">
                          <ReactMarkdown>
                            {fact || "Discovering more about this topic..."}
                          </ReactMarkdown>
                        </div>
                      )}

                      <div className="mt-12 pt-8 border-t border-gray-100">
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Explore Further</p>
                        <button 
                          onClick={() => {
                            if (activeTopic) {
                              sounds.playTransition();
                              const title = activeTopic.title;
                              setActiveTopic(null);
                              setChatOpen(true);
                              setMessages([{ role: 'ai', text: `I'd love to tell you more about ${title} in ${selectedCountry.name}. What specific questions do you have?` }]);
                            }
                          }}
                          className="flex items-center gap-2 text-india-blue font-bold hover:gap-4 transition-all"
                        >
                          Ask AI about this <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- Country Completion / Next Country Button --- */}
            {exploredTopics.length === selectedCountry.topics.length && !activeTopic && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40"
              >
                <button 
                  onClick={() => {
                    sounds.playTransition();
                    setGameState('country-selection');
                  }}
                  className="px-8 py-4 bg-india-saffron text-white rounded-2xl font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
                >
                  <Trophy className="w-6 h-6" />
                  Expedition Complete! Next Country?
                </button>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* --- AI Chat Drawer --- */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                sounds.playClick();
                setChatOpen(false);
              }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[80] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", selectedCountry.gradient)}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedCountry.name} Guide</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">AI Assistant Active</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    sounds.playClick();
                    setChatOpen(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-serif italic">Ask me anything about {selectedCountry.name}'s culture, history, or food!</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-india-blue text-white rounded-tr-none" 
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    )}>
                      <div className="prose prose-sm prose-stone max-w-none">
                        <ReactMarkdown>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100">
                <div className="relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${selectedCountry.name}...`}
                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-india-blue transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 p-2 bg-india-blue text-white rounded-xl hover:bg-blue-900 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {unlockedBadge && (
          <BadgeModal 
            badge={unlockedBadge} 
            onClose={() => setUnlockedBadge(null)} 
          />
        )}
        {showProgress && (
          <ProgressModal 
            countries={COUNTRIES}
            completedCountries={playerStats.completedCountries}
            currentCountry={selectedCountry}
            onClose={() => setShowProgress(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

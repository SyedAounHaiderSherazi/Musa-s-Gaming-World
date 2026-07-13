/* Fun Zone Page - Jokes, facts, dice, coin flip, etc. */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playDice, playFlip, playSuccess, playPop } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "What do you call a bear with no teeth? A gummy bear! 🐻",
  "Why can't your nose be 12 inches long? Because then it would be a foot! 👃",
  "What did the ocean say to the beach? Nothing, it just waved! 🌊",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "What do you call a sleeping dinosaur? A dino-snore! 🦕",
  "Why did the student eat his homework? Because the teacher told him it was a piece of cake! 📚",
  "What do you call a dog that does magic tricks? A Labracadabrador! 🐕",
]

const FUN_FACTS = [
  "Octopuses have three hearts! 🐙",
  "Honey never spoils - archaeologists found 3000-year-old honey that was still edible! 🍯",
  "Bananas are berries, but strawberries aren't! 🍌",
  "A group of flamingos is called a 'flamboyance'! 🦩",
  "Cows have best friends and get stressed when separated! 🐄",
  "The inventor of the Pringles can is buried in one! 🥫",
  "A jiffy is an actual unit of time: 1/100th of a second! ⏰",
  "Wombat poop is cube-shaped! 🐻",
  "There are more possible chess games than atoms in the observable universe! ♟️",
  "Butterflies taste with their feet! 🦋",
]

const DAILY_CHALLENGES = [
  "Do 10 jumping jacks! 🏃",
  "Draw your favorite character in under 2 minutes! ✏️",
  "Name 5 animals that start with the letter 'S'! 🐾",
  "Try to balance on one foot for 30 seconds! 🦩",
  "Write a 3-line poem about gaming! 📝",
  "Make the funniest face you can! 😜",
  "List 10 things you're grateful for! 🙏",
  "Sing your favorite song for 30 seconds! 🎤",
  "Do a silly dance for 15 seconds! 💃",
  "Tell someone nearby a joke! 😂",
]

const MAGIC_8BALL_ANSWERS = [
  "Yes, absolutely! ✨", "No way! 🚫", "Maybe someday... 🤔",
  "Definitely! 🎯", "Ask again later! ⏳", "Without a doubt! 💯",
  "I wouldn't count on it 😅", "The stars say yes! ⭐", "Hmm, let me think... 🧐",
  "That's a great question! 🌟", "Not now, but soon! ⏰", "YES! Go for it! 🚀",
]

const EMOJIS = ['😎', '🤩', '🥳', '😱', '🤯', '💀', '🤡', '👻', '🎃', '🦄', '🐲', '🦋', '🌈', '⚡', '🔥', '💎', '🎪', '🎭']

const ANIMALS = [
  { name: 'Cheetah', emoji: '🐆', fact: 'Fastest land animal - 70 mph!' },
  { name: 'Dolphin', emoji: '🐬', fact: 'They sleep with one eye open!' },
  { name: 'Panda', emoji: '🐼', fact: 'They eat 40 pounds of bamboo daily!' },
  { name: 'Eagle', emoji: '🦅', fact: 'Can see fish from 2 miles up!' },
  { name: 'Octopus', emoji: '🐙', fact: 'Three hearts and blue blood!' },
  { name: 'Penguin', emoji: '🐧', fact: 'They propose with pebbles!' },
  { name: 'Koala', emoji: '🐨', fact: 'Sleep up to 22 hours a day!' },
  { name: 'Chameleon', emoji: '🦎', fact: 'Eyes move independently!' },
]

export default function FunZone() {
  const { addXP, addCoins } = useGame()
  const [joke, setJoke] = useState(JOKES[0])
  const [fact, setFact] = useState(FUN_FACTS[0])
  const [challenge] = useState(DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)])
  const [dice, setDice] = useState(1)
  const [coinResult, setCoinResult] = useState(null)
  const [magicAnswer, setMagicAnswer] = useState(null)
  const [emoji, setEmoji] = useState('😎')
  const [animal, setAnimal] = useState(ANIMALS[0])
  const [color, setColor] = useState('#00d4ff')
  const [spinning, setSpinning] = useState(false)

  const rollDice = () => {
    playDice()
    setSpinning(true)
    setTimeout(() => {
      setDice(Math.floor(Math.random() * 6) + 1)
      setSpinning(false)
      addXP(2)
      addCoins(1)
    }, 500)
  }

  const flipCoin = () => {
    playFlip()
    setCoinResult(null)
    setTimeout(() => {
      setCoinResult(Math.random() > 0.5 ? 'heads' : 'tails')
      addXP(2)
      addCoins(1)
    }, 800)
  }

  const shakeMagic8Ball = () => {
    playPop()
    setMagicAnswer(null)
    setTimeout(() => {
      setMagicAnswer(MAGIC_8BALL_ANSWERS[Math.floor(Math.random() * MAGIC_8BALL_ANSWERS.length)])
      addXP(3)
    }, 1000)
  }

  const generateRandomEmoji = () => {
    playPop()
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
    addXP(1)
  }

  const generateRandomAnimal = () => {
    playSuccess()
    setAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)])
    addXP(2)
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div className="text-6xl mb-4 inline-block" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
            🧩
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Fun Zone</span>
          </h1>
          <p className="text-white/60 text-lg">Interactive fun widgets and surprises!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Random Joke */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">😂 Random Joke</h3>
            <AnimatePresence mode="wait">
              <motion.p key={joke} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/70 text-sm mb-3 min-h-[60px]">
                {joke}
              </motion.p>
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setJoke(JOKES[Math.floor(Math.random() * JOKES.length)]); addXP(2) }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff00ff] to-[#ff0044] text-white font-bold text-sm border-none cursor-pointer">
              😂 New Joke
            </motion.button>
          </GlassPanel>

          {/* Fun Fact */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🤯 Fun Fact</h3>
            <AnimatePresence mode="wait">
              <motion.p key={fact} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/70 text-sm mb-3 min-h-[60px]">
                {fact}
              </motion.p>
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]); addXP(2) }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0088ff] text-white font-bold text-sm border-none cursor-pointer">
              🤯 New Fact
            </motion.button>
          </GlassPanel>

          {/* Daily Challenge */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🎯 Daily Challenge</h3>
            <p className="text-white/70 text-sm mb-3 min-h-[60px]">{challenge}</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[rgba(255,238,0,0.15)] text-[#ffee00] border border-[rgba(255,238,0,0.3)]">
              Complete for +10 XP!
            </span>
          </GlassPanel>

          {/* Dice Roller */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🎲 Dice Roller</h3>
            <motion.div className="text-7xl mb-3" animate={spinning ? { rotate: [0, 360], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }}>
              {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice - 1]}
            </motion.div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={rollDice}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8800] to-[#ff0044] text-white font-bold text-sm border-none cursor-pointer">
              🎲 Roll!
            </motion.button>
          </GlassPanel>

          {/* Coin Flip */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🪙 Coin Flip</h3>
            <AnimatePresence mode="wait">
              <motion.div key={coinResult || 'start'} initial={{ rotateY: 0 }} animate={{ rotateY: 360 }} transition={{ duration: 0.8 }}
                className="text-7xl mb-3 inline-block">
                {coinResult === null ? '🪙' : coinResult === 'heads' ? '👑' : '🦅'}
              </motion.div>
            </AnimatePresence>
            {coinResult && <p className="text-white/70 text-sm mb-2 capitalize">{coinResult}!</p>}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={flipCoin}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer">
              🪙 Flip!
            </motion.button>
          </GlassPanel>

          {/* Magic 8 Ball */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🔮 Magic 8 Ball</h3>
            <motion.div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-[#1a1a4e] to-[#0a0a2e] border-2 border-[#aa00ff] shadow-[0_0_20px_rgba(170,0,255,0.3)]"
              animate={magicAnswer ? { scale: [1, 1.1, 1] } : {}}>
              <span className="text-3xl">🎱</span>
            </motion.div>
            <AnimatePresence mode="wait">
              {magicAnswer && (
                <motion.p key={magicAnswer} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[#aa00ff] font-bold text-sm mb-3">{magicAnswer}</motion.p>
              )}
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={shakeMagic8Ball}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#aa00ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
              🔮 Ask!
            </motion.button>
          </GlassPanel>

          {/* Emoji Generator */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">😊 Emoji Generator</h3>
            <motion.div className="text-7xl mb-3" key={emoji} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              {emoji}
            </motion.div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateRandomEmoji}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer">
              🎲 Random Emoji
            </motion.button>
          </GlassPanel>

          {/* Color Picker */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🎨 Color Picker</h3>
            <div className="w-20 h-20 rounded-2xl mx-auto mb-3 border-2 border-white/20 shadow-lg" style={{ background: color }} />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border-none bg-transparent" />
            <p className="text-white/50 text-xs mt-2 font-mono">{color}</p>
          </GlassPanel>

          {/* Animal Generator */}
          <GlassPanel>
            <h3 className="text-lg font-bold text-white mb-3">🐾 Random Animal</h3>
            <motion.div className="text-6xl mb-2" key={animal.name} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              {animal.emoji}
            </motion.div>
            <p className="text-white font-bold text-sm">{animal.name}</p>
            <p className="text-white/50 text-xs">{animal.fact}</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateRandomAnimal}
              className="px-4 py-2 mt-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#ffee00] text-white font-bold text-sm border-none cursor-pointer">
              🐾 New Animal
            </motion.button>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}

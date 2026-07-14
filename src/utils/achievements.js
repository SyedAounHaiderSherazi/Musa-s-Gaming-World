/* Achievement definitions */
export const ACHIEVEMENTS = [
  // Classic achievements
  { id: 'first_visit', name: 'First Login', icon: '👋', description: 'Welcome to the game!', rarity: 'Common' },
  { id: 'first_game', name: 'Played First Game', icon: '🎮', description: 'Started your first mini-game', rarity: 'Common' },
  { id: 'played_5_games', name: 'Game Explorer', icon: '🎯', description: 'Played 5 different games', rarity: 'Rare' },
  { id: 'snake_champion', name: 'Snake Champion', icon: '🐍', description: 'Scored 20+ in Snake', rarity: 'Epic' },
  { id: 'click_master', name: 'Click Master', icon: '⚡', description: 'Got 80+ clicks in 10 seconds', rarity: 'Epic' },
  { id: 'memory_genius', name: 'Memory Genius', icon: '🧠', description: 'Completed Memory Game', rarity: 'Rare' },
  { id: 'lucky_spinner', name: 'Lucky Spinner', icon: '🎰', description: 'Spun the wheel 5 times', rarity: 'Rare' },
  { id: 'explorer', name: 'Explorer', icon: '🗺️', description: 'Visited all pages', rarity: 'Epic' },
  { id: 'coin_collector', name: 'Coin Collector', icon: '💰', description: 'Earned 500 coins total', rarity: 'Rare' },
  { id: 'drawing_artist', name: 'Drawing Artist', icon: '🎨', description: 'Saved your first drawing', rarity: 'Common' },
  { id: 'daily_streak_3', name: 'Dedicated Player', icon: '🔥', description: '3-day login streak', rarity: 'Rare' },
  { id: 'daily_streak_7', name: 'Weekly Warrior', icon: '⚔️', description: '7-day login streak', rarity: 'Legendary' },
  { id: 'level_5', name: 'Rising Star', icon: '⭐', description: 'Reached Level 5', rarity: 'Rare' },
  { id: 'level_10', name: 'Game Master', icon: '👑', description: 'Reached Level 10', rarity: 'Legendary' },
  { id: 'secret_room', name: 'Secret Finder', icon: '🔮', description: 'Discovered the secret room', rarity: 'Legendary' },
  { id: 'treasure_hunter', name: 'Treasure Hunter', icon: '💎', description: 'Found 3 treasure chests', rarity: 'Epic' },

  // Action game achievements
  { id: 'ninja_master', name: 'Ninja Master', icon: '🥷', description: 'Scored 50+ in Ninja Slash', rarity: 'Epic' },
  { id: 'zombie_slayer', name: 'Zombie Slayer', icon: '🧟', description: 'Survived 5 zombie waves', rarity: 'Rare' },
  { id: 'space_hero', name: 'Space Hero', icon: '🚀', description: 'Scored 30+ in Space Shooter', rarity: 'Rare' },
  { id: 'lightning_survivor', name: 'Lightning Survivor', icon: '⚡', description: 'Dodged lightning for 60 seconds', rarity: 'Epic' },

  // Adventure game achievements
  { id: 'maze_master', name: 'Maze Master', icon: '🏃', description: 'Escaped the maze', rarity: 'Rare' },
  { id: 'parkour_pro', name: 'Parkour Pro', icon: '🦘', description: 'Scored 300+ in Parkour', rarity: 'Epic' },
  { id: 'dungeon_clear', name: 'Dungeon Clear', icon: '🏰', description: 'Cleared the dungeon', rarity: 'Rare' },

  // Racing game achievements
  { id: 'speed_demon', name: 'Speed Demon', icon: '🏎️', description: 'Won a racing game', rarity: 'Rare' },

  // Puzzle game achievements
  { id: 'puzzle_master', name: 'Puzzle Master', icon: '🧩', description: 'Completed 3 puzzle games', rarity: 'Epic' },
  { id: 'match_3_king', name: 'Match-3 King', icon: '💎', description: 'Scored 500+ in Match-3', rarity: 'Rare' },

  // Arcade game achievements
  { id: 'arcade_legend', name: 'Arcade Legend', icon: '👾', description: 'Won 5 arcade games', rarity: 'Epic' },
  { id: 'brick_destroyer', name: 'Brick Destroyer', icon: '🧱', description: 'Cleared all bricks in Breakout', rarity: 'Rare' },

  // Fighting game achievements
  { id: 'first_fight', name: 'First Fight', icon: '🥊', description: 'Won your first fighting game', rarity: 'Common' },
  { id: 'combo_king', name: 'Combo King', icon: '🔥', description: 'Hit a 10+ combo', rarity: 'Epic' },
  { id: 'fighting_champion', name: 'Fighting Champion', icon: '🏆', description: 'Won all fighting games', rarity: 'Legendary' },
  { id: 'wizard_supreme', name: 'Wizard Supreme', icon: '🧙', description: 'Won Wizard Duel on Hard', rarity: 'Legendary' },

  // Social / Meet Musa
  { id: 'met_musa', name: 'Met Musa', icon: '😎', description: 'Visited the Meet Musa page', rarity: 'Common' },
  { id: 'music_lover', name: 'Music Lover', icon: '🎵', description: 'Listened to all tracks', rarity: 'Rare' },
]

export function getRarityColor(rarity) {
  switch (rarity) {
    case 'Common': return '#aaaaaa'
    case 'Rare': return '#0088ff'
    case 'Epic': return '#aa00ff'
    case 'Legendary': return '#ff8800'
    default: return '#ffffff'
  }
}

export function getRarityGlow(rarity) {
  switch (rarity) {
    case 'Common': return '0 0 10px rgba(170,170,170,0.3)'
    case 'Rare': return '0 0 20px rgba(0,136,255,0.5)'
    case 'Epic': return '0 0 25px rgba(170,0,255,0.5)'
    case 'Legendary': return '0 0 30px rgba(255,136,0,0.6)'
    default: return 'none'
  }
}

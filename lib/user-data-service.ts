/**
 * User data service for managing achievements, points, and user stats
 */

export interface WeatherStats {
  daysChecked: number;
  rainyDays: number;
  sunnyDays: number;
  windyDays: number;
  snowyDays: number;
  stormyDays: number;
  highestTemp: number;
  lowestTemp: number;
  lastLocation?: string;
  lastCheckTime?: string;
  streakStartDate?: string;
  citiesChecked: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  goal?: number;
}

export interface UserData {
  streak: number;
  points: number;
  tempUnit: 'C' | 'F';
  stats: WeatherStats;
  achievements: Achievement[];
  lastCheckDate?: string;
}

export const DEFAULT_USER_DATA: UserData = {
  streak: 0,
  points: 0,
  tempUnit: 'C',
  stats: {
    daysChecked: 0,
    rainyDays: 0,
    sunnyDays: 0,
    windyDays: 0,
    snowyDays: 0,
    stormyDays: 0,
    highestTemp: -100,
    lowestTemp: 200,
    citiesChecked: [],
  },
  achievements: [
    {
      id: 'streak-3',
      title: '3 Day Streak',
      description: 'Check the weather for 3 days in a row',
      unlocked: false,
      goal: 3,
      progress: 0,
    },
    {
      id: 'streak-7',
      title: 'Weather Watcher',
      description: 'Check the weather for 7 days in a row',
      unlocked: false,
      goal: 7,
      progress: 0,
    },
    {
      id: 'streak-30',
      title: 'Weather Enthusiast',
      description: 'Check the weather for 30 days in a row',
      unlocked: false,
      goal: 30,
      progress: 0,
    },
    {
      id: 'cities-3',
      title: 'City Explorer',
      description: 'Check the weather in 3 different cities',
      unlocked: false,
      goal: 3,
      progress: 0,
    },
    {
      id: 'cities-10',
      title: 'Globe Trotter',
      description: 'Check the weather in 10 different cities',
      unlocked: false,
      goal: 10,
      progress: 0,
    },
    {
      id: 'rainy-5',
      title: 'Rain Watcher',
      description: 'Check the weather on 5 rainy days',
      unlocked: false,
      goal: 5,
      progress: 0,
    },
    {
      id: 'sunny-10',
      title: 'Sun Seeker',
      description: 'Check the weather on 10 sunny days',
      unlocked: false,
      goal: 10,
      progress: 0,
    },
    {
      id: 'snowy-3',
      title: 'Snow Tracker',
      description: 'Check the weather on 3 snowy days',
      unlocked: false,
      goal: 3,
      progress: 0,
    },
    {
      id: 'points-100',
      title: 'Weather Novice',
      description: 'Earn 100 points',
      unlocked: false,
      goal: 100,
      progress: 0,
    },
    {
      id: 'points-500',
      title: 'Weather Expert',
      description: 'Earn 500 points',
      unlocked: false,
      goal: 500,
      progress: 0,
    },
  ],
};

/**
 * Get user data from localStorage
 * @returns UserData object from localStorage or default if not found
 */
export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return DEFAULT_USER_DATA;
  }
  
  try {
    const savedData = localStorage.getItem('weatherUserData');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
  }
  
  return DEFAULT_USER_DATA;
}

/**
 * Save user data to localStorage
 * @param userData UserData object to save
 */
export function saveUserData(userData: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('weatherUserData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

/**
 * Update user stats based on current weather data
 * @param userData Current user data
 * @param weatherCode Tomorrow.io weather code
 * @param location Current location name
 * @param temperature Current temperature
 * @returns Updated user data
 */
export function updateUserStats(
  userData: UserData, 
  weatherCode: number, 
  location: string, 
  temperature: number
): UserData {
  const updatedData = { ...userData };
  const today = new Date().toISOString().split('T')[0];
  
  if (updatedData.lastCheckDate !== today) {
    if (updatedData.lastCheckDate) {
      const lastCheck = new Date(updatedData.lastCheckDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCheck.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        updatedData.streak += 1;
        updatedData.points += 5; // Bonus points for streak
      } else {
        updatedData.streak = 1;
      }
    } else {
      updatedData.streak = 1;
    }
    
    updatedData.lastCheckDate = today;
    
    updatedData.stats.daysChecked += 1;
    updatedData.points += 2; // Points for checking weather
  }
  
  if (weatherCode >= 4000 && weatherCode < 5000) {
    updatedData.stats.rainyDays += 1;
  } else if (weatherCode === 1000 || weatherCode === 1100) {
    updatedData.stats.sunnyDays += 1;
  } else if (weatherCode >= 5000 && weatherCode < 6000) {
    updatedData.stats.snowyDays += 1;
  } else if (weatherCode >= 8000) {
    updatedData.stats.stormyDays += 1;
  }
  
  if (weatherCode >= 3000 && weatherCode < 4000) {
    updatedData.stats.windyDays += 1;
  }
  
  if (temperature > updatedData.stats.highestTemp) {
    updatedData.stats.highestTemp = temperature;
  }
  
  if (temperature < updatedData.stats.lowestTemp) {
    updatedData.stats.lowestTemp = temperature;
  }
  
  updatedData.stats.lastLocation = location;
  updatedData.stats.lastCheckTime = new Date().toLocaleTimeString();
  
  if (!updatedData.stats.citiesChecked.includes(location)) {
    updatedData.stats.citiesChecked.push(location);
  }
  
  updatedData.achievements = updateAchievements(updatedData);
  
  return updatedData;
}

/**
 * Update achievements based on user stats
 * @param userData Current user data
 * @returns Updated achievements array
 */
function updateAchievements(userData: UserData): Achievement[] {
  const achievements = [...userData.achievements];
  
  achievements.forEach(achievement => {
    switch (achievement.id) {
      case 'streak-3':
      case 'streak-7':
      case 'streak-30':
        achievement.progress = userData.streak;
        break;
      case 'cities-3':
      case 'cities-10':
        achievement.progress = userData.stats.citiesChecked.length;
        break;
      case 'rainy-5':
        achievement.progress = userData.stats.rainyDays;
        break;
      case 'sunny-10':
        achievement.progress = userData.stats.sunnyDays;
        break;
      case 'snowy-3':
        achievement.progress = userData.stats.snowyDays;
        break;
      case 'points-100':
      case 'points-500':
        achievement.progress = userData.points;
        break;
    }
    
    if (!achievement.unlocked && achievement.progress! >= achievement.goal!) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      userData.points += 20; // Bonus points for unlocking achievement
    }
  });
  
  return achievements;
}

/**
 * Check if any new achievements were unlocked
 * @param oldData Previous user data
 * @param newData Updated user data
 * @returns Array of newly unlocked achievements
 */
export function getNewlyUnlockedAchievements(oldData: UserData, newData: UserData): Achievement[] {
  return newData.achievements.filter(newAchievement => {
    const oldAchievement = oldData.achievements.find(a => a.id === newAchievement.id);
    return newAchievement.unlocked && oldAchievement && !oldAchievement.unlocked;
  });
}

export interface UserData {
  points: number;
  lastLogin: number;
  streak: number;
}

export interface LoyaltyProgramContract {
  claimDailyPoints: () => Promise<void>;
  getPoints: (address: string) => Promise<number>;
  getStreak: (address: string) => Promise<number>;
  getUserData: (address: string) => Promise<UserData>;
}

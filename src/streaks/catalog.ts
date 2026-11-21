/** Streak badges are independent from the achievement catalog and do not award themselves. */
export const STREAK_BADGES = [
  { id: 'STREAK_3', name: 'First Spark', days: 3 },
  { id: 'STREAK_7', name: 'Week of Learning', days: 7 },
  { id: 'STREAK_14', name: 'Two-Week Champion', days: 14 },
  { id: 'STREAK_30', name: 'Monthly Dedication', days: 30 },
  { id: 'STREAK_60', name: 'Consistency Champion', days: 60 },
  { id: 'STREAK_100', name: 'Century of Learning', days: 100 },
] as const;

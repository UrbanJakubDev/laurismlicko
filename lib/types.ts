export type Baby = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  birthday: Date;
  measurements: BabyMeasurement[];
  feeds: Feed[];
  poops: Poop[];
}

export type BabyMeasurement = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  babyId: number;
  baby: Baby;
  weight: number;        // in grams
  height: number;        // in cm
  dailyMilkAmount: number;  // calculated from weight
  feedsPerDay: number;
  averageFeedAmount: number; // dailyMilkAmount / feedsPerDay
}

export type Feed = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  babyId: number;
  baby: Baby;
  feedTime: Date;
  amount: number;        // in ml
  type: 'main' | 'additional';  // type of feed
}

export type Poop = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  babyId: number;
  baby: Baby;
  poopTime: Date;
  color: string;
  consistency: string;
  amount: number;        // in grams
}
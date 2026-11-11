export type Plant = {
  id: string;
  name: string;
  latinName: string;
  family: string;
  category: string;
  description: string;
  difficulty: string;
  light: string;
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  wateringIntervalDays: number;
  feedingIntervalDays: number;
  repotting: string;
  image: string;
};

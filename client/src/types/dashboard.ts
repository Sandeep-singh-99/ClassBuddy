export interface SalaryRange {
  role: string;
  min: number;
  max: number;
  median: number;
  location: string;
}

export interface Owner {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher" | string;
  industry: string;
  image_url: string;
}

export interface StudentInsight {
  salary_range: SalaryRange[];
  growth_rate: number;
  demand_level: "High" | "Medium" | "Low";
  top_skills: string[];
  market_outlook: "Positive" | "Neutral" | "Negative";
  key_trends: string[];
  recommend_skills: string[];
  id: string;
  created_at: string;
  updated_at: string;
  owner: Owner;
}

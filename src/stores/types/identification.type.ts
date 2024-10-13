import type { User } from "./User";

export interface Identification {
    name: string;
    studentId: string;
    imageUrl: string;
    score: number;
    user: User;
  }
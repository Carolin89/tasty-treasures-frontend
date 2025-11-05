export enum Difficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard'
}

export interface Recipe {
    id?: number;
    title: string;
    description: string;
    category: string;
    servings: number;
    prepTimeMinutes: number;
    cookTimeMinutes:number;
    difficulty: Difficulty;
    ingredients: string[];
    imageUrl: string;
}

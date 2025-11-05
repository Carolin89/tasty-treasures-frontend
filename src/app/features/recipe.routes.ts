import { Routes } from '@angular/router';
import { RecipeList } from './recipe-list/recipe-list';
import { RecipeDetail } from './recipe-detail/recipe-detail';
import { RecipeForm } from './recipe-form/recipe-form';

export const RECIPE_ROUTES: Routes = [
    { path: '', component: RecipeList },
    { path: 'new', component: RecipeForm },
    { path: ':id', component: RecipeDetail },
    { path: ':id/edit', component: RecipeForm }
];
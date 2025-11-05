import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '',
    redirectTo: 'recipes',
    pathMatch: 'full'
},
{
    path: 'recipes',
    loadChildren: () =>
        import('./features/recipe.routes').then(m => m.RECIPE_ROUTES)
},
{
path: 'recipes/:id/edit',
  loadComponent: () =>
    import('./features/recipe-form/recipe-form').then(m => m.RecipeForm)
}
];

import { Component,inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipeService } from '../../core/services/recipe.service';
import { Recipe } from '../../core/models/recipe.model';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-recipe-detail',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIcon,
    MatSnackBarModule

  ],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css',
})
export class RecipeDetail {
  recipe = signal<Recipe | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  private snackBar = inject(MatSnackBar);
   private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) this.loadRecipe(id);
    });
  }

  private loadRecipe(id: number) {
    this.isLoading.set(true);
    this.recipeService.getById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Could not load recipe.');
        this.isLoading.set(false);
      },
    });
  }

    onDelete() {
    const current = this.recipe();
    if (!current?.id) return;

    if (!confirm(`Are you sure you want to delete "${current.title}"?`)) return;

    this.recipeService.delete(current.id).subscribe({
      next: () => {
        this.snackBar.open('Recipe deleted successfully!', 'OK', { duration: 3000 });
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.snackBar.open('Failed to delete recipe. Please try again.', 'Dismiss', {
          duration: 4000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

}

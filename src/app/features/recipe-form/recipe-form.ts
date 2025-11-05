import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { RecipeService } from '../../core/services/recipe.service';
import { Recipe, Difficulty } from '../../core/models/recipe.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinner,
    MatSnackBarModule
  ],
  templateUrl: './recipe-form.html',
  styleUrls: ['./recipe-form.css'],
})
export class RecipeForm {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  
  isEditMode = signal(false);
  isSubmitting = signal(false);
  recipeId: number | null = null;


  difficulties = Object.values(Difficulty);

  snackBar = inject(MatSnackBar);
  
  form = this.fb.group({
  title: ['', Validators.required],
  description: ['', Validators.required],
  category: ['', Validators.required],
  servings: [1, [Validators.required, Validators.min(1)]],
  cookTimeMinutes: [0, Validators.min(0)],
  prepTimeMinutes: [0, Validators.min(0)],
  difficulty: [Difficulty.EASY, Validators.required],
  ingredients: this.fb.array<string>([]),
  imageUrl: [
    '',
     Validators.pattern(/\.(jpg|jpeg|png|webp|gif)$/i),
  ],
});
  get ingredients(): FormArray<FormControl<string>> {
    return this.form.get('ingredients') as FormArray<FormControl<string>>;
  }

  previewUrl: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.recipeId = +id;
        this.loadRecipe(+id);
      } else {
        if (this.ingredients.length === 0) {
          this.addIngredient();
        }
      }
        this.form.get('imageUrl')?.valueChanges.subscribe((url) => {
      this.previewUrl = url?.startsWith('http') ? url : null;
    });
    });
  }

  private loadRecipe(id: number) {
    this.recipeService.getById(id).subscribe((recipe) => {
      this.form.patchValue({
        ...recipe,
        difficulty: recipe.difficulty ?? Difficulty.EASY,
      });
      this.ingredients.clear();
     recipe.ingredients?.forEach((i) =>
  this.ingredients.push(this.fb.nonNullable.control(i ?? ''))
);
    });
  }

  addIngredient() {
  this.ingredients.push(this.fb.nonNullable.control(''));
}

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  onSubmit() {
    
    if (this.form.invalid) { 
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();

    const recipe: Recipe = {
      id: this.recipeId ?? undefined,
      title: raw.title ?? '',
      description: raw.description ?? '',
      category: raw.category ?? '',
      servings: raw.servings ?? 1,
      cookTimeMinutes: raw.cookTimeMinutes ?? 0,
      prepTimeMinutes: raw.prepTimeMinutes ?? 0,
      difficulty: raw.difficulty ?? Difficulty.EASY,
      ingredients: (raw.ingredients ?? []).filter(
        (i): i is string => !!i && i.trim() !== ''
      ),
      imageUrl: raw.imageUrl ?? '',
    };

    const request$ = this.isEditMode()
      ? this.recipeService.update(this.recipeId!, recipe)
      : this.recipeService.create(recipe);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset();
         this.snackBar.open(
        this.isEditMode() ? 'Recipe updated successfully!' : 'Recipe created successfully!',
        'OK',
        { duration: 3000 }
      );
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.isSubmitting.set(false);
          this.snackBar.open('Failed to save recipe. Please try again.', 'Dismiss', {
        duration: 4000,
        panelClass: ['snackbar-error'],
      });
      },
    });
  }

  onCancel() {
  this.form.reset();
  this.router.navigate(['/recipes']);
}
}

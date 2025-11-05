import {
  Component,
  OnInit,
  effect,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Recipe } from '../../core/models/recipe.model';
import { RecipeService } from '../../core/services/recipe.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './recipe-list.html',
  styleUrls: ['./recipe-list.css'],
})
export class RecipeList implements OnInit {
  
  recipes = signal<Recipe[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');

  filteredRecipes = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    const all = this.recipes();

    return all.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search) ||
        (r.description?.toLowerCase().includes(search) ?? false);
      const matchesCategory = !category || r.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  hasRecipes = computed(() => this.filteredRecipes().length > 0);

  categories = signal<string[]>([]);

  constructor(private recipeService: RecipeService) {
    effect(() => {
      this.loadRecipes();
    });
  }

  ngOnInit(): void {}

  private loadRecipes() {
    this.isLoading.set(true);
    this.recipeService.getAll().subscribe({
      next: (data) => {
        this.recipes.set(data);

        //Fill categories dynamically
        const uniqueCats = Array.from(
          new Set(data.map((r) => r.category).filter(Boolean))
        );
        this.categories.set(uniqueCats);

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Could not load recipes.');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  onCategoryChange(value: string) {
    this.selectedCategory.set(value);
  }
}

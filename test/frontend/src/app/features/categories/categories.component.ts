import { Component, OnInit, signal } from '@angular/core';
import { CategoryStore } from '../../stores/category.store';
import { CategoriesService } from './services/categories.service';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'ww-categories',
  standalone: true,
  imports: [CategoryListComponent, CategoryFormComponent],
  template: `
    <div class="categories-page">
      <div class="categories-page__header">
        <h1>Categories</h1>
        <div class="categories-page__header-actions">
          <button class="ww-btn categories-page__reset-btn" (click)="resetToDefaults()"
                  [disabled]="isResetting()">
            {{ isResetting() ? 'Resetting...' : 'Reset to Default' }}
          </button>
          <button class="ww-btn ww-btn-primary" (click)="showForm = !showForm">
            {{ showForm ? 'Cancel' : '+ Add Category' }}
          </button>
        </div>
      </div>

      @if (showForm) {
        <ww-category-form (save)="onSave($event)" (cancel)="showForm = false" />
      }

      <div class="categories-page__tabs">
        <button class="ww-btn" [class.ww-btn-primary]="activeTab === 'expense'"
                (click)="activeTab = 'expense'">Expenses</button>
        <button class="ww-btn" [class.ww-btn-primary]="activeTab === 'income'"
                (click)="activeTab = 'income'">Income</button>
      </div>

      <ww-category-list [categories]="activeTab === 'income'
        ? CategoryStore.incomeCategories()
        : CategoryStore.expenseCategories()" />
    </div>
  `,
  styles: [`
    .categories-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .categories-page__header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    @media (max-width: 480px) {
      .categories-page__reset-btn {
        font-size: 0.6875rem;
        padding: 0.25rem 0.5rem;
      }
    }
    .categories-page__reset-btn {
      font-size: 0.8125rem;
      border: 1px solid var(--ww-border);
      color: var(--ww-text-main);
    }
    .categories-page__reset-btn:hover:not(:disabled) {
      border-color: var(--ww-blue);
      color: var(--ww-blue);
    }
    .categories-page__reset-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .categories-page__tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
  `],
})
export class CategoriesComponent implements OnInit {
  CategoryStore = CategoryStore;
  showForm = false;
  activeTab: 'income' | 'expense' = 'expense';
  isResetting = signal(false);

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    CategoryStore.setLoading(true);
    this.categoriesService.list().subscribe({
      next: (data) => CategoryStore.setCategories(data),
      error: () => CategoryStore.setError('Failed to load categories'),
    });
  }

  onSave(dto: any): void {
    this.categoriesService.create(dto).subscribe({
      next: (category) => {
        CategoryStore.addCategory(category);
        this.showForm = false;
      },
      error: () => CategoryStore.setError('Failed to create category'),
    });
  }

  resetToDefaults(): void {
    if (!confirm('Reset all categories to defaults? Custom categories will be deleted.')) return;
    this.isResetting.set(true);
    this.categoriesService.resetToDefaults().subscribe({
      next: (data) => {
        CategoryStore.setCategories(data);
        this.isResetting.set(false);
        this.showForm = false;
      },
      error: () => {
        CategoryStore.setError('Failed to reset categories');
        this.isResetting.set(false);
      },
    });
  }
}
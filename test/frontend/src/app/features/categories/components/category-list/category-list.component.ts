import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Category } from '../../../../shared/models/category.model';
import { CategoriesService } from '../../services/categories.service';
import { CategoryStore } from '../../../../stores/category.store';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'ww-category-list',
  standalone: true,
  imports: [CategoryFormComponent],
  template: `
    <div class="category-list">
      @for (cat of categories; track cat.id) {
        <div class="category-list__item ww-card">
          <div class="category-list__info">
            <span class="category-list__color" [style.backgroundColor]="cat.color || '#795548'"></span>
            <span class="category-list__name">{{ cat.name }}</span>
            @if (cat.is_default) {
              <span class="category-list__default">Default</span>
            }
          </div>
          <div class="category-list__actions">
            <button class="category-list__btn category-list__btn--edit"
                    (click)="startEdit(cat)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="category-list__btn category-list__btn--delete"
                    (click)="onDelete(cat.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        @if (editingId() === cat.id) {
          <div class="category-list__edit">
            <ww-category-form
              [category]="cat"
              (update)="onUpdate($event)"
              (cancel)="cancelEdit()" />
          </div>
        }
      }

      @if (categories.length === 0) {
        <p class="ww-text-muted">No categories in this group</p>
      }
    </div>
  `,
  styles: [`
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .category-list__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
    }
    .category-list__info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .category-list__color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }
    .category-list__name {
      font-weight: 500;
    }
    .category-list__default {
      font-size: 0.625rem;
      background-color: var(--ww-bg-page);
      color: var(--ww-text-main);
      padding: 0.125rem 0.375rem;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .category-list__actions {
      display: flex;
      gap: 0.25rem;
    }
    .category-list__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 1px solid var(--ww-border);
      border-radius: var(--ww-radius);
      background: transparent;
      color: var(--ww-text-main);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }
    .category-list__btn--edit:hover {
      border-color: var(--ww-blue);
      color: var(--ww-blue);
    }
    .category-list__btn--delete:hover {
      border-color: var(--ww-red);
      color: var(--ww-red);
    }
    .category-list__edit {
      margin-top: -0.25rem;
      margin-bottom: 0.25rem;
    }
  `],
})
export class CategoryListComponent {
  @Input() categories: Category[] = [];

  editingId = signal<string | null>(null);

  constructor(private categoriesService: CategoriesService) {}

  startEdit(cat: Category): void {
    this.editingId.set(cat.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  onDelete(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.categoriesService.delete(id).subscribe({
      next: () => CategoryStore.removeCategory(id),
      error: () => CategoryStore.setError('Failed to delete category'),
    });
  }

  onUpdate(event: { id: string; dto: any }): void {
    this.categoriesService.update(event.id, event.dto).subscribe({
      next: (updated) => {
        CategoryStore.updateCategory(event.id, updated);
        this.editingId.set(null);
      },
      error: () => CategoryStore.setError('Failed to update category'),
    });
  }
}
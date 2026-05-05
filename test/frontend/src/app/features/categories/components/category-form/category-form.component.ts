import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateCategoryDTO, UpdateCategoryDTO, Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'ww-category-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="ww-card category-form">
      <h3>{{ category ? 'Edit Category' : 'New Category' }}</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="category-form__fields">
        <div class="category-form__field">
          <label class="ww-label">Name</label>
          <input class="ww-input" type="text" formControlName="name" placeholder="e.g. Dining Out" />
        </div>

        <div class="category-form__field">
          <label class="ww-label">Type</label>
          <select class="ww-input" formControlName="type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div class="category-form__field">
          <label class="ww-label">Color</label>
          <input class="ww-input" type="color" formControlName="color" />
        </div>

        <div class="category-form__actions">
          <button class="ww-btn ww-btn-primary" type="submit" [disabled]="form.invalid">
            {{ category ? 'Update' : 'Save' }}
          </button>
          <button class="ww-btn" type="button" (click)="cancel.emit()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .category-form h3 {
      margin-bottom: 1rem;
    }
    .category-form__fields {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .category-form__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .category-form__actions {
      display: flex;
      gap: 0.5rem;
    }
  `],
})
export class CategoryFormComponent implements OnChanges {
  @Input() category: Category | null = null;
  @Output() save = new EventEmitter<CreateCategoryDTO>();
  @Output() update = new EventEmitter<{ id: string; dto: UpdateCategoryDTO }>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['expense', Validators.required],
      color: ['#795548'],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.category) {
      this.form.patchValue({
        name: this.category.name,
        type: this.category.type,
        color: this.category.color || '#795548',
      });
    } else if (changes['category'] && !this.category) {
      this.form.reset({ name: '', type: 'expense', color: '#795548' });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.category) {
      this.update.emit({ id: this.category.id, dto: this.form.value });
    } else {
      this.save.emit(this.form.value);
    }
  }
}
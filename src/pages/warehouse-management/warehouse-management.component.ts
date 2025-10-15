import { Component, ChangeDetectionStrategy, signal, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { inject } from '@angular/core';
import { DataService, WarehouseItem, TransactionType, WarehouseTransaction } from '../../services/data.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-warehouse-management',
  templateUrl: './warehouse-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class WarehouseManagementComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private dataService = inject(DataService);

  // Inputs
  mode = input<'admin' | 'teacher'>('admin');

  // State
  items = this.dataService.getWarehouseItems();
  transactions = this.dataService.getWarehouseTransactions();
  activeTab = signal<'inventory' | 'transactions'>('inventory');
  isItemModalOpen = signal(false);
  isTransactionModalOpen = signal(false);
  editingItem = signal<WarehouseItem | null>(null);
  
  // --- Inventory State ---
  searchTerm = signal('');
  inventorySortColumn = signal<'name' | 'category' | 'quantity' | 'price' | 'status'>('name');
  inventorySortDirection = signal<'asc' | 'desc'>('asc');
  inventoryCategoryFilter = signal<string>('all');
  inventoryCurrentPage = signal(1);
  inventoryItemsPerPage = signal(8);


  // --- Transaction State ---
  transactionSortColumn = signal<'id' | 'type' | 'date' | 'user' | 'status'>('date');
  transactionSortDirection = signal<'desc' | 'asc'>('desc');
  transactionStatusFilter = signal<string>('all');
  transactionCurrentPage = signal(1);
  transactionItemsPerPage = signal(8);
  
  itemForm = this.fb.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    category: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  transactionForm = this.fb.group({
    type: ['Import' as TransactionType, Validators.required],
    items: this.fb.array([], [Validators.required, Validators.minLength(1)])
  });

  // --- Derived State ---

  // Filter options
  itemCategories = computed(() => {
    const categories = new Set(this.items().map(item => item.category));
    return ['all', ...Array.from(categories).sort()];
  });
  transactionStatuses = signal(['all', 'Pending', 'Approved', 'Rejected']);

  // Filtered and Sorted Data (pre-pagination)
  private filteredAndSortedItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.inventoryCategoryFilter();
    const sortColumn = this.inventorySortColumn();
    const sortDirection = this.inventorySortDirection();

    let filtered = this.items().filter(item => {
        const searchTermMatch = term === '' ||
            item.name.toLowerCase().includes(term) ||
            item.sku.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term);
        
        const categoryMatch = category === 'all' || item.category === category;

        return searchTermMatch && categoryMatch;
    });

    return filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortColumn === 'status') {
            aValue = this.getItemStatus()(a).text;
            bValue = this.getItemStatus()(b).text;
        } else {
            aValue = a[sortColumn];
            bValue = b[sortColumn];
        }
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
    });
  });

  private filteredAndSortedTransactions = computed(() => {
    const status = this.transactionStatusFilter();
    const sortColumn = this.transactionSortColumn();
    const sortDirection = this.transactionSortDirection();

    let filtered = this.transactions().filter(t => status === 'all' || t.status === status);

    return filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
    });
  });
  
  // Paginated Data for Display
  inventoryTotalPages = computed(() => Math.ceil(this.filteredAndSortedItems().length / this.inventoryItemsPerPage()));
  displayItems = computed(() => {
    const items = this.filteredAndSortedItems();
    const page = this.inventoryCurrentPage();
    const perPage = this.inventoryItemsPerPage();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return items.slice(start, end);
  });

  transactionTotalPages = computed(() => Math.ceil(this.filteredAndSortedTransactions().length / this.transactionItemsPerPage()));
  displayTransactions = computed(() => {
    const transactions = this.filteredAndSortedTransactions();
    const page = this.transactionCurrentPage();
    const perPage = this.transactionItemsPerPage();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return transactions.slice(start, end);
  });

  totalValue = computed(() => this.items().reduce((acc, item) => acc + item.quantity * item.price, 0));
  totalItems = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
  lowStockItemsCount = computed(() => this.items().filter(item => item.quantity > 0 && item.quantity <= 10).length);

  getItemStatus = computed(() => (item: WarehouseItem) => {
    if (item.quantity === 0) return { text: 'Out of Stock', color: 'red' };
    if (item.quantity <= 10) return { text: 'Low Stock', color: 'yellow' };
    return { text: 'In Stock', color: 'green' };
  });

  transactionChartData = computed(() => {
    const monthlyData: { [key: string]: { import: number, export: number } } = {};
    
    this.transactions().forEach(t => {
      if (t.status !== 'Approved') return;

      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { import: 0, export: 0 };
      }
      const totalQuantity = t.items.reduce((sum, item) => sum + item.quantity, 0);
      if (t.type === 'Import') {
        monthlyData[month].import += totalQuantity;
      } else {
        monthlyData[month].export += totalQuantity;
      }
    });

    const sortedKeys = Object.keys(monthlyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const labels = sortedKeys.map(key => key.split(' ')[0]);
    const importData = sortedKeys.map(key => monthlyData[key].import);
    const exportData = sortedKeys.map(key => monthlyData[key].export);
    
    const maxVal = Math.max(...importData, ...exportData, 0);
    
    return {
      labels,
      importData,
      exportData,
      maxVal: maxVal > 0 ? maxVal : 1,
    };
  });

  // --- Methods ---

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.inventoryCurrentPage.set(1);
  }
  
  onCategoryFilterChange(event: Event) {
    this.inventoryCategoryFilter.set((event.target as HTMLSelectElement).value);
    this.inventoryCurrentPage.set(1);
  }

  onStatusFilterChange(event: Event) {
    this.transactionStatusFilter.set((event.target as HTMLSelectElement).value);
    this.transactionCurrentPage.set(1);
  }

  setTab(tab: 'inventory' | 'transactions') {
    this.activeTab.set(tab);
  }
  
  sortInventoryBy(column: 'name' | 'category' | 'quantity' | 'price' | 'status') {
    if (this.inventorySortColumn() === column) {
      this.inventorySortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.inventorySortColumn.set(column);
      this.inventorySortDirection.set('asc');
    }
    this.inventoryCurrentPage.set(1);
  }

  // FIX: Changed parameter type from `keyof WarehouseTransaction` to be more specific, excluding the non-sortable `items` property.
  sortTransactionsBy(column: 'id' | 'type' | 'date' | 'user' | 'status') {
    if (this.transactionSortColumn() === column) {
      this.transactionSortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.transactionSortColumn.set(column);
      this.transactionSortDirection.set(column === 'date' || column === 'id' ? 'desc' : 'asc');
    }
    this.transactionCurrentPage.set(1);
  }

  // Pagination Handlers
  setInventoryPage(page: number) {
    if (page > 0 && page <= this.inventoryTotalPages()) {
      this.inventoryCurrentPage.set(page);
    }
  }

  setTransactionPage(page: number) {
    if (page > 0 && page <= this.transactionTotalPages()) {
      this.transactionCurrentPage.set(page);
    }
  }

  // --- Item Modal ---
  openItemModal(item: WarehouseItem | null = null) {
    this.editingItem.set(item);
    if (item) {
      this.itemForm.patchValue(item);
    } else {
      this.itemForm.reset({ name: '', sku: '', category: '', quantity: 0, price: 0 });
    }
    this.isItemModalOpen.set(true);
  }

  closeItemModal() {
    this.isItemModalOpen.set(false);
    this.editingItem.set(null);
    this.itemForm.reset();
  }

  saveItem() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.getRawValue();
    const itemData = {
      name: formValue.name!,
      sku: formValue.sku!,
      category: formValue.category!,
      quantity: formValue.quantity!,
      price: formValue.price!,
    };

    if (this.editingItem()) {
      this.dataService.updateWarehouseItem({ ...this.editingItem()!, ...itemData });
    } else {
      this.dataService.addWarehouseItem(itemData);
    }

    this.closeItemModal();
  }

  deleteItem(id: number, event: MouseEvent) {
    event.stopPropagation();
    if(confirm('Are you sure you want to delete this item?')) {
      this.dataService.deleteWarehouseItem(id);
    }
  }

  // --- Transaction Modal ---
  get transactionItems() {
    return this.transactionForm.get('items') as FormArray;
  }

  createTransactionItem(): FormGroup {
    return this.fb.group({
      itemId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addTransactionItem() {
    this.transactionItems.push(this.createTransactionItem());
  }

  removeTransactionItem(index: number) {
    this.transactionItems.removeAt(index);
  }

  openTransactionModal() {
    this.transactionForm.reset({ type: 'Import' });
    this.transactionItems.clear();
    this.addTransactionItem(); // Start with one item row
    this.isTransactionModalOpen.set(true);
  }

  closeTransactionModal() {
    this.isTransactionModalOpen.set(false);
  }

  saveTransaction() {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }
    const formValue = this.transactionForm.getRawValue();

    const transactionData = {
      type: formValue.type!,
      items: formValue.items!.map((item: { itemId: number; quantity: number }) => ({
        itemId: Number(item.itemId),
        itemName: this.items().find(i => i.id === Number(item.itemId))?.name || 'Unknown',
        quantity: item.quantity
      }))
    };
    
    this.dataService.addWarehouseTransaction(transactionData);
    this.closeTransactionModal();
  }

  approveTransaction(id: number, event: MouseEvent) {
    event.stopPropagation();
    const result = this.dataService.updateTransactionStatus(id, 'Approved');
    if (!result.success) {
      alert(result.message);
    }
  }
  
  rejectTransaction(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.dataService.updateTransactionStatus(id, 'Rejected');
  }
}

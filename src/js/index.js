; (function () {
  // ----- Estruturas de dados -----
  let currentMonth = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    items: [],
  };

  let history = [];

  // Estado da interface
  let currentSort = 'default'; // 'default', 'boughtLast', 'alphabetical'
  let currentSearch = '';

  // ----- Inicialização (carregar do localStorage) -----
  function loadFromStorage() {
    const savedCurrent = localStorage.getItem('shoppingCurrentMonth');
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent);
        currentMonth = parsed;
        if (!currentMonth.items) currentMonth.items = [];

        // Adaptar itens antigos para o novo formato
        currentMonth.items.forEach(item => {
          if (item.bought === undefined) item.bought = false;
          if (item.boughtQuantity === undefined) item.boughtQuantity = 0;
          if (item.pricePerUnit === undefined) item.pricePerUnit = 0;
          if (item.createdAt === undefined) item.createdAt = Date.now();
          if (item.boughtAt === undefined) item.boughtAt = null;
        });
      } catch (e) {
        console.warn('Erro ao carregar mês atual');
      }
    } else {
      currentMonth = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        items: [],
      };
    }

    const savedHistory = localStorage.getItem('shoppingHistory');
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.warn('Erro ao carregar histórico');
      }
    } else {
      history = [
        { year: 2025, month: 3, total: 450.75 },
        { year: 2025, month: 4, total: 620.3 },
        { year: 2025, month: 5, total: 387.9 },
      ];
    }
  }

  function saveToStorage() {
    localStorage.setItem('shoppingCurrentMonth', JSON.stringify(currentMonth));
    localStorage.setItem('shoppingHistory', JSON.stringify(history));
  }

  // ----- Utilitários de formatação -----
  function formatMonthYear(year, month) {
    const date = new Date(year, month, 1);
    return date
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^[a-z]/, (l) => l.toUpperCase());
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ----- Cálculo do total atual (soma boughtQuantity * pricePerUnit) -----
  function calculateTotal() {
    return currentMonth.items.reduce(
      (sum, item) => (item.bought ? sum + (item.boughtQuantity * (item.pricePerUnit || 0)) : sum),
      0
    );
  }

  // ----- Funções de filtro e ordenação -----
  function getFilteredAndSortedItems() {
    // Primeiro filtra por pesquisa
    let filtered = currentMonth.items;
    if (currentSearch.trim() !== '') {
      const term = currentSearch.trim().toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(term));
    }

    // Depois ordena
    const sorted = [...filtered]; // cópia para não modificar original
    switch (currentSort) {
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'boughtLast':
        // Não pegos primeiro (bought = false), depois pegos ordenados pelo boughtAt (mais recente por último)
        sorted.sort((a, b) => {
          if (a.bought !== b.bought) {
            return a.bought ? 1 : -1; // não pegos (false) vêm antes
          }
          if (a.bought && b.bought) {
            // ambos pegos: ordenar pelo boughtAt, mais recente por último
            return (a.boughtAt || 0) - (b.boughtAt || 0);
          }
          // ambos não pegos: manter ordem de criação
          return (a.createdAt || 0) - (b.createdAt || 0);
        });
        break;
      case 'default':
      default:
        sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        break;
    }
    return sorted;
  }

  // ----- Atualizar interface da lista de itens e total -----
  function renderItems() {
    const container = document.getElementById('itemsContainer');
    const totalSpan = document.getElementById('totalAmount');

    const itemsToShow = getFilteredAndSortedItems();

    if (itemsToShow.length === 0) {
      if (currentMonth.items.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">Nenhum item adicionado ainda.</p>';
      } else {
        container.innerHTML = '<p class="text-muted text-center mb-0">Nenhum item corresponde à pesquisa.</p>';
      }
      totalSpan.textContent = formatCurrency(calculateTotal());
      return;
    }

    let html = '';
    itemsToShow.forEach((item) => {
      const checked = item.bought ? 'checked' : '';
      const boughtClass = item.bought ? 'item-bought' : '';

      let priceControls = '';
      if (item.bought) {
        priceControls = `
          <div class="bought-inputs">
            <input type="number" class="form-control form-control-sm" step="0.01" min="0" value="${item.boughtQuantity || 0}" data-id="${item.id}" data-field="boughtQuantity" style="width:70px">
            <span class="mx-1">x</span>
            <input type="number" class="form-control form-control-sm" step="0.01" min="0" value="${item.pricePerUnit || 0}" data-id="${item.id}" data-field="pricePerUnit" style="width:70px">
            <span class="item-total">= ${formatCurrency((item.boughtQuantity || 0) * (item.pricePerUnit || 0))}</span>
          </div>
        `;
      } else {
        priceControls = '<span class="text-muted small">—</span>';
      }

      html += `
        <div class="item-row ${boughtClass}" data-id="${item.id}">
          <div class="row align-items-center g-2">
            <div class="col-12 col-sm-5 col-md-4">
              <span class="fw-bold">${item.name}</span>
            </div>
            <div class="col-6 col-sm-3 col-md-3">
              <div class="form-check">
                <input class="form-check-input item-bought-checkbox" type="checkbox" data-id="${item.id}" ${checked}>
                <label class="form-check-label">Pego</label>
              </div>
            </div>
            <div class="col-6 col-sm-3 col-md-3">
              ${priceControls}
            </div>
            <div class="col-12 col-sm-1 col-md-2 text-end">
              <button class="btn btn-sm btn-outline-primary btn-circle edit-item" data-id="${item.id}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-circle delete-item" data-id="${item.id}" title="Excluir">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    totalSpan.textContent = formatCurrency(calculateTotal());
  }

  // ----- Atualizar tabela de histórico e média -----
  function renderHistory() {
    const tbody = document.getElementById('historyBody');
    const avgSpan = document.getElementById('averageSpending');

    if (history.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum mês arquivado.</td></tr>';
      avgSpan.textContent = formatCurrency(0);
      return;
    }

    const sorted = [...history].sort((a, b) => b.year - a.year || b.month - a.month);

    let rows = '';
    let sum = 0;
    sorted.forEach((entry) => {
      sum += entry.total;
      rows += `
        <tr>
          <td>${formatMonthYear(entry.year, entry.month)}</td>
          <td>${formatCurrency(entry.total)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger delete-history" data-year="${entry.year}" data-month="${entry.month}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rows;
    const average = history.length > 0 ? sum / history.length : 0;
    avgSpan.textContent = formatCurrency(average);
  }

  // ----- Adicionar item (apenas nome) -----
  function addItem(name) {
    if (!name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'O nome do item não pode estar vazio.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    const newItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      bought: false,
      boughtQuantity: 0,
      pricePerUnit: 0,
      createdAt: Date.now(),
      boughtAt: null,
    };
    currentMonth.items.push(newItem);
    saveToStorage();
    renderItems();
  }

  // ----- Excluir item com confirmação SweetAlert2 -----
  function deleteItem(id) {
    Swal.fire({
      title: 'Remover item?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        currentMonth.items = currentMonth.items.filter((item) => item.id != id);
        saveToStorage();
        renderItems();
        Swal.fire({
          icon: 'success',
          title: 'Removido!',
          text: 'Item excluído com sucesso.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  }

  // ----- Editar nome do item -----
  function editItem(id, newName) {
    if (!newName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'O nome do item não pode estar vazio.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
    const item = currentMonth.items.find((i) => i.id == id);
    if (item) {
      item.name = newName.trim();
      saveToStorage();
      renderItems();
      Swal.fire({
        icon: 'success',
        title: 'Atualizado!',
        text: 'Item editado com sucesso.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }

  // ----- Marcar item como pego (abre modal para valor) -----
  function markItemBought(id) {
    const item = currentMonth.items.find((i) => i.id == id);
    if (!item) return;

    // Abrir modal para preencher quantidade e valor
    document.getElementById('confirmItemId').value = id;
    document.getElementById('boughtQuantity').value = item.boughtQuantity || 1;
    document.getElementById('pricePerUnit').value = item.pricePerUnit || 0;
    document.getElementById('pricePerUnit').focus();

    const modal = new bootstrap.Modal(document.getElementById('confirmBoughtModal'));
    modal.show();
  }

  // ----- Confirmar compra (salvar quantidade e valor) -----
  function confirmBought() {
    const id = document.getElementById('confirmItemId').value;
    const quantity = parseFloat(document.getElementById('boughtQuantity').value);
    const price = parseFloat(document.getElementById('pricePerUnit').value);

    if (isNaN(quantity) || quantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'A quantidade deve ser um número positivo.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (isNaN(price) || price < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'O valor deve ser um número válido.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    const item = currentMonth.items.find((i) => i.id == id);
    if (item) {
      item.bought = true;
      item.boughtQuantity = quantity;
      item.pricePerUnit = price;
      item.boughtAt = Date.now();
      saveToStorage();
      renderItems();
      bootstrap.Modal.getInstance(document.getElementById('confirmBoughtModal')).hide();
      Swal.fire({
        icon: 'success',
        title: 'Confirmado!',
        text: `${item.name} marcado como pego.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }

  // ----- Desmarcar item como pego -----
  function unmarkItemBought(id) {
    const item = currentMonth.items.find((i) => i.id == id);
    if (item) {
      item.bought = false;
      item.boughtQuantity = 0;
      item.pricePerUnit = 0;
      item.boughtAt = null;
      saveToStorage();
      renderItems();
    }
  }

  // ----- Atualizar campos de quantidade e preço em tempo real -----
  function handleItemChange(e) {
    const target = e.target;

    if (target.classList.contains('item-bought-checkbox')) {
      const id = target.dataset.id;
      if (target.checked) {
        markItemBought(id);
      } else {
        unmarkItemBought(id);
      }
    } else if (target.classList.contains('form-control-sm')) {
      const id = target.dataset.id;
      const field = target.dataset.field;
      const value = parseFloat(target.value) || 0;

      const item = currentMonth.items.find((i) => i.id == id);
      if (item) {
        if (field === 'boughtQuantity') {
          item.boughtQuantity = value;
        } else if (field === 'pricePerUnit') {
          item.pricePerUnit = value;
        }
        saveToStorage();
        renderItems();
      }
    }
  }

  // ----- Arquivar mês -----
  function archiveMonth() {
    const total = calculateTotal();
    const monthEntry = {
      year: currentMonth.year,
      month: currentMonth.month,
      total: total,
    };

    history.push(monthEntry);

    // Criar novo mês
    const nextMonth = new Date(currentMonth.year, currentMonth.month + 1, 1);
    currentMonth = {
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth(),
      items: [],
    };

    saveToStorage();
    renderItems();
    renderHistory();

    Swal.fire({
      icon: 'success',
      title: 'Mês arquivado!',
      text: `Total gasto: ${formatCurrency(total)}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }

  // ----- Deletar entrada do histórico -----
  function deleteHistoryEntry(year, month) {
    Swal.fire({
      title: 'Remover registro?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        history = history.filter((entry) => !(entry.year === year && entry.month === month));
        saveToStorage();
        renderHistory();
        Swal.fire({
          icon: 'success',
          title: 'Removido!',
          text: 'Registro excluído com sucesso.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  }

  // ----- Exportar histórico para CSV (com table-hover para Excel) -----
  function exportHistoryToCSV() {
    if (history.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sem dados',
        text: 'Nenhum mês arquivado para exportar.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    const sorted = [...history].sort((a, b) => b.year - a.year || b.month - a.month);

    // Cabeçalho
    let csv = 'Mês/Ano,Total Gasto\n';

    // Dados
    sorted.forEach((entry) => {
      const monthYear = formatMonthYear(entry.year, entry.month);
      const total = entry.total.toFixed(2).replace('.', ',');
      csv += `"${monthYear}","R$ ${total}"\n`;
    });

    // Média
    const sum = history.reduce((acc, entry) => acc + entry.total, 0);
    const average = (sum / history.length).toFixed(2).replace('.', ',');
    csv += `"Média geral","R$ ${average}"\n`;

    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-compras-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: 'success',
      title: 'Exportado!',
      text: 'Arquivo CSV gerado com sucesso.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    });
  }

  // ----- Alternar tema claro/escuro -----
  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const html = document.documentElement;
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-bs-theme');
      const newTheme = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-bs-theme', newTheme);
    });
  }

  // ----- Inicialização -----
  document.addEventListener('DOMContentLoaded', function () {
    loadFromStorage();
    renderItems();
    renderHistory();

    // Event listeners para adicionar item
    document.getElementById('addItemBtn').addEventListener('click', () => {
      const nameInput = document.getElementById('newItemName');
      addItem(nameInput.value);
      nameInput.value = '';
      nameInput.focus();
    });

    document.getElementById('newItemName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('addItemBtn').click();
      }
    });

    // Pesquisa e ordenação
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderItems();
    });

    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderItems();
    });

    // Delegação de eventos para itens
    document.getElementById('itemsContainer').addEventListener('change', handleItemChange);
    document.getElementById('itemsContainer').addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      if (target.classList.contains('delete-item')) {
        const id = target.dataset.id;
        deleteItem(id);
      } else if (target.classList.contains('edit-item')) {
        const id = target.dataset.id;
        const item = currentMonth.items.find((i) => i.id == id);
        if (item) {
          document.getElementById('editItemId').value = id;
          document.getElementById('editItemName').value = item.name;
          const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
          modal.show();
        }
      }
    });

    // Salvar edição do modal
    document.getElementById('saveEditBtn').addEventListener('click', () => {
      const id = document.getElementById('editItemId').value;
      const newName = document.getElementById('editItemName').value;
      editItem(id, newName);
      bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
    });

    // Confirmar compra (modal)
    document.getElementById('confirmBoughtBtn').addEventListener('click', confirmBought);

    // Arquivar mês
    document.getElementById('archiveMonthBtn').addEventListener('click', archiveMonth);

    // Histórico: exclusão
    document.getElementById('historyBody').addEventListener('click', (e) => {
      const btn = e.target.closest('button.delete-history');
      if (btn) {
        const year = parseInt(btn.dataset.year);
        const month = parseInt(btn.dataset.month);
        deleteHistoryEntry(year, month);
      }
    });

    document.getElementById('exportHistoryBtn').addEventListener('click', exportHistoryToCSV);

    initThemeToggle();
  });
})();

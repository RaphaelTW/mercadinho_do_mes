;(function () {
  // ----- Estruturas de dados -----
  // Mês atual: { year, month, items: [ { id, name, bought, price } ] }
  let currentMonth = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    items: [],
  }

  // Histórico: [ { year, month, total } ]
  let history = []

  // ----- Inicialização (carregar do localStorage) -----
  function loadFromStorage() {
    const savedCurrent = localStorage.getItem('shoppingCurrentMonth')
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent)
        // garantir que items existe
        currentMonth = parsed
        if (!currentMonth.items) currentMonth.items = []
      } catch (e) {
        console.warn('Erro ao carregar mês atual')
      }
    } else {
      // Inicia com mês atual vazio
      currentMonth = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        items: [],
      }
    }

    const savedHistory = localStorage.getItem('shoppingHistory')
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory)
      } catch (e) {
        console.warn('Erro ao carregar histórico')
      }
    } else {
      // Dados fictícios para demonstração
      history = [
        { year: 2025, month: 3, total: 450.75 }, // Abril (mês 3 = abril)
        { year: 2025, month: 4, total: 620.3 }, // Maio
        { year: 2025, month: 5, total: 387.9 }, // Junho
      ]
    }
  }

  function saveToStorage() {
    localStorage.setItem('shoppingCurrentMonth', JSON.stringify(currentMonth))
    localStorage.setItem('shoppingHistory', JSON.stringify(history))
  }

  // ----- Utilitários de formatação -----
  function formatMonthYear(year, month) {
    const date = new Date(year, month, 1)
    return date
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^[a-z]/, (l) => l.toUpperCase())
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  // ----- Cálculo do total atual -----
  function calculateTotal() {
    return currentMonth.items.reduce(
      (sum, item) => (item.bought ? sum + (item.price || 0) : sum),
      0,
    )
  }

  // ----- Atualizar interface da lista de itens e total -----
  function renderItems() {
    const container = document.getElementById('itemsContainer')
    const totalSpan = document.getElementById('totalAmount')
    const emptyMsg = document.getElementById('emptyMessage')

    if (currentMonth.items.length === 0) {
      container.innerHTML =
        '<p class="text-muted text-center mb-0" id="emptyMessage">Nenhum item adicionado ainda.</p>'
      totalSpan.textContent = formatCurrency(0)
      return
    }

    let html = ''
    currentMonth.items.forEach((item) => {
      const checked = item.bought ? 'checked' : ''
      const priceField = item.bought
        ? `<input type="number" class="form-control form-control-sm price-input" step="0.01" min="0" value="${item.price || 0}" data-id="${item.id}" data-field="price">`
        : '<span class="text-muted small">—</span>'

      html += `
                    <div class="item-row" data-id="${item.id}">
                        <div class="row align-items-center g-2">
                            <div class="col-12 col-sm-5 col-md-4">
                                <span class="fw-bold">${item.name}</span>
                            </div>
                            <div class="col-6 col-sm-3 col-md-3">
                                <div class="form-check">
                                    <input class="form-check-input item-bought" type="checkbox" data-id="${item.id}" ${checked}>
                                    <label class="form-check-label">Pego</label>
                                </div>
                            </div>
                            <div class="col-6 col-sm-3 col-md-3">
                                ${priceField}
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
                `
    })

    container.innerHTML = html
    totalSpan.textContent = formatCurrency(calculateTotal())
  }

  // ----- Atualizar tabela de histórico e média -----
  function renderHistory() {
    const tbody = document.getElementById('historyBody')
    const avgSpan = document.getElementById('averageSpending')

    if (history.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center text-muted">Nenhum mês arquivado.</td></tr>'
      avgSpan.textContent = formatCurrency(0)
      return
    }

    // Ordenar do mais recente para o mais antigo
    const sorted = [...history].sort((a, b) => b.year - a.year || b.month - a.month)

    let rows = ''
    let sum = 0
    sorted.forEach((entry) => {
      sum += entry.total
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
                `
    })

    tbody.innerHTML = rows
    const average = history.length > 0 ? sum / history.length : 0
    avgSpan.textContent = formatCurrency(average)
  }

  // ----- Adicionar item -----
  function addItem(name) {
    if (!name.trim()) return
    const newItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      bought: false,
      price: 0,
    }
    currentMonth.items.push(newItem)
    saveToStorage()
    renderItems()
  }

  // ----- Excluir item -----
  function deleteItem(id) {
    currentMonth.items = currentMonth.items.filter((item) => item.id != id)
    saveToStorage()
    renderItems()
  }

  // ----- Editar item (nome) -----
  function editItem(id, newName) {
    const item = currentMonth.items.find((item) => item.id == id)
    if (item && newName.trim()) {
      item.name = newName.trim()
      saveToStorage()
      renderItems()
    }
  }

  // ----- Atualizar campo (bought ou price) via eventos delegados -----
  function handleItemChange(e) {
    const target = e.target
    if (target.classList.contains('item-bought')) {
      // Checkbox marcado/desmarcado
      const id = target.dataset.id
      const item = currentMonth.items.find((item) => item.id == id)
      if (item) {
        item.bought = target.checked
        if (!item.bought) {
          item.price = 0 // zera preço se desmarcar
        } else if (!item.price) {
          item.price = 0 // garante que existe
        }
        saveToStorage()
        renderItems()
      }
    } else if (target.dataset.field === 'price') {
      // Input de preço alterado
      const id = target.dataset.id
      const item = currentMonth.items.find((item) => item.id == id)
      if (item) {
        const val = parseFloat(target.value)
        item.price = isNaN(val) ? 0 : val
        saveToStorage()
        // Atualiza total sem re-renderizar tudo (mas re-renderizar é seguro)
        renderItems()
      }
    }
  }

  // ----- Arquivar mês atual e limpar lista -----
  function archiveMonth() {
    if (currentMonth.items.length === 0) {
      showToast('Adicione itens antes de arquivar o mês.', 'warning')
      return
    }

    const total = calculateTotal()
    const newHistoryEntry = {
      year: currentMonth.year,
      month: currentMonth.month,
      total: total,
    }
    history.push(newHistoryEntry)
    // Iniciar novo mês
    const now = new Date()
    currentMonth = {
      year: now.getFullYear(),
      month: now.getMonth(),
      items: [],
    }
    saveToStorage()
    renderItems()
    renderHistory()
  }

  // ----- Excluir entrada do histórico -----
  function deleteHistoryEntry(year, month) {
    history = history.filter((entry) => !(entry.year === year && entry.month === month))
    saveToStorage()
    renderHistory()
  }

  // ----- Exportar histórico para CSV -----
  function exportHistoryToCSV() {
    if (history.length === 0) {
      showToast('Nenhum histórico para exportar.', 'warning')
      return
    }

    const sorted = [...history].sort((a, b) => a.year - b.year || a.month - b.month)
    let csv = 'Mês/Ano;Total (R$)\n'
    sorted.forEach((entry) => {
      const monthName = formatMonthYear(entry.year, entry.month)
      csv += `${monthName};${entry.total.toFixed(2).replace('.', ',')}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', 'historico_compras.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ----- Alternar tema claro/escuro -----
  function initThemeToggle() {
    const btn = document.getElementById('themeToggle')
    const html = document.documentElement
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-bs-theme')
      const newTheme = current === 'light' ? 'dark' : 'light'
      html.setAttribute('data-bs-theme', newTheme)
      // ícone já é trocado automaticamente via Bootstrap (mas não fere)
    })
  }

  // ----- Toasts (feedback visual) -----
  function showToast(message, variant = 'primary', delay = 3000) {
    try {
      let container = document.getElementById('toastContainer')
      if (!container) {
        container = document.createElement('div')
        container.id = 'toastContainer'
        container.className = 'position-fixed bottom-0 end-0 p-3'
        container.style.zIndex = 10800
        document.body.appendChild(container)
      }

      const toastEl = document.createElement('div')
      toastEl.className = 'toast align-items-center text-bg-' + variant
      toastEl.setAttribute('role', 'alert')
      toastEl.setAttribute('aria-live', 'assertive')
      toastEl.setAttribute('aria-atomic', 'true')

      toastEl.innerHTML = `
              <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
              </div>
            `

      container.appendChild(toastEl)
      const bsToast = new bootstrap.Toast(toastEl, { delay })
      bsToast.show()
      // remover após escondido
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
    } catch (e) {
      console.warn('showToast falhou', e)
    }
  }

  // ----- Carregar CSV por caminho (fetch) e salvar em IndexedDB -----
  async function loadCsvPath(path) {
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error('Falha ao buscar: ' + res.status)
      const text = await res.text()
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      const rows = parsed.data
      await saveDataset(path, rows)
      showToast('CSV carregado e salvo em cache: ' + path, 'success')
      const list = await listDatasets()
      renderDatasets(list)
      showTable(rows)
    } catch (err) {
      showToast('Erro ao carregar CSV: ' + err.message, 'danger')
    }
  }

  // Limpar todos os datasets em cache (útil para testes)
  async function clearAllDatasets() {
    const db = await openDB()
    return new Promise((res, rej) => {
      const tx = db.transaction('datasets', 'readwrite')
      const store = tx.objectStore('datasets')
      const req = store.clear()
      req.onsuccess = () => res(true)
      req.onerror = (e) => rej(e.target.error)
    })
  }

  // ----- Inicialização -----
  document.addEventListener('DOMContentLoaded', function () {
    loadFromStorage()
    renderItems()
    renderHistory()

    // Event listeners
    document.getElementById('addItemBtn').addEventListener('click', () => {
      const input = document.getElementById('newItemName')
      addItem(input.value)
      input.value = ''
      input.focus()
    })

    document.getElementById('newItemName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('addItemBtn').click()
      }
    })

    // Delegação de eventos para itens (bought, price, edit, delete)
    document.getElementById('itemsContainer').addEventListener('change', handleItemChange)
    document.getElementById('itemsContainer').addEventListener('click', (e) => {
      const target = e.target.closest('button')
      if (!target) return

      if (target.classList.contains('delete-item')) {
        const id = target.dataset.id
        if (confirm('Remover este item?')) {
          deleteItem(id)
        }
      } else if (target.classList.contains('edit-item')) {
        const id = target.dataset.id
        const item = currentMonth.items.find((i) => i.id == id)
        if (item) {
          document.getElementById('editItemId').value = id
          document.getElementById('editItemName').value = item.name
          const modal = new bootstrap.Modal(document.getElementById('editItemModal'))
          modal.show()
        }
      }
    })

    // Salvar edição do modal
    document.getElementById('saveEditBtn').addEventListener('click', () => {
      const id = document.getElementById('editItemId').value
      const newName = document.getElementById('editItemName').value
      editItem(id, newName)
      bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide()
    })

    // Arquivar mês
    document.getElementById('archiveMonthBtn').addEventListener('click', archiveMonth)

    // Histórico: exclusão e exportação
    document.getElementById('historyBody').addEventListener('click', (e) => {
      const btn = e.target.closest('button.delete-history')
      if (btn) {
        const year = parseInt(btn.dataset.year)
        const month = parseInt(btn.dataset.month)
        if (confirm('Remover este registro do histórico?')) {
          deleteHistoryEntry(year, month)
        }
      }
    })

    document.getElementById('exportHistoryBtn').addEventListener('click', exportHistoryToCSV)

    initThemeToggle()
    // Binders para carregar CSV remoto e limpar cache
    const loadPathBtn = document.getElementById('loadPathBtn')
    if (loadPathBtn)
      loadPathBtn.addEventListener('click', () => {
        loadCsvPath('/excel.csv')
      })

    const clearBtn = document.getElementById('clearCacheBtn')
    if (clearBtn)
      clearBtn.addEventListener('click', async () => {
        if (confirm('Limpar todos os datasets em cache?')) {
          await clearAllDatasets()
          renderDatasets([])
          document.getElementById('result').innerHTML = '<em>Cache limpo</em>'
        }
      })
      // Tentar carregar /excel.csv automaticamente se não estiver em cache
    ;(async () => {
      try {
        const listNow = await listDatasets()
        const has = listNow.some((d) => d.name === '/excel.csv' || d.name.endsWith('/excel.csv'))
        if (!has) {
          // não aguardar para não bloquear a renderização
          loadCsvPath('/excel.csv').catch(() => {
            // falhas silenciosas (pode não existir em dev local)
          })
        }
      } catch (e) {
        // ignore
      }
    })()
  })
})()

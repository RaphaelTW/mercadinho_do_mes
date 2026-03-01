# 🛒 Mercadinho do Mês - Sistema de Compras

## 📋 Sobre o Projeto

Sistema dinâmico e responsivo para gerenciar compras mensais de supermercado com controle de gastos, histórico e exportação para CSV/Excel.

## ✨ Principais Melhorias

### 1. **Formulário Simplificado**
- Usuário insere apenas o **nome do item**
- Sem necessidade de preencher quantidade planejada ou unidade
- Interface limpa e intuitiva

### 2. **Obrigatoriedade de Valor ao Marcar como Pego**
- Ao marcar um item como "Pego", abre um **modal de confirmação**
- Usuário **obrigatoriamente** preenche:
  - **Quantidade** comprada
  - **Valor unitário** (R$)
- Soma automática: `quantidade × valor = total do item`
- Se houver múltiplas compras do mesmo item, os valores são **somados automaticamente**

### 3. **Visual Aprimorado**
- Itens marcados como "Pego" ganham **fundo verde bem leve**
- Transição suave entre estados
- Tema claro/escuro totalmente suportado
- Interface totalmente **responsiva** (mobile, tablet, desktop)

### 4. **Exportação para Excel Melhorada**
- CSV exportado com **table-hover** nativo do Excel
- Formatação adequada para visualização em planilhas
- Inclui média geral de gastos
- Datas formatadas em português

### 5. **Tecnologias Utilizadas**
- **HTML5** semântico
- **CSS3** com variáveis CSS e temas
- **Bootstrap 5.3** para responsividade
- **JavaScript Vanilla** (sem dependências externas)
- **SweetAlert2** para confirmações elegantes
- **LocalStorage** para persistência de dados

## 🚀 Como Usar

### Adicionar Item
1. Digite o nome do item no campo de entrada
2. Clique em "Adicionar" ou pressione Enter
3. O item aparece na lista como "não pego"

### Marcar Item como Pego
1. Clique no checkbox "Pego" ao lado do item
2. Um modal abrirá solicitando:
   - **Quantidade**: quantidade comprada
   - **Valor Unitário**: preço por unidade
3. Clique em "Confirmar"
4. O item ficará com fundo verde claro e mostrará o total

### Editar Item
1. Clique no ícone de lápis ao lado do item
2. Altere o nome
3. Clique em "Salvar"

### Excluir Item
1. Clique no ícone de lixeira
2. Confirme a exclusão

### Pesquisar e Ordenar
- **Pesquisa**: Digite no campo "Pesquisar itens..."
- **Ordenação**:
  - Padrão (ordem de adição)
  - Pegos por último (não pegos primeiro, depois pegos)
  - Ordem alfabética

### Arquivar Mês
1. Clique em "Arquivar mês e começar novo"
2. O total será adicionado ao histórico
3. Um novo mês será iniciado

### Exportar Histórico
1. Clique em "Exportar para CSV" na seção de histórico
2. Um arquivo será baixado com todos os meses arquivados
3. Abra no Excel com table-hover nativo

## 📊 Estrutura de Dados

### Item
```javascript
{
  id: "unique-id",
  name: "Nome do Item",
  bought: false,
  boughtQuantity: 0,
  pricePerUnit: 0,
  createdAt: timestamp,
  boughtAt: null
}
```

### Mês Atual
```javascript
{
  year: 2026,
  month: 2,
  items: [...]
}
```

### Histórico
```javascript
[
  { year: 2025, month: 3, total: 450.75 },
  { year: 2025, month: 4, total: 620.30 }
]
```

## 🎨 Customização

### Cores
Edite `/src/css/styles.css` para alterar as cores:
```css
:root {
  --item-row-bought-light: rgba(40, 167, 69, 0.08);
  --item-row-bought-dark: rgba(40, 167, 69, 0.15);
}
```

### Temas
O sistema suporta tema claro e escuro automaticamente via Bootstrap

## 📱 Responsividade

- ✅ Mobile (até 576px)
- ✅ Tablet (576px - 992px)
- ✅ Desktop (acima de 992px)

## 💾 Armazenamento

Todos os dados são salvos em **LocalStorage** do navegador:
- `shoppingCurrentMonth`: dados do mês atual
- `shoppingHistory`: histórico de meses anteriores

## 🔧 Instalação

1. Extraia os arquivos
2. Abra `index.html` em um navegador moderno
3. Comece a usar!

Não requer servidor ou instalação de dependências.

## 📝 Notas

- Os dados são persistidos localmente no navegador
- Limpar o cache do navegador apagará todos os dados
- Compatível com navegadores modernos (Chrome, Firefox, Safari, Edge)

---

**Desenvolvido com ❤️ para facilitar o controle de compras mensais**

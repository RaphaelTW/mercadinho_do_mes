# 🛒 Mercadinho do Mês

> Sistema web moderno para controle de compras mensais com histórico, exportação e suporte a CSV como base de dados.

---

## 📌 Sobre o Projeto

O **Mercadinho do Mês** é uma aplicação web desenvolvida para organizar, controlar e acompanhar os gastos mensais com compras de supermercado.

O sistema permite:

* ✅ Adicionar e editar itens da lista
* 🛍️ Marcar itens como comprados
* 💰 Calcular total automaticamente
* 📦 Arquivar meses anteriores
* 📊 Visualizar média de gastos
* 📁 Exportar histórico para CSV
* 🌙 Alternar entre tema claro/escuro
* 🗂️ Usar arquivo `excel.csv` como base de dados (cache via IndexedDB)

---

## 🚀 Tecnologias Utilizadas

* **HTML5**
* **CSS3**
* **Bootstrap 5**
* **Bootstrap Icons**
* **JavaScript (Vanilla JS)**
* **LocalStorage**
* **IndexedDB**
* **PapaParse (leitura de CSV)**

---

## 🎯 Funcionalidades

### 🛒 Lista de Compras

* Adição rápida de itens
* Edição via modal
* Exclusão com confirmação
* Campo de preço habilitado apenas quando marcado como “Pego”
* Total atualizado em tempo real

### 📅 Histórico Mensal

* Arquivamento do mês atual
* Visualização organizada por mês/ano
* Cálculo automático da média geral
* Exclusão de registros
* Exportação para CSV

### 📂 Integração com CSV

* Carregamento automático de `/excel.csv`
* Armazenamento em cache via IndexedDB
* Limpeza manual de datasets

---

## 📦 Estrutura do Projeto

```
mercadinho_do_mes/
│
├── index.html
├── README.md
└── (opcional) excel.csv
```

---

## ⚙️ Como Usar

### 1️⃣ Executar Localmente

Basta abrir o `index.html` no navegador.

Ou utilize um servidor local:

```bash
# Exemplo com VSCode Live Server
Clique com botão direito → Open with Live Server
```

---

### 2️⃣ Usar CSV como Banco

Coloque um arquivo chamado:

```
excel.csv
```

na raiz do projeto e clique em:

```
Carregar /excel.csv
```

O sistema fará cache automático no navegador.

---

## 💾 Persistência de Dados

O sistema utiliza:

* **LocalStorage** → Dados do mês atual e histórico
* **IndexedDB** → Armazenamento de datasets CSV

Os dados permanecem salvos mesmo após fechar o navegador.

---

## 📊 Exportação

O histórico pode ser exportado em formato:

```
historico_compras.csv
```

Compatível com:

* Excel
* LibreOffice
* Google Sheets

---

## 🌗 Tema Claro / Escuro

O botão no topo da interface permite alternar dinamicamente entre:

* ☀️ Light Mode
* 🌙 Dark Mode

---

## 🔐 Segurança

* Nenhum dado é enviado para servidores externos
* Todo armazenamento é local no navegador
* Não depende de backend

---

## 📈 Melhorias Futuras (Roadmap)

* [ ] Filtro por categoria
* [ ] Dashboard com gráficos
* [ ] Controle por usuário
* [ ] Integração com API de preços
* [ ] PWA (instalável como app)

---

## 🧠 Objetivo do Projeto

Criar uma solução simples, rápida e eficiente para controle de gastos mensais domésticos, utilizando apenas tecnologias front-end modernas.

---

## 👨‍💻 Autor

Desenvolvido por **Raphael**
Projeto pessoal para organização e controle financeiro doméstico.

---

## 📜 Licença

Este projeto é livre para uso pessoal e educacional.

---

# ⭐ Mercadinho do Mês

Organize. Controle. Economize.

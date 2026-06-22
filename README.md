# Mini POS System

A simple Point of Sale (POS) and Inventory Management System with a Node.js/Express backend and a vanilla HTML/CSS/JavaScript frontend for managing products, sales, and inventory.

---

## Tech Stack

**Frontend:**
- HTML, CSS, JavaScript (vanilla, no framework)
- Native ES Modules + Fetch API
- Tabler Icons (webfont via CDN)
- Google Fonts — Sora, Inter, JetBrains Mono

**Backend:**
- Node.js
- Express.js
- mysql2 (promise-based pool)
- dotenv
- helmet (security headers)
- express-rate-limit
- cors

**Database:**
- MySQL

---

## Project Structure
```
root/
├── node_modules/
├── package-lock.json
├── package.json
├── .env
├── .gitignore
└── README.md

backend/
├── config/
│   └── database.js
├── controllers/
│   ├── productController.js
│   └── saleController.js
├── middleware/
│   ├── errorHandler.js
│   ├── validateProduct.js
│   └── validateSale.js
├── models/
│   ├── productModel.js
│   └── saleModel.js
├── routes/
│   ├── productRoutes.js
│   └── saleRoutes.js
└── server.js

database/
└── mini-pos-db.sql

frontend/
├── assets/
├── src/
│   ├── api/
│   │   └── productAPI.js
│   ├── components/
│   │   ├── headers/
│   │   │   ├── header/
│   │   │   │   ├── header.css
│   │   │   │   └── header.js
│   │   │   └── subheader/
│   │   │       ├── subheader.css
│   │   │       └── subheader.js
│   │   ├── input/
│   │   │   ├── cart/
│   │   │   │   ├── cart.css
│   │   │   │   └── cart.js
│   │   │   ├── product-card/
│   │   │   │   ├── product-card.css
│   │   │   │   └── product-card.js
│   │   │   └── search/
│   │   │       ├── search.css
│   │   │       └── search.js
│   │   ├── modals/
│   │   │   ├── modal/
│   │   │   │   ├── modal.css
│   │   │   │   └── modal.js
│   │   │   ├── product-modals/
│   │   │   │   ├── product-modals.css
│   │   │   │   └── product-modals.js
│   │   │   └── receipt-modal/
│   │   │       ├── receipt-modal.css
│   │   │       └── receipt-modal.js
│   │   ├── navigation/
│   │   │   └── sidebar/
│   │   │       ├── sidebar.css
│   │   │       └── sidebar.js
│   │   └── output/
│   │       ├── cat-filter/
│   │       │   ├── cat-filter.css
│   │       │   └── cat-filter.js
│   │       ├── scrollable-table/
│   │       │   ├── scrollable-table.css
│   │       │   └── scrollable-table.js
│   │       ├── stat-card/
│   │       │   ├── stat-card.css
│   │       │   └── stat-card.js
│   │       ├── toast/
│   │       │   ├── toast.css
│   │       │   └── toast.js
│   │       └── widget/
│   │           ├── widget.css
│   │           └── widget.js
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── dashboard.css
│   │   │   ├── dashboard.js
│   │   │   └── dashboard.html
│   │   ├── inventory/
│   │   │   ├── inventory.css
│   │   │   ├── inventory.js
│   │   │   └── inventory.html
│   │   ├── pos/
│   │   │   ├── pos.css
│   │   │   ├── pos.js
│   │   │   └── pos.html
│   │   └── sales/
│   │       ├── sales.css
│   │       ├── sales.js
│   │       └── sales.html
│   └── main.js
├── styles/
│   └── global-styles.css
└── index.html
```

---

## Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (v18 or higher recommended) — [nodejs.org](https://nodejs.org)
- **MySQL** (v8 or higher, or via XAMPP/MAMP/MySQL Workbench)
- A code editor with a **Live Server**-type extension (e.g. VS Code's "Live Server" extension), or any static file server

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mini-pos-system
```

### 2. Install dependencies

Dependencies are managed at the **project root** (not inside `backend/`):

```bash
npm install
```

### 3. Set up the database

Start your MySQL server, then create the database:

```sql
CREATE DATABASE mini_pos_db;
```

Import the schema and (optional) seed data:

```bash
mysql -u root -p mini_pos_db < database/mini-pos-db.sql
```

Or, if you're using a GUI tool (phpMyAdmin, MySQL Workbench, TablePlus, etc.), import `database/mini-pos-db.sql` directly through its import feature.

### 4. Configure environment variables

Create a `.env` file in the **project root** with the following:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_pos_db
DB_PORT=3306
PORT=3000
```

> **Important:** `PORT` must be `3000` to match the frontend's API calls (`productAPI.js` and `saleAPI.js` both point to `http://localhost:3000`). If you change this, you must also update those two files.

### 5. Start the backend server

```bash
node backend/server.js
```

Or, if a dev script is configured in `package.json` (e.g. using `nodemon`):

```bash
npm run dev
```

You should see in the terminal:

```
Server running on port 3000
MySQL Connected
```

If you don't see `MySQL Connected`, check the **Troubleshooting** section below before continuing.

### 6. Run the frontend

Open `frontend/index.html` using **Live Server** (or any static server) — do not open it by double-clicking the file directly, since ES Modules (`import`/`export`) require the page to be served over `http://`, not `file://`.

By default, the backend only allows requests from:
- `http://localhost:5500`
- `http://127.0.0.1:5500`

If your Live Server (or other static server) runs on a different port, update the `allowedOrigins` array in `backend/server.js` to match, or configure your static server to use port `5500`.

---

## API Endpoints

Base URL: `http://localhost:3000`

### Products — `/products`

| Method | Endpoint              | Description              |
|--------|------------------------|---------------------------|
| GET    | `/products`            | Get all active products   |
| GET    | `/products/:id`        | Get a single product      |
| POST   | `/products`            | Add a new product         |
| PUT    | `/products/:id`        | Update a product          |
| DELETE | `/products/:id`        | Archive (soft-delete) a product |

### Sales — `/sales`

| Method | Endpoint        | Description                          |
|--------|-------------------|---------------------------------------|
| GET    | `/sales`          | Get all sales (with nested items)     |
| GET    | `/sales/:id`       | Get a single sale by ID               |
| POST   | `/sales`           | Create a new sale (deducts stock)     |

**Example POST body for `/sales`:**
```json
{
    "items": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 3, "quantity": 1 }
    ]
}
```
> Note: prices are looked up server-side from the database — do not send `price` in the request body.

---

## Features

- **Inventory Management** — add, edit, archive, and view products with category filtering and stock-level badges
- **Point of Sale (POS)** — product grid with cart, quantity controls, and checkout flow that generates a receipt
- **Sales / Transaction History** — searchable list of past transactions with a detailed item breakdown per sale
- **Dashboard** — store overview with stat cards, current stock widget, and recent transactions widget
- **MVC Architecture** (backend) — routes → controllers → models, with dedicated validation and error-handling middleware
- **Transactional stock deduction** — sales use database transactions with row locking (`FOR UPDATE`) to prevent overselling

---

## Troubleshooting

**`ERR_CONNECTION_REFUSED` when loading any page**
The backend isn't running, or it's running on a different port than the frontend expects. Run `node backend/server.js` and confirm it logs `Server running on port 3000`.

**`MySQL Connected` doesn't appear in the terminal**
Check that MySQL is running and that `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env` are correct.

**API calls fail with a CORS error in the browser console**
Your frontend isn't being served from `http://localhost:5500` or `http://127.0.0.1:5500`. Either serve it from one of those ports, or update `allowedOrigins` in `backend/server.js`.

**Page loads blank or shows module-related console errors**
Make sure you opened `frontend/index.html` through a local server (Live Server, etc.), not by double-clicking the file. ES Modules don't work over the `file://` protocol.

---

## Author

name
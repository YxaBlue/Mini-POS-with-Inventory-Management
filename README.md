# Mini POS System

A simple Point of Sale (POS) and Inventory Management System built with a Node.js/Express backend and a frontend interface for managing products, sales, and inventory.

---

## Tech Stack

**Frontend:**
- HTML, CSS, JavaScript

**Backend:**
- Node.js
- Express.js

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
│   │   ├── modal/
│   │   │   ├── modal.css
│   │   │   └── modal.js
│   │   └── product-table/
│   │   │   ├── product-table.css
│   │   │   └── product-table.js
│   │   ├── sidebar/
│   │   │   ├── sidebar.css
│   │   │   └── sidebar.js
│   │   ├── toast/
│   │   │   ├── toast.css
│   │   │   └── toast.js
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   │   ├── inventory.css
│   │   │   ├── inventory.js
│   │   │   └── inventory.html
│   │   ├── pos/
│   │   └── sales/
│   └── main.js
├── styles/
│   └── global-styles.css
└── index.html
```
---

## Installation & Setup

### Clone Repository
git clone <your-repo-url>
cd mini-pos-system

### Backend Setup
```
cd backend
npm install
```
Create .env file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_pos_db
PORT=5000
```
### Database Setup
```
CREATE DATABASE mini_pos_db;

Import: database/mini-pos-db.sql
```
### Run Server
```
node server.js
```
or
```
npm run dev
```

### Frontend
Open frontend/index.html using Live Server or browser

---

## API Endpoints

- GET    /api/products
- GET    /api/products/:id
- POST   /api/products
- PUT    /api/products/:id
- DELETE /api/products/:id

---

## Features
- Product CRUD
- Inventory Management
- Sales Module (basic)
- MVC Architecture

---

## Author
Isabella Nicole R.
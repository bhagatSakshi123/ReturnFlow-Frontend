# ReturnFlow — Frontend

React frontend for ReturnFlow — Smart E-commerce Return, Inspection & Refund Management System.

ReturnFlow is a role-based e-commerce return management platform that manages the complete return journey from return request to inspection, refund and dispute resolution.

## Features

- Customer, Seller and Admin dashboards
- JWT-based authentication
- Role-based navigation and access
- Product browsing and order placement
- Return request management
- Return status tracking
- Pickup and product receiving workflow
- Product quality inspection
- Refund initiation and completion
- Dispute management
- Loading states and error handling
- Responsive e-commerce-style interface

## User Roles

### Customer

- Browse available products
- Place orders
- Request product returns
- Track return status
- Raise disputes for completed refunds

### Seller

- View customer orders
- Mark orders as delivered
- Approve or reject return requests
- Schedule pickup
- Mark returned products as received
- Perform product inspection
- Initiate and complete refunds
- Manage disputes

### Admin

- View users
- View products
- Monitor disputes
- Update dispute status

## Return Lifecycle

Order Placed
↓
Order Delivered
↓
Return Requested
↓
Return Approved / Rejected
↓
Pickup Scheduled
↓
Product Received
↓
Quality Inspection
↓
Refund Initiated
↓
Refund Completed
↓
Dispute Management

## Technology Stack

- React
- JavaScript
- Vite
- Axios
- React Router
- CSS
- REST API
- JWT Authentication

## Backend

This frontend communicates with the ReturnFlow Spring Boot REST API.

Backend repository:

https://github.com/bhagatSakshi123/ReturnFlow

## Frontend Repository

https://github.com/bhagatSakshi123/ReturnFlow-Frontend

## Project Structure

src/
├── assets/
├── components/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── CustomerDashboard.jsx
│   ├── SellerDashboard.jsx
│   └── AdminDashboard.jsx
├── services/
│   └── api.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx

## Authentication

The frontend uses JWT authentication.

After successful login:

- JWT token is stored in local storage
- User role is stored for role-based navigation
- Axios automatically attaches the JWT token to API requests
- Protected routes restrict dashboard access according to the user's role

## Running the Project

### 1. Clone the repository

git clone https://github.com/bhagatSakshi123/ReturnFlow-Frontend.git

### 2. Open the project

cd ReturnFlow-Frontend

### 3. Install dependencies

npm install

### 4. Start the development server

npm run dev

The frontend runs on:

http://localhost:5173

Make sure the ReturnFlow Spring Boot backend is also running on:

http://localhost:8080

## Project Highlights

ReturnFlow demonstrates practical implementation of:

- React component-based architecture
- REST API integration
- JWT authentication
- Role-based access control
- E-commerce order management
- Return workflow management
- Inspection and refund processing
- Frontend state management
- API error handling

## Author

Sakshi Bhagat

Java Full Stack Developer | React | Spring Boot | REST APIs

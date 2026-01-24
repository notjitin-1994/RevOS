	# MotoShop Management System - Feature Specifications

## 1. Project Overview
A comprehensive workshop management solution designed to streamline motorcycle service operations. The system handles end-to-end workflows from customer intake to invoicing, including inventory tracking, employee scheduling, and a detailed service history log.

---

## 2. Employee Management (Auth & RBAC)
**Module:** `Authentication`

The system utilizes Role-Based Access Control (RBAC) to secure data and features.

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Owner** | **Super Admin** | Full access to all modules, financial reports, revenue data, system settings, and employee management (Create/Delete/Promote). |
| **Admin** | **Managerial** | Can manage inventory, scheduling, customers, and job cards. Restricted from deleting financial history or employee profiles. |
| **Mechanic**| **Operational** | Access to assigned Job Cards, Calendar (view only), and Inventory (view/request only). Can update job status and add technical notes. |
| **Customer**| **Client Portal** | View their own Bike Profile, Service History, and Status of current active Job Cards (ReadOnly). |

---

## 3. Customer Management
**Module:** `CRM`

### 3.1 Customer Profile
* **Personal Details:** Name, Phone Number, Email, Residential Address.
* **Associations:** Link to owned *Bikes* (One-to-Many).

### 3.2 Service History
* **Historical View:** A chronological log of all closed Job Cards for a specific customer/bike.
* **Data Granularity:**
    * **Labor History:** List of services performed (e.g., "Carburetor Cleaning").
    * **Parts History:** List of components replaced (e.g., "Spark Plug - NGK").

---

## 4. Service Scope Management
**Module:** `Master_Data`

Defines the "Universe" of supported vehicles to ensure data consistency across the app.

* **Make:** The manufacturer (e.g., Honda, Yamaha, Kawasaki).
* **Model:** Specific model names linked to a Make (e.g., CBR650R, MT-07).
* **Year:** Manufacturing years applicable to the Model.

---

## 5. Bike Management
**Module:** `Vehicle_Registry`

* **Vehicle Identification:**
    * Make / Model / Year (Dropdowns populated by *Service Scope*).
    * **Engine Number:** Unique identifier.
    * **Chassis Number (VIN):** Unique identifier.
* **Ownership:** Linked to a specific `Customer ID`.

---

## 6. Parts & Inventory Management
**Module:** `Inventory`

### 6.1 Part Definition
* **Meta Data:** Make, Model compatibility, "Used For" category (Engine, Brakes, Body, Electrical).

### 6.2 Stock Tracking
* **On-hand Stock:** Quantity currently available in the active workshop area.
* **Warehouse Stock:** Quantity in deep storage/backup.
* **Low-Stock Warning:** Automated alert system when `On-hand < Defined Threshold`.

### 6.3 Financials
* **Cost Tracking:** Purchase Price (Cost per unit).
* **Resale Tracking:** Selling Price.
* **Margin Analysis:** Automated calculation of profit margin per part.

---

## 7. Calendar & Schedule Management
**Module:** `Scheduler`

* **Employee Tracker:** Database of active mechanics available for shifts.
* **Workslot Tracker:** Definition of shop hours and individual shift blocks.
* **Activity Tracker:**
    * Specific task assignment (e.g., "Engine Rebuild - Bay 1").
    * Status of the task (Pending, In-Progress, Done).
* **Time Tracker:** Log start and end times for specific tasks to analyze efficiency.

---

## 8. Job Card Management
**Module:** `Job_Card` (The Core Workflow)

### 8.1 Creation & Sync
* **Synced Customer Details:** Auto-fetch name/contact upon selection.
* **Synced Vehicle Details:** Auto-fetch Make/Model/VIN.
* **Synced Service History:** Quick-link to view previous work on this specific bike.

### 8.2 Active Job Management
* **Current Job Card:** The active digital document.
* **Inputs:**
    * **Customer Notes:** Issues reported by the client (e.g., "Hard starting in morning").
    * **Work Requested:** Initial list of agreed services.
* **Resource Allocation:**
    * **Parts Needed:** Add items from Inventory (deducts from stock).
    * **Labor Needed:** Add service line items.

### 8.3 Status & Financials
* **Current Status:** `Draft` -> `Queue` -> `In Progress` -> `Quality Check` -> `Ready` -> `Delivered`.
* **Invoicing:** Auto-generation of bill based on Parts + Labor + Tax.
* **Payment Request:** Feature to trigger an Email or SMS to the customer with the invoice amount and payment details/link.

---

## 9. UI/UX Architecture & Dashboard

### 9.1 Dashboard (The Hub)
A central landing page containing links to all modules.
* **Widgets:** Active Jobs Count, Low Stock Alerts, Revenue (Owner only), Today's Schedule.

### 9.2 Navigation Structure

#### A. Desktop View ( > 1024px )
* **Component:** **Animated Sidebar**.
* **Features:**
    * Collapsible state (Icon-only vs. Expanded text).
    * Smooth transition animations.
    * Aesthetic styling (blur/glassmorphism or clean flat design).
    * Contains links to all modules.

#### B. Mobile View ( < 1024px )
* **Component:** **Scrollable Bottom Navbar**.
* **Features:**
    * Fixed position at viewport bottom.
    * Horizontally scrollable to accommodate all feature links (Dashboard, Jobs, Inventory, Calendar, etc.) without clutter.
    * Active state highlighting.

---

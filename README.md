
# Creative Thinking Platform

This project is a full-stack web application designed using **NestJS** for the backend and **Vue.js** for the frontend, providing a comprehensive environment for creative thinking initiatives. This guide will walk you through the setup and configuration process to get the application up and running on your local machine.

## Prerequisites

Ensure you have the following tools and frameworks installed on your system:

### Tools
1. **XAMPP** - for running Apache and MySQL
2. **VS Code** - as your Integrated Development Environment
3. **Git** - for version control
4. **Node.js** - for running JavaScript on the backend

### Frameworks
1. **NestJS** - for the backend API
2. **Vue.js** - for the frontend user interface

---

## Setup Guide

### Step 1: Install All Tools
1. Download and install [XAMPP](https://www.apachefriends.org/download.html).
2. Install [Visual Studio Code](https://code.visualstudio.com/).
3. Install [Git](https://git-scm.com/).
4. Download and install [Node.js](https://nodejs.org/).

---

### Step 2: Setup Database
1. **Start XAMPP**:
   - Open XAMPP Control Panel.
   - Start **Apache** and **MySQL** services.
2. **Create Database**:
   - Open **phpMyAdmin** (http://localhost/phpmyadmin).
   - Create a new database named **`crativethinking`**.
3. **Add Admin User**:
   - Insert the following data into the `user` table:
     ```sql
     INSERT INTO `user` VALUES 
     (1, 'firstName', 'lastName', 'email@go.buu.ac.th', 'แอดมิน', 'ดำรงตำแหน่ง', '', '', 'notConfirmed', '', 'วิทยาการคอมพิวเตอร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', 0, '2024-09-20 10:47:22.772796', '2024-10-17 18:10:56.651156', NULL);
     ```

---

### Step 3: Setup Frontend

1. **Clone the Frontend Repository**:
   ```bash
   git clone https://github.com/Kaewmanee64160234/crativethk_font.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd crativethk_font
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run the Frontend**:
   ```bash
   npm run dev
   ```
   - The application will be accessible at: [http://localhost:5173](http://localhost:5173)

---

### Step 4: Setup Backend

1. **Clone the Backend Repository**:
   ```bash
   git clone https://github.com/Kaewmanee64160234/CreatethinkBack_.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd CreatethinkBack
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run the Backend**:
   ```bash
   npm run start:dev
   ```

---

## Access the Platform

- Once both frontend and backend servers are running, you can access the platform at:
  [http://localhost:5173](http://localhost:5173)

---

## Project Structure

### Frontend
- **Framework**: Vue.js
- **Directory**: `crativethk_font`

### Backend
- **Framework**: NestJS
- **Directory**: `CreatethinkBack`

---

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

### Acknowledgments

- Special thanks to all contributors and developers who made this project possible.
- Inspired by the passion for promoting creative thinking and educational development.

---

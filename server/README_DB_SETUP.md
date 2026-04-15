# Database Setup Guide (SQL Server + Node.js)

This guide explains how to:

- Create the database
- Create a SQL user
- Configure SQL Server for Node.js
- Reset everything if errors occur

---

## 1. Create Database

Open SQL Server Management Studio (SSMS) and run:

```sql
CREATE DATABASE SODV1253;
GO

USE SODV1253;
GO
```

---

## 2. Create Users Table

```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO
```

---

## 3. Enable SQL Authentication

1. Right-click server → Properties
2. Go to **Security**
3. Select:

   ```
   SQL Server and Windows Authentication mode
   ```

4. Click OK
5. Restart SQL Server

---

## 4. Create SQL Login + User

```sql
-- Create login (server level)
CREATE LOGIN stockappuser WITH PASSWORD = 'Password123!';
GO

-- Use database
USE SODV1253;
GO

-- Create database user
CREATE USER stockappuser FOR LOGIN stockappuser;
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER stockappuser;
GO
```

---

## 5. Configure SQL Server for Node.js

### Enable TCP/IP

1. Open **SQL Server Configuration Manager**
2. Go to:

   ```
   SQL Server Network Configuration
   → Protocols for SQLEXPRESS
   ```

3. Enable **TCP/IP**

---

### Set Port to 1433

1. Open **TCP/IP Properties**
2. Go to **IP Addresses**
3. Scroll to **IPAll**
4. Set:

```
TCP Dynamic Ports = (empty)
TCP Port = 1433
```

5. Click OK

---

### Restart SQL Server

Go to:

```
SQL Server Services
```

Restart:

```
SQL Server (SQLEXPRESS)
```

---

## 6. Backend Environment Variables (.env)

```env
PORT=5000

DB_USER=stockappuser
DB_PASSWORD=Password123!
DB_SERVER=HANIGAIL
DB_PORT=1433
DB_NAME=SODV1253

JWT_SECRET=supersecretkey123
```

---

## 7. Test Connection

Run backend:

```bash
npm run dev
```

Expected output:

```
Connected to SQL Server
Server running on port 5000
```

---

## 8. Reset (If Errors Occur)

If you encounter login/user errors, run:

```sql
USE SODV1253;
GO

-- Remove database user
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'stockappuser')
    DROP USER stockappuser;
GO

-- Remove login
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'stockappuser')
    DROP LOGIN stockappuser;
GO

-- Recreate
CREATE LOGIN stockappuser WITH PASSWORD = 'Password123!';
GO

CREATE USER stockappuser FOR LOGIN stockappuser;
GO

ALTER ROLE db_owner ADD MEMBER stockappuser;
GO
```

---

## 9. Common Issues

### Connection Timeout (ETIMEOUT)

- TCP/IP not enabled
- Port not set to 1433
- SQL Server not restarted

### Login Failed

- Wrong password
- SQL Authentication not enabled

### Cannot Create User/Login

- Already exists → use reset script above

---

## 10. Notes

- Do not commit `.env` to Git
- Always restart SQL Server after config changes
- Use SQL Authentication for Node.js projects

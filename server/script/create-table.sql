CREATE DATABASE SODV1253;
GO

USE SODV1253;
GO

CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

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

USE SODV1253;

CREATE TABLE Watchlist (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Symbol NVARCHAR(20) NOT NULL,
    CompanyName NVARCHAR(100),
    AddedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    UNIQUE (UserId, Symbol)
);

CREATE TABLE Portfolio (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Symbol NVARCHAR(20) NOT NULL,
    CompanyName NVARCHAR(100),
    Quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    PurchasePrice DECIMAL(10,2),
    AddedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

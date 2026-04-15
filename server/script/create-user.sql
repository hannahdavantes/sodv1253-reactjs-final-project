CREATE LOGIN stockappuser WITH PASSWORD = 'Password123!';
GO

USE SODV1253;
GO

CREATE USER stockappuser FOR LOGIN stockappuser;
GO

ALTER ROLE db_owner ADD MEMBER stockappuser;
GO
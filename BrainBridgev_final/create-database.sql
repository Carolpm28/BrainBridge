-- create-database.sql
USE master;
GO

-- Criar nova base de dados
CREATE DATABASE BrainBridge;
GO

-- Usar a nova base de dados
USE BrainBridge;
GO

-- Verificar se foi criada
SELECT name FROM sys.databases WHERE name = 'BrainBridge';
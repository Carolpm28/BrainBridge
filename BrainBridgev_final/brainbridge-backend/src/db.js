require('dotenv').config();
const sql = require('mssql');

// Configurações da conexão com o banco de dados
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Carolina2013',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'BrainBridge',
  options: {
    encrypt: false, // Alterar para true em produção se usar SSL
    trustServerCertificate: true, // Alterar para false em produção
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Variável para armazenar a conexão pool
let pool = null;

// Função para conectar e obter o pool
const getPool = async () => {
  if (!pool) {
    console.log('Criando nova conexão com o banco de dados...');
    try {
      pool = await sql.connect(config);
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao conectar ao banco de dados:', err);
      pool = null;
      throw err;
    }
  }
  return pool;
};

// Conectar ao banco de dados na inicialização
const connectToDatabase = async () => {
  try {
    await getPool();
    // Testar a conexão com uma consulta simples
    const result = await sql.query`SELECT @@VERSION AS Version`;
    console.log(`Conectado ao SQL Server: ${result.recordset[0].Version}`);
    
    // Verificar tabelas essenciais
    const tables = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    
    console.log(`Tabelas encontradas: ${tables.recordset.length}`);
    const tableNames = tables.recordset.map(t => t.TABLE_NAME).join(', ');
    console.log(`Tabelas: ${tableNames}`);
    
    return true;
  } catch (err) {
    console.error('Falha na conexão inicial com o banco de dados:', err);
    return false;
  }
};

// Função auxiliar para executar consultas com retry
const executeQuery = async (query, params = {}, retryCount = 3) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    // Adicionar parâmetros à consulta
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    return await request.query(query);
  } catch (err) {
    console.error(`Erro na execução da consulta: ${err.message}`);
    
    // Se for um erro de conexão e ainda tiver retentativas
    if (err.code === 'ESOCKET' && retryCount > 0) {
      console.log(`Tentando reconectar... (${retryCount} tentativas restantes)`);
      pool = null; // Forçar nova conexão
      return executeQuery(query, params, retryCount - 1);
    }
    
    throw err;
  }
};

module.exports = {
  sql,
  connectToDatabase,
  executeQuery
};
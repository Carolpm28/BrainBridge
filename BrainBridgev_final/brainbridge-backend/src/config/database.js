const sql = require('mssql');
require('dotenv').config();

// Configuração básica
const config = {
    user: 'sa',
    password: 'Carolina2013',
    server: 'localhost',
    database: 'BrainBridge',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
};

class Database {
    static pool = null;
    
    static async connect() {
        try {
            if (!this.pool) {
                console.log('🔄 Conectando ao SQL Server...');
                console.log('Configuração:', {
                    server: config.server,
                    database: config.database
                });
                
                this.pool = await sql.connect(config);
                console.log('✅ Conectado ao SQL Server');
            }
            return this.pool;
        } catch (err) {
            console.error('❌ Erro na conexão SQL Server:', err.message);
            console.error('Código de erro:', err.code);
            throw err;
        }
    }
    
    static async query(sqlQuery, params = {}) {
        try {
            await this.connect();
            const request = this.pool.request();
            
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });
            
            const result = await request.query(sqlQuery);
            return result.recordset;
        } catch (err) {
            console.error('Erro na query:', err.message);
            throw err;
        }
    }
}

module.exports = Database;
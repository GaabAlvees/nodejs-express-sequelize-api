const { Sequelize } = require('sequelize')  //desestruturando o objeto, para poder utilizar a classe do Sequelize

const sequelize = new Sequelize('nodejs_express_sequelize_sample', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
});

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Tabelas sincronizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar tabelas:', error);
  }
}

try {
  sequelize.authenticate()
  console.log('Conectamos com o Sequelize!')
} catch (error) {
  console.error('Não foi possível conectar:', error)
}

module.exports = sequelize

//Config Sequelize com o bando de Dados

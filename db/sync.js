const sequelize = require('./conn');

const Turma = require('../models/Turma.js');
const Materia = require('../models/Materia.js')
const Aluno = require('../models/Aluno.js');
const AssocAluMat = require('../models/AssocAluMat.js')

async function syncDatabase() {
    try {

        await Turma.sync();
        await Materia.sync();
        await Aluno.sync();
        await AssocAluMat.sync();


        console.log('Tabelas sincronizadas com sucesso.');

    } catch (error) {

        console.error('Erro ao sincronizar tabelas:', error);
    }
}

module.exports = { syncDatabase };







// Cria/Sincroniza as tabelas correspondente as models.

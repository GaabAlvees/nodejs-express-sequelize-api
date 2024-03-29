const { DataTypes } = require('sequelize'); //desestruturando o objeto, para poder utilizar a classe DataTypes
                                            //contem os modelos de dados para trabalhar com sequelize Number, String etc
const db = require('../db/conn');

const Turma = db.define('Turma');

const Aluno = db.define('Aluno', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

//Relacionamentos

Aluno.belongsTo(Turma, { foreignKey: 'turmaId' });


module.exports = Aluno;

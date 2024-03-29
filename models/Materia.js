const { DataTypes } = require('sequelize');

const db = require('../db/conn');

const Turma = db.define('Turma');

const Aluno = db.define('Aluno');

const AssocAluMat = db.define('AssocAluMat')

const Materia = db.define('Materia', {
    Disciplina: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},  {

    tableName: 'Materias',

});

//Relacionamentos

Materia.associate = function (models) {
    Materia.belongsToMany(models.Turma, { through: models.AssocAluMat, foreignKey: 'materiaId' });
};

module.exports = Materia;




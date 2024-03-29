const { DataTypes } = require ('sequelize')

const db = require('../db/conn');

const AssocAluMat = db.define('AssocAluMat')

const Aluno = db.define('Aluno');

const Materia = db.define('Materia')


const Turma = db.define('Turma', {
    Serie:{
        type: DataTypes.STRING,
        allowNull: false,
    },
});

//Relacionamentos

Turma.associate = function (models) {
    Turma.hasMany(models.Aluno, { foreignKey: 'turmaId' });
    Turma.belongsToMany(models.Materia, { through: models.AssocAluMat, foreignKey: 'turmaId' });
};



module.exports = Turma;

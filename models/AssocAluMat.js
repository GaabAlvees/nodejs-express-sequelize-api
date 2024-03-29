// AssocAlunoMateria.js

const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const Materia = db.define('./Materia.js')

const AssocAluMat = db.define('AssocAluMat', {
    turmaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    materiaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

AssocAluMat.associate = function (models) {
    AssocAluMat.belongsTo(models.Materia, { foreignKey: 'materiaId' });
};



module.exports = AssocAluMat;

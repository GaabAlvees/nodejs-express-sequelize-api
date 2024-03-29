const express = require('express');  // criar/gerenc servidor web
const app = express();
const port = 3000;

const { syncDatabase } = require('./db/sync');

const Turma = require('./models/Turma');

const Materia = require('./models/Materia');

const Aluno = require('./models/Aluno');

const AssocAluMat = require('./models/AssocAluMat')

const apiRoutes = require('./routes/apiRoutes');

syncDatabase();

app.use('/', apiRoutes);  //avisa o express para aplicar todas as rotas que iniciam com "/" , no caso todas

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})








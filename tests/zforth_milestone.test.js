const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../routes/apiRoutes');
const agent = supertest.agent(app);
const { syncDatabase } = require('../db/sync');
const { afterEach, beforeEach } = require('mocha');

describe('User API - Test 4', () => {
    let createdAlunoId;
    let createdTurmaId;
    let createdMateriaId;

    beforeEach(async () => {

        await syncDatabase();
    });

    afterEach(async () => {

    });


    it('Teste rota post Materia status 201 -  /materia', async () => {
        const newMateria = {
            Disciplina: "Português",
        };

        const createResponse = await agent.post('/materia').send(newMateria);

        expect(createResponse.statusCode).equals(201);
        createdMateriaId = createResponse.body.id;

        const getResponse = await agent.get(`/materia/${createdMateriaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Disciplina).equals("Português");

        const deleteResponse = await agent.delete(`/materia/delete/${createdMateriaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota post Materia status 200 : /materia', async () => {

        const mat1 = { Disciplina: 'TesteMat' };
        const mat2 = { Disciplina: 'TesteMat' };

        const createMat1 = await agent.post('/materia').send(mat1);
        const createMat2 = await agent.post('/materia').send(mat2);

        expect(createMat1.statusCode).equals(201);
        expect(createMat2.statusCode).equals(200);

        createdMateriaId = createMat2.body.id;

        const getResponse = await agent.get(`/materia/${createdMateriaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Disciplina).equals("TesteMat");

        const deleteResponse = await agent.delete(`/materia/delete/${createdMateriaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });


    it('Teste rota get materia/:id', async () => {

        const materiaTeste = { Disciplina: 'DisciplinaTeste' };

        const createResponse = await agent.post('/materia').send(materiaTeste);

        expect(createResponse.statusCode).equals(201);
        createdMateriaId = createResponse.body.id;

        const getResponse = await agent.get(`/materia/${createdMateriaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Disciplina).equals("DisciplinaTeste");

        const deleteResponse = await agent.delete(`/materia/delete/${createdMateriaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota findall /materias', async () => {

        const matTeste = { Disciplina: 'Disciplina1' };

        const createMat = await agent.post('/materia').send(matTeste);
        expect(createMat.statusCode).equals(201);
        createdMatId = createMat.body.id;

        const getResponse = await agent.get('/materias');
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body[0].Disciplina).equals("Disciplina1");

        const deleteResponse = await agent.delete(`/materia/delete/${createdMatId}`);
        expect(deleteResponse.statusCode).equals(200);

    });

    it('Teste POST add Materia to Turma', async () => {

        const matTeste = { Disciplina: 'DisciplinaTeste' };
        const createMat = await agent.post('/materia').send(matTeste);
        expect(createMat.statusCode).equals(201);
        createdMatId = createMat.body.id;

        const turmaTeste = { Serie: '1ª Série' }
        const createTurma = await agent.post('/turma').send(turmaTeste);
        expect(createTurma.statusCode).equals(201);
        const createTurmaId = createTurma.body.id;

        const response = await agent.post(`/materia/${createdMatId}/toturma/${createTurmaId}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('mensagem', 'Disciplina adicionada à turma com sucesso.');
        expect(response.body).to.have.property('materia');
        expect(response.body.materia).to.have.property('id');
        expect(response.body.materia).to.have.property('Disciplina', 'DisciplinaTeste');
        expect(response.body.materia).to.have.property('turma');
        expect(response.body.materia.turma).to.have.property('Serie', '1ª Série');
        expect(response.body.materia.turma).to.have.property('turmaId', createTurmaId);


        const deleteResponseMat = await agent.delete(`/materia/delete/${createdMatId}`);
        expect(deleteResponseMat.statusCode).equals(200);

        const deleteResponseTurma = await agent.delete(`/turma/delete/${createTurmaId}`);
        expect(deleteResponseTurma.statusCode).equals(200);
    });

    it('Teste PUT materia', async () => {

        const matTeste = { Disciplina: 'Português' };

        const createResponse = await agent.post('/materia').send(matTeste);

        expect(createResponse.statusCode).equals(201);
        createdMateriaId = createResponse.body.id;

        const putMateria = { novaDisciplina: 'MatAlterada' };

        const updateResponse = await agent.put(`/materia/${createdMateriaId}`).send(putMateria);
        expect(updateResponse.status).to.equal(200);
        expect(updateResponse.body).to.have.property('mensagem', 'Nome da disciplina alterado com sucesso.');

        const getResponse = await agent.get(`/materia/${createdMateriaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Disciplina).equals("MatAlterada");

        const deleteResponse = await agent.delete(`/materia/delete/${createdMateriaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('GET Todas as Materias da Turma /allmaterias/inturma/id', async () => {
        // Criar alunos
        const materia1 = { Disciplina: 'Inglês' };
        const materia2 = { Disciplina: 'Francês' };

        const responseMat1 = await agent.post('/materia').send(materia1);
        const responseMat2 = await agent.post('/materia').send(materia2);

        expect(responseMat1.statusCode).to.equal(201);
        expect(responseMat2.statusCode).to.equal(201);

        const firstMat = responseMat1.body.id;
        const secondMat = responseMat2.body.id;


        const turma = { Serie: '1ª Série' };
        const responseTurma = await agent.post('/turma').send(turma);

        expect(responseTurma.statusCode).to.equal(201);
        const turmaId = responseTurma.body.id;


        await agent.post(`/materia/${firstMat}/toturma/${turmaId}`);
        await agent.post(`/materia/${secondMat}/toturma/${turmaId}`);


        const response = await agent.get(`/allmaterias/inturma/${turmaId}`);

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('object');

        const expected = `Disciplinas da ${responseTurma.body.Serie}`;

        expect(response.body).to.have.property(expected).that.is.an('array');

        const disciplinasArray = response.body[expected];
        expect(disciplinasArray).to.have.lengthOf(2);

        const responseMateria1 = disciplinasArray.find((materia) => materia.materiaId === firstMat);
        const responseMateria2 = disciplinasArray.find((materia) => materia.materiaId === secondMat);

        expect(responseMateria1).to.exist;
        expect(responseMateria2).to.exist;

        expect(responseMateria1.disciplina).to.equal('Inglês');
        expect(responseMateria2.disciplina).to.equal('Francês');

        const deleteMateria1 = await agent.delete(`/materia/delete/${firstMat}`);
        expect(deleteMateria1.statusCode).equals(200);

        const deleteMateria2 = await agent.delete(`/materia/delete/${secondMat}`);
        expect(deleteMateria2.statusCode).equals(200);

        const deleteTurma = await agent.delete(`/turma/delete/${turmaId}`);
        expect(deleteTurma.statusCode).equals(200);
    });

    it('DELETE Materia de uma Turma Específica /allmaterias/inturma/id', async () => {

        const materia = { Disciplina: 'Inglês' };

        const responseMat1 = await agent.post('/materia').send(materia);

        expect(responseMat1.statusCode).to.equal(201);

        const firstMat = responseMat1.body.id;


        const turma1 = { Serie: '1ª Série' };
        const responseTurma1 = await agent.post('/turma').send(turma1);

        const turma2 = { Serie: '2ª Série' };
        const responseTurma2 = await agent.post('/turma').send(turma2);

        expect(responseTurma1.statusCode).to.equal(201);
        expect(responseTurma2.statusCode).to.equal(201);

        const firstTurmaId = responseTurma1.body.id;
        const secondTurmaId = responseTurma2.body.id;


        const firstRes = await agent.post(`/materia/${firstMat}/toturma/${firstTurmaId}`);
        expect(firstRes.status).to.equal(200);

        const secondRes = await agent.post(`/materia/${firstMat}/toturma/${secondTurmaId}`);
        expect(secondRes.status).to.equal(200);


        const firstResponse = await agent.get(`/allmaterias/inturma/${firstTurmaId}`);

        expect(firstResponse.statusCode).to.equal(200);
        expect(firstResponse.body).to.be.an('object');

        const firstExpected = `Disciplinas da ${responseTurma1.body.Serie}`;

        expect(firstResponse.body).to.have.property(firstExpected).that.is.an('array');

        const disciplinasArray = firstResponse.body[firstExpected];
        expect(disciplinasArray).to.have.lengthOf(1);


        const secondResponse = await agent.get(`/allmaterias/inturma/${secondTurmaId}`);

        expect(secondResponse.statusCode).to.equal(200);
        expect(secondResponse.body).to.be.an('object');

        const secondExpected = `Disciplinas da ${responseTurma2.body.Serie}`;

        expect(secondResponse.body).to.have.property(secondExpected).that.is.an('array');

        const disciplinArray = secondResponse.body[secondExpected];
        expect(disciplinArray).to.have.lengthOf(1);


        const deleteDiscipline = await agent.delete(`/materia/${firstMat}/turma/${firstTurmaId}/delete`);
        expect(deleteDiscipline.statusCode).equals(200);


        const checkDelete = await agent.get(`/allmaterias/inturma/${firstTurmaId}`);

        expect(checkDelete.statusCode).to.equal(200);
        expect(checkDelete.body).to.be.an('object');

        const expectedDelete = `Disciplinas da ${responseTurma1.body.Serie}`;

        expect(checkDelete.body).to.have.property(expectedDelete).that.is.an('array');

        const disciplinas = checkDelete.body[expectedDelete];
        expect(disciplinas).to.have.lengthOf(0);


        const newCheck = await agent.get(`/allmaterias/inturma/${secondTurmaId}`);

        expect(newCheck.statusCode).to.equal(200);
        expect(newCheck.body).to.be.an('object');


        const expectedSec = `Disciplinas da ${responseTurma2.body.Serie}`;


        expect(newCheck.body).to.have.property(expectedSec).that.is.an('array');

        const disciplines = newCheck.body[expectedSec];
        expect(disciplines).to.have.lengthOf(1);


        const deleteMateria1 = await agent.delete(`/materia/delete/${firstMat}`);
        expect(deleteMateria1.statusCode).equals(200);


        const deleteTurma1 = await agent.delete(`/turma/delete/${firstTurmaId}`);
        expect(deleteTurma1.statusCode).equals(200);

        const deleteTurma2 = await agent.delete(`/turma/delete/${secondTurmaId}`);
        expect(deleteTurma2.statusCode).equals(200);

    });

    it('GET all info Aluno+Serie+Disciplinas', async () => {

        const aluno = { name: 'Gabriel' };
        const responseAluno = await agent.post('/aluno').send(aluno);
        expect(responseAluno.statusCode).to.equal(200);
        const alunoId = responseAluno.body.id;

        const turma = { Serie: '1ª Série' };
        const responseTurma = await agent.post('/turma').send(turma);
        expect(responseTurma.statusCode).to.equal(201);
        const turmaId = responseTurma.body.id;

        const addAluno = await agent.post(`/addaluno/${alunoId}/toturma/${turmaId}`);
        expect(addAluno.status).to.equal(200);
        expect(addAluno.body).to.have.property('mensagem', 'Aluno adicionado à turma com sucesso.');

        const materia = { Disciplina: 'Matemática' };
        const createdMateria = await agent.post('/materia').send(materia);
        expect(createdMateria.statusCode).equals(201);
        materiaId = createdMateria.body.id;

        const addMateria = await agent.post(`/materia/${materiaId}/toturma/${turmaId}`);

        expect(addMateria.status).to.equal(200);
        expect(addMateria.body).to.have.property('mensagem', 'Disciplina adicionada à turma com sucesso.');


        const allInfo = await agent.get(`/allinfo/aluno/${alunoId}`);
        expect(allInfo.status).to.equal(200);

        const expectResult = {
            Aluno: {
                id: alunoId,
                name: aluno.name,
            },
            Turma: {
                Serie: turma.Serie,
            },
            Disciplinas: {
                [`Disciplinas da ${turma.Serie}`]: [
                    {
                        materiaId: materiaId,
                        disciplina: materia.Disciplina,
                    },
                ],
            },
        };

        expect(allInfo.body).to.deep.equal(expectResult); //verificação mais profunda, se tem os mesmos valores em todas as propriedades
    });


});






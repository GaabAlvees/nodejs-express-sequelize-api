const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../routes/apiRoutes');
const agent = supertest.agent(app);
const { syncDatabase } = require('../db/sync');
const { afterEach, beforeEach } = require('mocha');

describe('User API Test 2-3', () => {
    let createdAlunoId;
    let createdTurmaId;

    beforeEach(async () => {
        await syncDatabase();
    });

    afterEach(async () => {
        if (createdAlunoId) {
            await agent.delete(`/aluno/${createdAlunoId}`);
        };

        });

    it('Teste rota post /aluno', async () => {
        const newAluno = {
            name: "Primeiro Aluno",
        };

        const createResponse = await agent.post('/aluno').send(newAluno);
        expect(createResponse.statusCode).equals(200);
        createdAlunoId = createResponse.body.id;

        const getResponse = await agent.get(`/aluno/${createdAlunoId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.name).equals("Primeiro Aluno");

        const deleteResponse = await agent.delete(`/aluno/delete/${createdAlunoId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota GET /aluno - StatusCode 200', async () => {

        const newAluno = {
            name: "Aluno Test GET"
        };

        const createResponse = await agent.post('/aluno').send(newAluno);
        expect(createResponse.statusCode).equals(200);
        const createdAlunoId = createResponse.body.id;

        const getResponse = await agent.get('/alunos');
        expect(getResponse.statusCode).equals(200);

        const findAluno = getResponse.body.find(aluno => aluno.name === "Aluno Test GET");
        expect(findAluno).to.exist;

        const deleteResponse = await agent.delete(`/aluno/delete/${createdAlunoId}`);
        expect(deleteResponse.statusCode).equals(200);

    });

    it('Teste rota GET /aluno/:id - StatusCode 200', async () => {

        const newAluno = {
            name: "Teste GET aluno pelo iD"
        };

        const createResponse = await agent.post('/aluno').send(newAluno);
        expect(createResponse.statusCode).equals(200);
        const createdAlunoId = createResponse.body.id;

        const getResponse = await agent.get(`/aluno/${createdAlunoId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.name).equals("Teste GET aluno pelo iD");

        const deleteResponse = await agent.delete(`/aluno/delete/${createdAlunoId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota GET /aluno/:id - StatusCode 404', async () => { //id inexistente

        const getResponse = await agent.get(`/aluno/-1`);

        expect(getResponse.statusCode).equals(404);
        expect(getResponse.body).to.have.property('message').equal('Não há alunos com este id');
    });

    it('Teste rota PUT /aluno/:id ', async () => {

        const newAluno = {
            name: "Teste PUT aluno "
        };

        const createResponse = await agent.post('/aluno').send(newAluno);
        expect(createResponse.statusCode).equals(200);
        const createdAlunoId = createResponse.body.id;


        const updateResponse = await agent.put(`/aluno/${createdAlunoId}`).send({
            name: 'Aluno Atualizado',
        });

        expect(updateResponse.statusCode).equals(200);
        expect(updateResponse.body).to.have.property('message', 'Aluno atualizado com sucesso.');


        const getUpdatedResponse = await agent.get(`/aluno/${createdAlunoId}`);
        expect(getUpdatedResponse.statusCode).equals(200);
        expect(getUpdatedResponse.body.name).equals('Aluno Atualizado');

        const deleteResponse = await agent.delete(`/aluno/delete/${createdAlunoId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota post TURMA status 201 : /turma', async () => {
        const newTurma = {
            Serie: "1ª Série",
        };

        const createResponse = await agent.post('/turma').send(newTurma);

        expect(createResponse.statusCode).equals(201);
        createdTurmaId = createResponse.body.id;

        const getResponse = await agent.get(`/turma/${createdTurmaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Serie).equals("1ª Série");

        const deleteResponse = await agent.delete(`/turma/delete/${createdTurmaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota post TURMA status 200 : /turma', async () => {

        const turma1 = { Serie : 'testeTurma' };
        const turma2 = { Serie: 'testeTurma' };

        const createdTurma1 = await agent.post('/turma').send(turma1);
        const createdTurma2 = await agent.post('/turma').send(turma2);

        expect(createdTurma1.statusCode).equals(201);
        expect(createdTurma2.statusCode).equals(200);

        createdTurmaId = createdTurma2.body.id;

        const getResponse = await agent.get(`/turma/${createdTurmaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Serie).equals("testeTurma");

        const deleteResponse = await agent.delete(`/turma/delete/${createdTurmaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });


    it('Teste rota GET /turmas - StatusCode 200', async () => {

        const newTurma = {
            Serie: "Serie Teste"
        };

        const createResponse = await agent.post('/turma').send(newTurma);
        expect(createResponse.statusCode).equals(201);
        createdTurmaId = createResponse.body.id;

        const getResponse = await agent.get('/turmas');
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body[0].Serie).equals("Serie Teste");

        const deleteResponse = await agent.delete(`/turma/delete/${createdTurmaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste rota GET /turma - StatusCode 200', async () => {

        const newTurma = {
            Serie: "Serie Teste"
        };

        const createResponse = await agent.post('/turma').send(newTurma);
        expect(createResponse.statusCode).equals(201);
        createdTurmaId = createResponse.body.id;

        const getResponse = await agent.get(`/turma/${createdTurmaId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.Serie).equals("Serie Teste");

        const deleteResponse = await agent.delete(`/turma/delete/${createdTurmaId}`);
        expect(deleteResponse.statusCode).equals(200);
    });

    it('Teste POST add Aluno to Turma', async () => {

        const newAluno = {
            name: "João"
        };

        const createResponseAluno = await agent.post('/aluno').send(newAluno);
        expect(createResponseAluno.statusCode).equals(200);
        const createdAlunoId = createResponseAluno.body.id;

        const newTurma = {
            Serie: "8ª Série"
        };

        const createResponseTurma = await agent.post('/turma').send(newTurma);
        expect(createResponseTurma.statusCode).equals(201);
        createdTurmaId = createResponseTurma.body.id;

        const response = await agent.post(`/addaluno/${createdAlunoId}/toturma/${createdTurmaId}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('mensagem', 'Aluno adicionado à turma com sucesso.');
        expect(response.body).to.have.property('aluno');
        expect(response.body.aluno).to.have.property('id');
        expect(response.body.aluno).to.have.property('name', 'João');
        expect(response.body.aluno).to.have.property('turma');
        expect(response.body.aluno.turma).to.have.property('Serie', '8ª Série');
        expect(response.body.aluno.turma).to.have.property('turmaId', createdTurmaId);

        const deleteResponseTurma = await agent.delete(`/turma/delete/${createdTurmaId}`);
        expect(deleteResponseTurma.statusCode).equals(200);

        const deleteResponseAluno = await agent.delete(`/aluno/delete/${createdAlunoId}`);
        expect(deleteResponseAluno.statusCode).equals(200);
    });

    it('Teste PUT Aluno in Turma', async () => {

        const newAluno = { name: "Amarildo" };

        const createResponseAluno = await agent.post('/aluno').send(newAluno);
        expect(createResponseAluno.statusCode).equals(200);
        const createdAlunoId = createResponseAluno.body.id;

        const newTurma = { Serie: "1ª Série" };

        const createResponseTurma = await agent.post('/turma').send(newTurma);
        expect(createResponseTurma.statusCode).equals(201);
        createdTurmaId = createResponseTurma.body.id;

        const putTurma = {
            Serie: "2ª Série"
        };

        const CreateAttResponseTurma = await agent.post('/turma').send(putTurma);
        expect(CreateAttResponseTurma.statusCode).equals(201);
        putTurmaId = CreateAttResponseTurma.body.id;


        const response = await agent.post(`/addaluno/${createdAlunoId}/toturma/${createdTurmaId}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('mensagem', 'Aluno adicionado à turma com sucesso.');
        expect(response.body).to.have.property('aluno');
        expect(response.body.aluno).to.have.property('id');
        expect(response.body.aluno).to.have.property('name', 'Amarildo');
        expect(response.body.aluno).to.have.property('turma');
        expect(response.body.aluno.turma).to.have.property('Serie', '1ª Série');
        expect(response.body.aluno.turma).to.have.property('turmaId', createdTurmaId);

        const getResponse = await agent.get(`/aluno/${createdAlunoId}`);
        expect(getResponse.statusCode).equals(200);
        expect(getResponse.body.name).equals("Amarildo");
        expect(getResponse.body.turmaId).equals(createdTurmaId);

        const updateResponse = await agent.put(`/aluno/${createdAlunoId}/mudarturma`).send({
            "novaTurmaId": putTurmaId,
        });

        expect(updateResponse.statusCode).equals(200);
        expect(updateResponse.body).to.have.property('mensagem').to.equal('Nova Turma atualizada com sucesso.');

        const PutResponse = await agent.get(`/aluno/${createdAlunoId}`);
        expect(PutResponse.statusCode).equals(200);
        expect(PutResponse.body.name).equals("Amarildo");
        expect(PutResponse.body.turmaId).equals(putTurmaId);

        const deleteResponseTurma = await agent.delete(`/turma/delete/${createdTurmaId}`);
        expect(deleteResponseTurma.statusCode).equals(200);

        const deletePutTurma = await agent.delete(`/turma/delete/${putTurmaId}`);
        expect(deletePutTurma.statusCode).equals(200);

        const deleteResponseAluno = await agent.delete(`/aluno/delete/${createdAlunoId}`);
        expect(deleteResponseAluno.statusCode).equals(200);
    });

    it('GET Todos alunos da turma : /turma/:turmaId/alunos', async () => {
        // Criar alunos
        const aluno1 = { name: 'Claudio' };
        const aluno2 = { name: 'Marilia' };

        const responseAluno1 = await agent.post('/aluno').send(aluno1);
        const responseAluno2 = await agent.post('/aluno').send(aluno2);

        expect(responseAluno1.statusCode).to.equal(200);
        expect(responseAluno2.statusCode).to.equal(200);

        const alunoId1 = responseAluno1.body.id;
        const alunoId2 = responseAluno2.body.id;

        // Criar turma
        const turma = { Serie: '1ª Série' };
        const responseTurma = await agent.post('/turma').send(turma);

        expect(responseTurma.statusCode).to.equal(201);
        const turmaId = responseTurma.body.id;

        // Adicionar alunos à turma
        await agent.post(`/addaluno/${alunoId1}/toturma/${turmaId}`);
        await agent.post(`/addaluno/${alunoId2}/toturma/${turmaId}`);

        // Obter alunos da turma
        const response = await agent.get(`/turma/${turmaId}/alunos`);

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('array').that.has.lengthOf(2); //verifica se o corpo da resposta é um array, e se tem "comprimento", de 2 elementos

        //find no array
        const answer1 = response.body.find((aluno) => aluno.id === alunoId1); //verifica se o ID do obj aluno é igual ao alunoId1
        const answer2 = response.body.find((aluno) => aluno.id === alunoId2); //verifica se o ID do obj aluno é igual ao alunoId1

        expect(answer1).to.exist;
        expect(answer2).to.exist;

        expect(answer1.name).to.equal('Claudio');
        expect(answer2.name).to.equal('Marilia');

        const deleteAluno1 = await agent.delete(`/aluno/delete/${alunoId1}`);
        expect(deleteAluno1.statusCode).equals(200);

        const deleteAluno2 = await agent.delete(`/aluno/delete/${alunoId2}`);
        expect(deleteAluno2.statusCode).equals(200);

        const deleteTurma = await agent.delete(`/turma/delete/${turmaId}`);
        expect(deleteTurma.statusCode).equals(200);

    });


});





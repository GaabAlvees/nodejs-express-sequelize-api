const express = require('express');

const app = express()

const conn = require('../db/conn');

const Aluno = require('../models/Aluno')

const Turma = require('../models/Turma')

const Materia = require('../models/Materia')

const AssocAluMat = require('../models/AssocAluMat')

const bodyParser = require('body-parser'); //middleware para analisar o corpo das requisições

app.use(bodyParser.urlencoded({
    extended: true  //true = valores podem ser objetos ou arrays
}));

app.use(bodyParser.json()); //informo ao bodyParser que sera em formato JSON

app.get('/hello-world', (req, res) => {
    const name = req.query.name || 'world'; //?name=  direto na rota
    res.send(`Hello ${name}!`);
});

app.get('/hello-world/:name', (req, res) => {
    const name = req.params.name;   //name como parametro de rota
    res.send(`Hello ${name}!`);

});

app.post('/aluno', async (req, res) => {

    const newAluno = {
        name: req.body.name
    };

    try {
        const addAluno = await Aluno.create(newAluno);
        res.send(addAluno);
    } catch (error) {
        res.status(500).send({ error: "Falha ao cadastrar Aluno." });
    }
});

app.get('/alunos', async (req, res) => {
    try {
        const allAlunos = await Aluno.findAll();
        res.json(allAlunos);

    } catch (err) {
        res.status(500).send({ error: "Falha ao buscar alunos." });
    }
});

app.get('/aluno/:id', async (req, res) => {
    try {
        const alunoId = req.params.id
        const aluno = await Aluno.findByPk(alunoId);

        if (aluno) {

            res.status(200).json(aluno);

        } else {
            res.status(404).json({ message: "Não há alunos com este id" })
        }

    } catch (err) {
        console.error('Erro ao buscar aluno:', err);
        res.status(500).send({ error: "Falha ao Buscar Aluno." });
    }
});

app.put('/aluno/:id', async (req, res) => {

    const alunoId = req.params.id;

    const updateAluno = {
        name: req.body.name
    };

    try {
        const aluno = await Aluno.findByPk(alunoId);

        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado." })
        }

        await aluno.update(updateAluno);

        res.send({ message: "Aluno atualizado com sucesso." });

    } catch (err) {
        console.error('Erro durante a atualização:', err);
        res.status(500).send({ error: "Falha ao atualizar Aluno." });
    }
});

app.get('/allinfo/aluno/:id', async (req, res) => {
    try {
        const alunoId = req.params.id;
        const aluno = await Aluno.findByPk(alunoId);

        if (!aluno) {
            return res.status(404).send({ mensagem: 'Aluno não encontrado' });
        }

        // Busca a turma do aluno
        const turma = await Turma.findByPk(aluno.turmaId);
        if (!turma) {
            return res.status(404).send({ mensagem: 'Turma não encontrada para o aluno' });
        }

        const serie = turma.Serie;

        // Busca as disciplinas associadas à turma do aluno
        const associacoes = await AssocAluMat.findAll({
            where: { turmaId: turma.id },
        });

        const materiaIds = associacoes.map(assoc => assoc.materiaId);

        const disciplinas = await Materia.findAll({
            where: { id: materiaIds },
        });

        const alunoInfo = {
            id: aluno.id,
            name: aluno.name,
        };

        const turmaInfo = {

            Serie: turma.Serie,
        };

        const disciplinasInfo = disciplinas.map(materia => ({
            materiaId: materia.id,
            disciplina: materia.Disciplina,
        }));

        // Monta o objeto de resposta
        const result = {
            Aluno: alunoInfo,
            Turma: turmaInfo,
            Disciplinas: {
                [`Disciplinas da ${turmaInfo.Serie}`]: disciplinasInfo,
            },
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar informações do aluno:', error);
        res.status(500).json({ error: 'Erro ao buscar informações do aluno.' });
    }
});


app.delete('/aluno/delete/:id', async (req, res) => {
    const alunoId = req.params.id

    try {

        const aluno = await Aluno.findByPk(alunoId);

        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado." })
        }

        await aluno.destroy();

        res.status(200).json({ message: "Aluno excluído com sucesso!" });


    } catch (error) {
        console.error('Erro durante a exclusão:', error);
        res.status(500).send({ error: "Falha ao deletar Aluno." });
    }
});

app.post('/turma', async (req, res) => {

    const serie = req.body.Serie;

    try {

        const turmaexist = await Turma.findOne({ where: { Serie: serie } });

        if (turmaexist) {
            res.status(200).json(turmaexist);

        } else {

            const novaTurma = await Turma.create({ Serie: serie });
            res.status(201).json(novaTurma);
        }

    } catch (error) {

        console.error('Erro ao criar ou verificar turma:', error);
        res.status(500).json({ mensagem: 'Erro ao criar ou verificar turma', erro: error.message });
    }
});

app.get('/turmas', async (req, res) => {
    try {
        const allTurmas = await Turma.findAll();
        res.status(200).json(allTurmas);

    } catch (err) {
        res.status(500).send({ error: "Falha ao Buscar Turmas." });
    }
});

app.get('/turma/:id', async (req, res) => {
    try {
        const turmaId = req.params.id
        const turma = await Turma.findByPk(turmaId);

        if (turma) {

            res.status(200).json(turma);

        } else {
            res.status(404).json({ message: "Não há turma cadastrada com este id" })
        }

    } catch (err) {
        console.error('Erro ao buscar turma:', error);
        res.status(500).send({ error: "Falha ao Buscar Turma." });
    }
});


app.post('/addaluno/:alunoId/toturma/:turmaId', async (req, res) => {

    const alunoId = req.params.alunoId;
    const turmaId = req.params.turmaId;

    try {

        const aluno = await Aluno.findByPk(alunoId);

        if (!aluno) {
            return res.status(404).json({ error: "Aluno não encontrado." });
        }


        const turma = await Turma.findByPk(turmaId);

        if (!turma) {
            return res.status(404).json({ error: "Turma não encontrada." });
        }

        aluno.turmaId = turmaId;   //atualiza a propriedade turmaID do obj Aluno.
        await aluno.save();

        const attAluno = await Aluno.findByPk(alunoId, { include: Turma }); //nova consulta para obter aluno atualizado.

        res.status(200).json({

            mensagem: 'Aluno adicionado à turma com sucesso.',
            aluno: {
                id: attAluno.id,
                name: attAluno.name,
                turma: attAluno.Turma ? {     //verifica se existe a propriedade TURMA em attAluno
                    Serie: attAluno.Turma.Serie,
                    turmaId: attAluno.turmaId

                } : null
            }
        });

    } catch (error) {
        console.error('Erro ao adicionar aluno à turma:', error);
        res.status(500).json({ mensagem: 'Erro ao adicionar aluno à turma', erro: error.message });
    }
});

app.get('/turma/:turmaId/alunos', async (req, res) => {

    try {
        const turmaId = req.params.turmaId;
        const alunosDaTurma = await Aluno.findAll({
            where: {
                turmaId: turmaId
            },
            include: {
                model: Turma,
                attributes: ['Serie']
            },
            attributes: ['id', 'name']
        });

        res.status(200).json(alunosDaTurma);
    } catch (err) {
        console.error('Erro ao buscar alunos desta turma:', err);
        res.status(500).send({ error: "Falha ao buscar alunos desta turma." });
    }
});

app.put('/aluno/:alunoId/mudarturma', async (req, res) => {
    try {
        const alunoId = req.params.alunoId;
        const novaTurmaId = req.body.novaTurmaId;


        const aluno = await Aluno.findByPk(alunoId);

        if (!aluno) {
            return res.status(404).json({ error: "Aluno não encontrado." });
        }


        const novaTurma = await Turma.findByPk(novaTurmaId);


        if (!novaTurma) {

            return res.status(404).json({ error: "Nova turma não encontrada." });
        }


        aluno.turmaId = novaTurmaId; //atualiza a propriedade turmaId do obj aluno

        await aluno.save();

        res.status(200).json({ mensagem: 'Nova Turma atualizada com sucesso.' });

    } catch (error) {

        console.error('Erro ao mudar turma do aluno:', error);
        res.status(500).json({ mensagem: 'Erro ao mudar turma do aluno', erro: error.message });
    }
});

app.delete('/turma/delete/:id', async (req, res) => {
    const turmaId = req.params.id

    try {
        const turma = await Turma.findByPk(turmaId);


        if (!turma) {
            return res.status(404).json({ message: "Turma não encontrada." })
        }

        await turma.destroy();

        res.send({ message: "Turma deletada com sucesso!" });


    } catch (error) {
        console.error('Erro durante a exclusão:', error);
        res.status(500).send({ error: "Falha ao deletar Turma." });
    }
});

app.post('/materia', async (req, res) => {

    const newMateria = req.body.Disciplina ;

    try {

        const materiaExist = await Materia.findOne({ where: { Disciplina: newMateria } });

        if (materiaExist) {

            res.status(200).json(materiaExist);
        } else {

            const novaMateria = await Materia.create({ Disciplina: newMateria });
            res.status(201).json(novaMateria);
        }
    } catch (error) {
        console.error('Erro ao criar ou verificar disciplina:', error);
        res.status(500).json({ mensagem: 'Erro ao criar disciplina', erro: error.message });
    }

});

app.get('/materia/:id', async (req, res) => {
    try {
        const materiaId = req.params.id
        const materia = await Materia.findByPk(materiaId);

        if (materia) {

            res.status(200).json(materia);

        } else {
            res.status(404).json({ message: "Não há Disciplina cadastrada com este id" })
        }

    } catch (err) {
        console.error('Erro ao buscar Disciplina:', error);
        res.status(500).send({ error: "Falha ao Buscar Disciplina." });
    }
});

app.get('/materias', async (req, res) => {
    try {
        const allMaterias = await Materia.findAll();
        res.status(200).json(allMaterias);

    } catch (err) {
        res.status(500).send({ error: "Falha ao Buscar Disciplinas." });
    }
});

app.post('/materia/:materiaId/toturma/:turmaId', async (req, res) => {

    const materiaId = req.params.materiaId;
    const turmaId = req.params.turmaId;

    try {

        const materia = await Materia.findByPk(materiaId);
        const turma = await Turma.findByPk(turmaId);

        if (!materia || !turma) {
            res.status(404).json({ mensagem: 'Matéria ou Turma não encontrada' });
            return;
        }


        await AssocAluMat.create({ turmaId: turma.id, materiaId: materia.id });  //acessando a propriedade ID de turma e materia. Usado no FindByPK

        const respostaJSON = {
            mensagem: 'Disciplina adicionada à turma com sucesso.',
            materia: {
                id: materia.id,
                Disciplina: materia.Disciplina,
                turma: {
                    Serie: turma.Serie,
                    turmaId: turma.id
                }
            }
        };

        res.status(200).json(respostaJSON);

    } catch (error) {
        console.error('Erro ao adicionar matéria à turma:', error);
        res.status(500).json({ mensagem: 'Erro ao adicionar matéria à turma', erro: error.message });
    }
});


app.put('/materia/:materiaId', async (req, res) => {

    const materiaId = req.params.materiaId;

    const { novaDisciplina } = req.body;

    try {

        const materia = await Materia.findByPk(materiaId);

        if (!materia) {

            res.status(404).send({ mensagem: 'Disciplina não encontrada' });
            return;
        }


        await Materia.update({ Disciplina: novaDisciplina }, { where: { id: materiaId } });

        res.status(200).send({ mensagem: 'Nome da disciplina alterado com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar nome da disciplina', error);
        res.status(500).send({ error: 'Erro ao atualizar nome da disciplina.' });
    }
});

app.get('/allmaterias/inturma/:turmaId', async (req, res) => {
    const turmaId = req.params.turmaId;

    try {

        const associate = await AssocAluMat.findAll({
            where: { turmaId },               //me retorna um array de objs associados ao turmaID
        });


        const materiaIds = associate.map(assoc => assoc.materiaId);  //obtemos apenas o ID das materias


        const disciplinas = await Materia.findAll({
            where: { id: materiaIds },   //buscar os ID's que estão contidos no materiaIDs
        });


        const turma = await Turma.findByPk(turmaId); //se a turma for encontrada , serie recebe Serie caso contrario sera Serie = null
        const serie = turma ? turma.Serie : null;


        const disciplinasFormatadas = disciplinas.map(disciplina => ({  //cria novo objeto com materiaID e Disciplina
            materiaId: disciplina.id,
            disciplina: disciplina.Disciplina,
        }));


        const resposta = {
            [`Disciplinas da ${serie || 'Não encontrada'}`]: disciplinasFormatadas,
        };


        res.status(200).json(resposta);
    } catch (error) {
        console.error('Erro ao buscar disciplinas da turma:', error);
        res.status(500).json({ error: 'Erro ao buscar disciplinas da turma.' });
    }
});


app.delete('/materia/delete/:id', async (req, res) => {
    const materiaId = req.params.id

    try {
        const materia = await Materia.findByPk(materiaId);


        if (!materia) {
            return res.status(404).json({ message: "Disciplina não encontrada." })
        }

        await materia.destroy();

        res.send({ message: "Disciplina deletada com sucesso!" });


    } catch (error) {
        console.error('Erro durante a exclusão:', error);
        res.status(500).send({ error: "Falha ao deletar Materia." });
    }
});

app.delete('/materia/:materiaId/turma/:turmaId/delete', async (req, res) => {
    const materiaId = req.params.materiaId;
    const turmaId = req.params.turmaId;

    try {
        const materia = await Materia.findByPk(materiaId);
        const turma = await Turma.findByPk(turmaId);

        if (!materia || !turma) {
            res.status(404).json({ mensagem: 'Disciplina ou Turma não encontrada' });
            return;
        }


        const associacao = await AssocAluMat.findOne({
            where: {
                materiaId: materia.id,
                turmaId: turma.id,
            },
        });

        if (!associacao) {
            res.status(404).json({ mensagem: 'Associação não encontrada' });
            return;
        }


        await associacao.destroy();   //destroi aquela associação entre turma e materia

        res.send({ message: "Disciplina deletada da Turma com sucesso!" });

    } catch (error) {
        console.error('Erro durante a exclusão:', error);
        res.status(500).send({ error: "Falha ao deletar Disciplina." });
    }
});

module.exports = app;

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const db = new sqlite3.Database("rumo.db");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ganhos (
        data TEXT PRIMARY KEY, 
        uber REAL DEFAULT 0, 
        p99 REAL DEFAULT 0, 
        valor REAL DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS configuracao (meta_semanal REAL, dias_trabalhados INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS dias_ativos (data TEXT PRIMARY KEY, ativo INTEGER)`);
});

app.post("/config", (req, res) => {
    const { meta, dias } = req.body;
    db.run("DELETE FROM configuracao", () => {
        db.run("INSERT INTO configuracao(meta_semanal, dias_trabalhados) VALUES(?,?)", [meta, dias], () => {
            res.send({ ok: true });
        });
    });
});

app.post("/ganho-detalhado", (req, res) => {
    const { data, uber, p99 } = req.body;
    const total = Number(uber) + Number(p99);
    db.run("INSERT OR REPLACE INTO ganhos(data, uber, p99, valor) VALUES(?,?,?,?)", 
        [data, uber, p99, total], () => {
        res.send({ ok: true });
    });
});

app.post("/toggle-dia", (req, res) => {
    const { data, ativo } = req.body;
    db.run("INSERT OR REPLACE INTO dias_ativos(data, ativo) VALUES(?,?)", [data, ativo ? 1 : 0], () => {
        res.send({ ok: true });
    });
});

app.get("/semana", (req, res) => {
    db.all(`SELECT * FROM ganhos`, (err, ganhos) => {
        db.all(`SELECT * FROM dias_ativos`, (err, ativos) => {
            db.get(`SELECT * FROM configuracao LIMIT 1`, (err, config) => {
                res.send({
                    ganhos: ganhos || [],
                    ativos: ativos || [],
                    meta: config?.meta_semanal || 0,
                    dias: config?.dias_trabalhados || 5
                });
            });
        });
    });
});

app.get("/status", (req, res) => {
    db.all(`SELECT * FROM ganhos`, (err, rows) => {
        db.get(`SELECT * FROM configuracao LIMIT 1`, (err, config) => {
            const hoje = new Date();
            const diaDaSemana = hoje.getDay();
            const diff = hoje.getDate() - diaDaSemana + (diaDaSemana === 0 ? -6 : 1);
            const segundaFeira = new Date(hoje.setDate(diff));
            segundaFeira.setHours(0,0,0,0);

            let totalSemana = 0;
            if (rows) {
                totalSemana = rows.reduce((acc, curr) => {
                    const dataGanho = new Date(curr.data + "T00:00:00");
                    return dataGanho >= segundaFeira ? acc + (curr.valor || 0) : acc;
                }, 0);
            }
            res.send({ ganhos: totalSemana, meta: config?.meta_semanal || 0, dias: config?.dias_trabalhados || 5 });
        });
    });
});

app.get("/historico-geral", (req, res) => {
    db.all(`SELECT * FROM ganhos ORDER BY data DESC`, (err, rows) => {
        res.send(rows || []);
    });
});

// CONFIGURAÇÃO DE PORTA DINÂMICA (RENDER) E ACESSO EXTERNO (CELULAR)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`RUMO rodando em:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Na sua rede: http://SEU_IP_LOCAL:${PORT}`);
});
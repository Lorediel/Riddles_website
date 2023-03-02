"use strict";
const sqlite = require("sqlite3");
const dayjs = require("dayjs");

// open the database
const db = new sqlite.Database("indovinelli.sqlite", (err) => {
	if (err) throw err;
});

const chiudiSeScaduto = () => {
	return new Promise((resolve, reject) => {
		//Aggiorna lo stato degli indovinelli scaduti, andando a chiuderli
		const sql =
			"UPDATE Indovinello " +
			"SET stato = 'chiuso' " +
			"WHERE scadenza != 'NULL' AND scadenza - ? <= 0 ";

		db.run(sql, [dayjs().unix()], function (err) {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
};

//Prendi tutti gli indovinelli di tutti gli utenti
//Visto che il timer potrebbe esser scaduto, prima di restituirli cambia lo stato in chiuso
//per gli indovinelli per il quale il timer è scaduto.
exports.getAllIndovinelli = () => {
	return new Promise((resolve, reject) => {
		//Aggiorna lo stato degli indovinelli
		chiudiSeScaduto()
			.then(() => {
				const sql = "SELECT * FROM Indovinello";
				db.all(sql, (err, rows) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(rows);
				});
			})
			.catch((err) => {
				reject(err);
				return;
			});
	});
};

//Crea indovinello
exports.createIndovinello = (i, userid) => {
	return new Promise((resolve, reject) => {
		const sql =
			"INSERT INTO Indovinello(domanda, risposta, difficolta, durata, suggerimento1, suggerimento2, stato, autore)" +
			" VALUES(?,?,?,?,?,?,?,?)";
		db.run(
			sql,
			[
				i.domanda,
				i.risposta,
				i.difficolta,
				i.durata,
				i.suggerimento1,
				i.suggerimento2,
				"aperto",
				userid,
			],
			function (err) {
				if (err) {
					reject(err);
					return;
				}
				resolve(this.lastID);
			}
		);
	});
};

//Prendi indovinello dall'id
exports.getIndovinelloById = (id) => {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM Indovinello WHERE id = ?";
		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(row);
		});
	});
};

//Inserisci una risposta a un indovinello
exports.createRisposta = (idIndovinello, userid, testo) => {
	return new Promise((resolve, reject) => {
		const sql =
			"INSERT INTO Risposta(idIndovinello, idUser, testo) " +
			"VALUES(?,?,?)";
		db.run(sql, [idIndovinello, userid, testo], (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
};

exports.getRispostaByUserIndovinello = (idIndovinello, userid) => {
	return new Promise((resolve, reject) => {
		const sql =
			"SELECT * FROM Risposta WHERE idIndovinello = ? AND idUser = ?";

		db.get(sql, [idIndovinello, userid], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(row);
		});
	});
};

exports.updateStatoIndovinello = (idIndovinello, stato) => {
	return new Promise((resolve, reject) => {
		const sql = "UPDATE Indovinello " + "SET stato = ? " + "WHERE id = ?";

		db.run(sql, [stato, idIndovinello], (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
};

exports.updateScadenzaIndovinello = (scadenza, idIndovinello) => {
	return new Promise((resolve, reject) => {
		const sql = "UPDATE Indovinello SET scadenza = ? WHERE id = ? ";
		db.run(sql, [scadenza, idIndovinello], (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
};


exports.getRisposteIndovinello = (idIndovinello) => {
	return new Promise((resolve, reject) => {
		const sql =
			"SELECT testo, idUser FROM Risposta WHERE idIndovinello = ?";

		db.all(sql, [idIndovinello], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(rows);
		});
	});
};

exports.getClassifica = () => {
	return new Promise((resolve, reject) => {
		const sql =
			"SELECT username, punti " +
			"FROM User " +
			"WHERE punti IN " +
			"(SELECT Punti " +
			"FROM User " +
			"ORDER BY punti desc " +
			"LIMIT 3) " +
			"ORDER BY punti desc, username";
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(rows);
		});
	});
};

//Setta il vincitore di un indovinello
exports.setVincitoreIndovinello = (idIndovinello, userid)=>  {
	return new Promise((resolve, reject) => {
		const sql = "UPDATE Indovinello SET vincitore = ? WHERE id = ? ";
		db.run(sql, [userid, idIndovinello], (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

//Aggiorna punti di un user
exports.addPuntiUser = (punti, userid)=>  {
	return new Promise((resolve, reject) => {
		const sql = "UPDATE User SET punti = punti + ? WHERE id = ? ";
		db.run(sql, [punti, userid], (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

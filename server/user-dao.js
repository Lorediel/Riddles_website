"use strict";
/* Data Access Object (DAO) module for accessing users */

const sqlite = require("sqlite3");
const crypto = require("crypto");

// open the database
const db = new sqlite.Database("indovinelli.sqlite", (err) => {
	if (err) throw err;
});

exports.getUserById = (id) => {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM User WHERE id = ?";
		db.get(sql, [id], (err, row) => {
			if (err) reject(err);
			else if (row === undefined) resolve({ error: "User not found." });
			else {
				// by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
				const user = { id: row.id, username: row.username };
				resolve(user);
			}
		});
	});
};

exports.getUser = (username, password) => {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM User WHERE username = ?";
		db.get(sql, [username], (err, row) => {
			if (err) {
				reject(err);
			} else if (row === undefined) {
				resolve(false);
			} else {
				const user = { id: row.id, username: row.username };

				const salt = row.salt;
				crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
					if (err) reject(err);
					const passwordHex = Buffer.from(row.hash, "hex");

					if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
						resolve(false);
					else resolve(user);
				});
			}
		});
	});
};

"use strict";

const express = require("express");
const morgan = require("morgan"); // logging middleware
const { check, validationResult } = require("express-validator"); // validation middleware
const dao = require("./dao"); // module for accessing the DB
const userDao = require("./user-dao");
const cors = require("cors");
const LocalStrategy = require("passport-local").Strategy; // username and password for login
const passport = require("passport"); // auth middleware
const session = require("express-session"); // enable sessions
const dayjs = require("dayjs");

const valoriDifficolta = ["facile", "media", "difficile"];

//passport setup con local strategy

passport.use(
	new LocalStrategy(function (username, password, done) {
		userDao.getUser(username, password).then((user) => {
			if (!user)
				return done(null, false, {
					message: "Incorrect username and/or password.",
				});

			return done(null, user);
		});
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	userDao
		.getUserById(id)
		.then((user) => {
			done(null, user);
		})
		.catch((err) => {
			done(err, null);
		});
});

// init express
const app = new express();
const port = 3001;

//middlewares
app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
	origin: "http://localhost:3000",
	credentials: true,
};
app.use(cors(corsOptions));

app.use(
	session({
		// by default, Passport uses a MemoryStore to keep track of the sessions
		secret: "a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie",
		resave: false,
		saveUninitialized: false,
	})
);

app.use(passport.initialize());
app.use(passport.session());

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) return next();

	return res.status(401).json({ error: "not authenticated" });
};

/*** Users APIs ***/

// POST /sessions
// login
app.post("/api/sessions", function (req, res, next) {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);
		if (!user) {
			// display wrong login messages
			return res.status(401).json(info);
		}
		// success, perform the login
		req.login(user, (err) => {
			if (err) return next(err);

			// req.user contains the authenticated user, we send all the user info back
			// this is coming from userDao.getUser()
			return res.json(req.user);
		});
	})(req, res, next);
});

// DELETE /sessions/current
// logout
app.delete("/api/sessions/current", (req, res) => {
	req.logout(() => {
		res.end();
	});
});

// GET /sessions/current
// check whether the user is logged in or not
app.get("/api/sessions/current", (req, res) => {
	if (req.isAuthenticated()) {
		res.status(200).json(req.user);
	} else res.status(401).json({ error: "Unauthenticated user!" });
});

//GET /indovinelli

app.get("/api/indovinelli", (req, res) => {
	dao.getAllIndovinelli()
		.then((rows) => {
			const indovinelli = rows.map((i) => ({
				id: i.id,
				domanda: i.domanda,
				difficolta: i.difficolta,
				stato: i.stato,
				durata: i.durata,
				autore: i.autore,
			}));
			return res.status(200).json(indovinelli);
		})
		.catch(() => res.status(500).end());
});

//POST /indovinelli
app.post(
	"/api/indovinelli",
	isLoggedIn,
	[
		check("domanda").trim().notEmpty().isString(),
		check("risposta").trim().notEmpty().isString(),
		check("difficolta")
			.trim()
			.notEmpty()
			.isString()
			.custom((value) => {
				return valoriDifficolta.includes(value);
			}),
		check("suggerimento1").trim().notEmpty().isString(),
		check("suggerimento2").trim().notEmpty().isString(),
		check("durata").isInt({ min: 30, max: 600 }).notEmpty(),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}

			const i = {
				domanda: req.body.domanda,
				risposta: req.body.risposta,
				difficolta: req.body.difficolta,
				suggerimento1: req.body.suggerimento1,
				suggerimento2: req.body.suggerimento2,
				durata: req.body.durata,
			};

			await dao.createIndovinello(i, req.user.id);
			res.status(201).end();
		} catch (err) {
			res.status(500).json({
				error: "Database error during the creation",
			});
		}
	}
);

//GET /indovinelli/:id
//Viene chiamata per ottenere informazioni su un indovinello chiuso
app.get(
	"/api/indovinelliChiusi/:id",
	isLoggedIn,
	[check("id").isNumeric({ min: 0 })],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}
			let indovinello = await dao.getIndovinelloById(req.params.id);
			if (!indovinello) {
				return res.status(404).json({ error: "Indovinello Not Found" });
			}
			if (indovinello.stato === "chiuso") {
				let v = undefined;

				if (indovinello.vincitore) {
					let u = await userDao.getUserById(indovinello.vincitore);
					v = u.username;
				}
				let risposteUtenti = await dao.getRisposteIndovinello(
					req.params.id
				);

				const i = {
					domanda: indovinello.domanda,
					risposta: indovinello.risposta,
					difficolta: indovinello.difficolta,
					autore: indovinello.autore,
					vincitore: v,
					risposteUtenti: risposteUtenti,
				};

				return res.status(200).json(i);
			} else {
				return res.status(409).json({
					error: "Non puoi ottenere queste informazioni su un indovinello aperto",
				});
			}
		} catch (e) {
			return res.status(500).json({ error: "Internal server error" });
		}
	}
);

//GET indovinelli/:id/timer
app.get(
	"/api/indovinelli/:id/timer",
	isLoggedIn,
	[check("id").isNumeric({ min: 0 })],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}
			const indovinello = await dao.getIndovinelloById(req.params.id);
			if (!indovinello) {
				return res.status(404).json({ error: "Indovinello Not Found" });
			}
			const scadenza = indovinello.scadenza;
			const durata = indovinello.durata;
			const percent25 = Math.floor(durata * 0.25);
			const percent50 = Math.floor(durata * 0.5);
			//Nessuno ha ancora risposto, ritorna "non inizializzato"
			if (scadenza === null) {
				res.status(200).json({ timerValue: "non inizializzato" });
				return;
			}
			const timer = scadenza - dayjs().unix();
			//Se il tempo rimasto è negativo, oppure l'indovinello è chiuso, ritorna "scaduto"
			if (timer <= 0 || indovinello.stato === "chiuso") {
				res.status(200).json({ timerValue: "scaduto" });
				return;
			}
			//Se il tempo rimasto è positivo ritornalo
			if (timer >= 0) {
				if (timer <= percent25) {
					res.status(200).json({
						timerValue: timer,
						suggerimento1: indovinello.suggerimento1,
						suggerimento2: indovinello.suggerimento2,
					});
				} else if (timer <= percent50) {
					res.status(200).json({
						timerValue: timer,
						suggerimento1: indovinello.suggerimento1,
						suggerimento2: "",
					});
				} else {
					res.status(200).json({
						timerValue: timer,
						suggerimento1: "",
						suggerimento2: "",
					});
				}

				return;
			}
		} catch (e) {
			return res.status(500).json({ error: "Internal server error" });
		}
	}
);

const mapPunteggio = (difficolta) => {
	switch (difficolta) {
		case "facile":
			return 1;
		case "media":
			return 2;
		case "difficile":
			return 3;
	}
};

//Rispondi all'indovinello
//POST indovinelli/:id/risposta
app.post(
	"/api/indovinelli/:id/risposta",
	isLoggedIn,
	[check("id").isNumeric({ min: 0 }), check("risposta").trim().notEmpty().isString()],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			//Validazione dati in ingresso
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}
			const indovinelloId = req.params.id;
			const userid = req.user.id;
			const indovinello = await dao.getIndovinelloById(req.params.id);
			if (!indovinello) {
				return res.status(404).json({ error: "Indovinello Not Found" });
			}
			const scadenza = indovinello.scadenza;
			const timer = scadenza - dayjs().unix();
			//ottieni il timer e se è <= 0 vuol dire che l'indovinello è già chiuso.
			//Controllo di sicurezza
			if (scadenza !== null && timer <= 0) {
				await dao.updateStatoIndovinello(indovinelloId, "chiuso");
				return res.status(409).json({ error: "Indovinello chiuso" });
			}
			//Controlla se l'utente ha già risposto o meno all'indovinello, se ha già risposto bloccalo
			let r = await dao.getRispostaByUserIndovinello(
				indovinelloId,
				userid
			);
			if (r !== undefined) {
				return res.status(409).json({
					error: "L'utente ha già risposto a questo indovinello",
				});
			}
			//Controlla se è la prima risposta data da parte di un user, in quel caso il timer deve essere avviato.
			const durata = indovinello.durata;
			if (scadenza === null) {
				await dao.updateScadenzaIndovinello(
					dayjs().unix() + durata,
					indovinelloId
				);
			}
			//Se la risposta data è quella giusta, chiudo l'indovinello
			//Setto il vincitore e aggiorno i punti
			const rispostaGiusta = indovinello.risposta;
			const esito = { rispostaCorretta: "no" };
			if (req.body.risposta === rispostaGiusta) {
				await dao.updateStatoIndovinello(indovinelloId, "chiuso");
				await dao.setVincitoreIndovinello(indovinelloId, req.user.id);
				const punti = mapPunteggio(indovinello.difficolta);
				await dao.addPuntiUser(punti, req.user.id);
				esito.rispostaCorretta = "si";
			}
			//Crea la risposta nel database
			await dao.createRisposta(indovinelloId, userid, req.body.risposta);
			return res.status(201).json(esito);
		} catch (e) {
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

//GET risposte dell'indovinello
//GET indovinelli/:id/risposte
app.get(
	"/api/indovinelli/:id/risposte",
	isLoggedIn,
	[check("id").isNumeric({ min: 0 })],
	async (req, res) => {
		try {
			const id = req.params.id;

			const userid = req.user.id;
			//Prendi l'indovinello e controlla che effettivamente lo user che richiede sia effettivamente l'autore
			const indovinello = await dao.getIndovinelloById(id);
			if (!indovinello) {
				return res.status(404).json({ error: "Indovinello not found" });
			}

			const autore = indovinello.autore;
			if (userid !== autore) {
				return res.status(401).json({ error: "Unauthorized user" });
			}
			const risposte = await dao.getRisposteIndovinello(id);
			return res.status(200).json(risposte);
		} catch (e) {
			return res.status(500).json({ error: "Internal server error" });
		}
	}
);

//GET /classifica
app.get("/api/classifica", async (req, res) => {
	try {
		let classifica = await dao.getClassifica();
		return res.status(200).json(classifica);
	} catch (e) {
		return res.status(500).json({ error: "Internal server error" });
	}
});

//Restituisce true se lìutente ha già risposto a un indovinello
//GET indovinelli/:id/giaRisposto
app.get(
	"/api/indovinelli/:id/giaRisposto",
	isLoggedIn,
	[check("id").isNumeric({ min: 0 })],
	async (req, res) => {
		try {
			const userid = req.user.id;
			const id = req.params.id;
			const indovinello = await dao.getIndovinelloById(id);
			if (!indovinello) {
				return res.status(404).json({ error: "Indovinello Not Found" });
			}
			const risposte = await dao.getRisposteIndovinello(id);
			//Mappa prima per avere solo gli id degli user, poi filtra per avere solo quello con lo user che cerchiamo
			const contains = risposte
				.map((i) => i.idUser)
				.filter((i) => i === userid);
			let giaRisposto = false;
			//Ha già risposto
			if (contains.length !== 0) {
				giaRisposto = true;
			}
			return res.status(200).json({ esito: giaRisposto });
		} catch (e) {
			return res.status(500).json({ error: "Internal server error" });
		}
	}
);

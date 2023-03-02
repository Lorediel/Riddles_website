//const URL = 'http://localhost:3001/api'
const APIURL = new URL("http://localhost:3001/api/");

async function getAllIndovinelli() {
	const response = await fetch(new URL("indovinelli", APIURL), {
		credentials: "include",
	});
	const indovinelliJSON = await response.json();
	if (response.ok) {
		return indovinelliJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw indovinelliJSON;
	}
}

async function createIndovinello(i) {
	return new Promise((resolve, reject) => {
		fetch(new URL("indovinelli", APIURL), {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				domanda: i.domanda,
				risposta: i.risposta,
				difficolta: i.difficolta,
				durata: i.durata,
				suggerimento1: i.suggerimento1,
				suggerimento2: i.suggerimento2,
			}),
		})
			.then((response) => {
				if (response.ok) {
					resolve(null);
				} else {
					// analyze the cause of error
					response
						.json()
						.then((message) => {
							reject(message);
						}) // error message in the response body
						.catch(() => {
							reject({ error: "Cannot parse server response." });
						}); // something else
				}
			})
			.catch(() => {
				reject({ error: "Cannot communicate with the server." });
			}); // connection errors
	});
}

async function getTimer(indovinelloId) {
	const response = await fetch(
		new URL(`indovinelli/${indovinelloId}/timer`, APIURL),
		{ credentials: "include" }
	);

	const timerJSON = await response.json();

	if (response.ok) {
		return timerJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw timerJSON;
	}
}

async function rispondiIndovinello(indovinelloID, risposta) {
	return new Promise((resolve, reject) => {
	fetch(
		new URL(`indovinelli/${indovinelloID}/risposta`, APIURL),
		{
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({risposta: risposta}),
		}
	).then((response) => {
		if (response.ok) {
			resolve(response.json());
		} else {
			// analyze the cause of error
			response
				.json()
				.then((message) => {
					reject(message);
				}) // error message in the response body
				.catch(() => {
					reject({ error: "Cannot parse server response." });
				}); // something else
		}
	})
	.catch(() => {
		reject({ error: "Cannot communicate with the server." });
	})
}); // connection errors
}

//Prendi le info su un indovinello chiuso
async function getIndovinelloChiusoInfo(indovinelloID) {
	const response = await fetch(new URL(`indovinelliChiusi/${indovinelloID}`, APIURL), {
		credentials: "include",
	});

	const indovinelloJSON = await response.json();
	if (response.ok) {
		return indovinelloJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw indovinelloJSON;
	}

}

async function getMieiIndovinelli() {
	const response = await fetch(new URL('mieiIndovinelli', APIURL), {
		credentials: "include",
	});
	const indovinelliJSON = await response.json();
	if (response.ok) {
		return indovinelliJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw indovinelliJSON;
	}
}

async function getRisposteIndovinello(indovinelloId) {
	const response = await fetch(new URL(`indovinelli/${indovinelloId}/risposte`, APIURL), {
		credentials: "include",
	});
	const risposteJSON = await response.json();
	if (response.ok) {
		return risposteJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw risposteJSON;
	}
}

async function getClassifica() {
	const response = await fetch(new URL('classifica', APIURL), {
		credentials: "include",
	});
	const classificaJSON = await response.json();
	if (response.ok) {
		return classificaJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw classificaJSON;
	}
}

async function giaRisposto(indovinelloId) {
	const response = await fetch(new URL(`indovinelli/${indovinelloId}/giaRisposto`, APIURL), {
		credentials: "include",
	});
	const esitoJSON = await response.json();
	if (response.ok) {
		return esitoJSON;
	} else {
		//Oggetto json con descrizione dell'errore
		throw esitoJSON;
	}
}

//API AUTENTICAZIONE

async function logout() {
	await fetch(new URL("sessions/current", APIURL), {
		method: "DELETE",
		credentials: "include",
	});
}

async function getUserInfo() {
	const response = await fetch(new URL("sessions/current", APIURL), {
		credentials: "include",
	});
	const userInfo = await response.json();
	if (response.ok) {
		return userInfo;
	} else {
		throw userInfo; // an object with the error coming from the server
	}
}

async function login(credentials) {
	let response = await fetch(new URL("sessions", APIURL), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(credentials),
	});
	if (response.ok) {
		const user = await response.json();
		return user;
	} else {
		const errDetail = await response.json();
		throw errDetail.message;
	}
}




const API = {
	getAllIndovinelli,
	login,
	logout,
	getUserInfo,
	createIndovinello,
	getTimer,
	rispondiIndovinello,
	getIndovinelloChiusoInfo,
	getMieiIndovinelli,
	getRisposteIndovinello,
	getClassifica,
	giaRisposto
};

export default API;

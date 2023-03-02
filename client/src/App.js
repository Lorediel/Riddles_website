import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import MyNavbar from "./MyNavbar.js";

import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
	useNavigate,
} from "react-router-dom";
import { Homepage } from "./Homepage";
import { useState, useEffect } from "react";
import API from "./API";
import { LoginForm } from "./LoginComponents";
import { FormCreazione } from "./FormCreazione";
import { IndovinelloPage } from "./IndovinelloPages";
import { Alert, Container, Col, Row } from "react-bootstrap";

function App() {
	return (
		<Router>
			<App2 />
		</Router>
	);
}

function App2() {
	//Gestire autenticazione
	const [user, setUser] = useState({});
	const [loggedIn, setLoggedIn] = useState(false);
	const [indovinelli, setIndovinelli] = useState([]); //lista di indovinelli da mostrare all'inizio
	const [errorMsg, setErrorMsg] = useState("");
	//Stato per il primo loading della lista degli indovinelli.
	const [loading, setLoading] = useState(true);
	const [loginMessage, setLoginMessage] = useState("");
	const [classifica, setClassifica] = useState([]);

	const navigate = useNavigate();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				//informazioni dello user se siamo già loggati
				const user = await API.getUserInfo();
				setLoggedIn(true);
				setUser(user);
			} catch (err) {
				if(err.error !== "Unauthenticated user!") {
					handleError()
				}
			}
		};
		checkAuth();
	}, []);

	function changeIndovinelli(indovinelli) {
		setIndovinelli(indovinelli);
	}
	
	function changeClassifica(classifica) {
		setClassifica(classifica);
	}
	/* LOGIN E LOGOUT */
	const doLogin = (credentials) => {
		API.login(credentials).then((user) => {
			//Questo è il caso in cui l'autenticazione sia andata a buon fine
			setLoggedIn(true);
			setUser(user);
			setLoginMessage('');
			navigate("/");
		}).catch((e) => {
			if (e === 'Incorrect username and/or password.') {
				setLoginMessage("err");
			}
			else {
				handleError();
			}
		});
	};

	const doLogout = async () => {
		await API.logout();
		setLoggedIn(false);
		setUser({});
		navigate("/");
	};

	/*Errore generico del server. Me lo porto sotto perché molto spesso gli errori nascono
	o dal fatto che il server non sta runnando, o per problemi al database, oppure ancora non viene
	restituito "ok" nel momento in cui si mandano informazioni sbagliate al server. Tuttavia se si usa
	correttamente il client questi errori non possono avvenire e quindi ho pensato di mostrare
	solamente un errorMsg generico quando succedono queste cose. Questi errori avvengono solo
	se si chiamano le API al di fuori dal client.
	*/
	const handleError = () => {
		setErrorMsg("C'è stato un errore del server");
	};

	const changeLoading = (val) => {
		setLoading(val);
	}

	const changeLoginMessage = (msg) => {
		setLoginMessage(msg);
	}

	//Funzione per la creazione di un indovinello
	function aggiungiIndovinello(indovinello) {
		API.createIndovinello(indovinello)
			.then(() => {
				//sono sicuro che già c'è perché prima di reindirizzare aggiunge l'indovinello al DB
				setIndovinelli((oldIndovinelli) => [
					...oldIndovinelli,
					indovinello,
				]);
				navigate("/");
			})
			.catch((err) => handleError());
	}

	return (
		<>
			<MyNavbar
				loggedIn={loggedIn}
				logout={doLogout}
				user={user}
				changeLoginMessage = {changeLoginMessage}
			></MyNavbar>
			{errorMsg ? (
				<Container className="mt-3">
					<Row>
						<Col md = {3}></Col>
						<Col md = {6}>
						<Alert
							variant="danger"
							onClose={() => setErrorMsg("")}
							dismissible
						>
							{errorMsg}
						</Alert>
						</Col>
						<Col md = {3}></Col>
					</Row>
				</Container>
			) : (
				false
			)}
			<Routes>
				<Route path="/" element={<Navigate to="tutti" />} />
				<Route
					path="/tutti"
					element={
						<Homepage
							classifica={classifica}
							changeClassifica={changeClassifica}
							loading = {loading}
							changeLoading = {changeLoading}
							handleError={handleError}
							changeIndovinelli={changeIndovinelli}
							user={user}
							indovinelli={indovinelli}
							loggedIn={loggedIn}
						/>
					}
				/>
				<Route path="/login" element={<LoginForm loginMessage={loginMessage} login={doLogin} />} />
				<Route
					path="/crea"
					element={
						<FormCreazione
							aggiungiIndovinello={aggiungiIndovinello}
						/>
					}
				/>
				<Route
					path="/indovinelli/:id"
					element={
						<IndovinelloPage
							handleError = {handleError}
							user={user}
							indovinelli={indovinelli}
						/>
					}
				></Route>
				<Route
					path="/miei"
					element={
						<Homepage
							handleError={handleError}
							classifica={classifica}
							changeClassifica={changeClassifica}
							changeIndovinelli={changeIndovinelli}
							user={user}
							loggedIn={loggedIn}
							indovinelli={indovinelli.filter((i) => {
								return i.autore === user.id;
							})}
						/>
					}
				/>
			</Routes>
		</>
	);
}

export default App;

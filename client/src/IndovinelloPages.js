import "./my_style.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IndovinelloChiuso, IndovinelloInfo } from "./IndovinelloChiusoPages";
import API from "./API";
import { Timer } from "./Timer";
import {
	Form,
	Button,
	Row,
	Col,
	Container,
	Alert,
	ListGroup,
} from "react-bootstrap";
import { CancelButton } from "./FormCreazione";
import { LegendaDifficolta } from "./Homepage";

function IndovinelloPage(props) {
	//Per il loading dei componenti dal server
	const { id } = useParams();
	const indovinello = props.indovinelli.find((i) => i.id === parseInt(id));
	const stato = indovinello.stato;
	const durata = indovinello.durata;
	

	const mio = indovinello.autore === props.user.id;
	return (
		<>
			{stato === "aperto" ? (
				<IndovinelloAperto
					handleError={props.handleError}
					indovinello={indovinello}
					durata={durata}
					id={id}
					mio={mio}
				/>
			) : (
				<IndovinelloChiuso
					handleError={props.handleError}
					indovinello={indovinello}
				/>
			)}
		</>
	);
}

function IndovinelloAperto(props) {
	const [suggerimento1, setSuggerimento1] = useState("");
	const [suggerimento2, setSuggerimento2] = useState("");
	const [timerScaduto, setTimerScaduto] = useState(false);

	const changeSuggerimento1 = (sugg) => {
		setSuggerimento1(sugg);
	};

	const changeSuggerimento2 = (sugg) => {
		setSuggerimento2(sugg);
	};

	const disableTimer = () => {
		setTimerScaduto(true);
	};

	return (
		<>
			<Container className="my-3">
				<h1>{props.mio ? "Mio indovinello" : "Rispondi"}</h1>
				<Row className="my-3">
					<Col md={7}>
						<IndovinelloInfo indovinello={props.indovinello} />
					</Col>
					<Col md={3}>
						<h3>Tempo rimanente:</h3>

						<Timer
							disableTimer={disableTimer}
							className="m-auto"
							durata={props.durata}
							changeSuggerimento1={changeSuggerimento1}
							changeSuggerimento2={changeSuggerimento2}
							id={props.id}
						/>
					</Col>
					<Col md={2}>
						<LegendaDifficolta />
					</Col>
				</Row>
				{props.mio ? (
					<RisposteIndovinelloAperto
						id={props.id}
						handleError={props.handleError}
					/>
				) : (
					<FormIndovinelloAperto
						timerScaduto={timerScaduto}
						handleError={props.handleError}
						suggerimento1={suggerimento1}
						suggerimento2={suggerimento2}
						indovinello={props.indovinello}
						durata={props.durata}
						id={props.id}
					/>
				)}
			</Container>
		</>
	);
}

function RisposteIndovinelloAperto(props) {
	const [risposte, setRisposte] = useState([]);

	//props.id e props.handleError messi nelle dependencies per non far apparire il warning,
	//nonostante non possano cambiare
	useEffect(() => {
		const risposteRequest = () => {
			API.getRisposteIndovinello(props.id)
				.then((ris) => {
					setRisposte(ris);
				})
				.catch((e) => {
					props.handleError();
				});
		};
		risposteRequest();
		const interval = setInterval(() => {
			risposteRequest();
		}, 1000);
		return () => clearInterval(interval);
	}, []); //warning per props.id e props.handleError

	return (
		<>
			<h2>Risposte date: </h2>
			<ListGroup>
				{risposte.map((r) => (
					<ListGroup.Item key={r.idUser}>{r.testo}</ListGroup.Item>
				))}
			</ListGroup>
			<div className="d-flex flex-row-reverse p-4">
				<CancelButton></CancelButton>
			</div>
		</>
	);
}

function FormIndovinelloAperto(props) {
	const [risposta, setRisposta] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [giaRisposto, setGiaRisposto] = useState("waiting");
	const [esitoRisposta, setEsitoRisposta] = useState("");

	//Controlla se l'utente ha già risposto all'indovinello o meno
	useEffect(() => {
		API.giaRisposto(props.id)
			.then((res) => {
				setGiaRisposto(res.esito);
			})
			.catch((err) => props.handleError());
	}, []);

	const handleSubmit = (event) => {
		event.preventDefault();
		let isValid = true;
		let e = "";

		if (risposta.trim() === "") {
			isValid = false;
			e = "Aggiungere una risposta, attenzione agli spazi";
		}

		if (isValid) {
			//Setta che l'utente ha già risposto
			setGiaRisposto(true);
			setEsitoRisposta("waiting");
			API.rispondiIndovinello(props.id, risposta)
				.then((esito) => {
					setEsitoRisposta(esito.rispostaCorretta);

					//Rimuovi il messaggio di elaborazione
					//Setta l'esito della risposta
					setEsitoRisposta(esito.rispostaCorretta);
				})
				.catch((err) => {
					if (err.error && err.error === "Indovinello chiuso") {
						setEsitoRisposta("chiuso");
					} else {
						props.handleError();
					}
				});
		} else {
			setErrorMsg(e);
		}
	};

	return (
		<>
			<p>
				Il primo e il secondo suggerimento appaiono quando il countdown
				raggiunge rispettivamente il 50% e il 25% della sua durata
			</p>
			{/* SUGGERIMENTO 1 */}
			{props.suggerimento1 ? (
				<Alert variant="warning">
					<b>Suggerimento 1: {props.suggerimento1}</b>
				</Alert>
			) : (
				false
			)}
			{/* SUGGERIMENTO 2 */}
			{props.suggerimento2 ? (
				<Alert variant="warning">
					<b>Suggerimento 2: {props.suggerimento2}</b>
				</Alert>
			) : (
				false
			)}
			{errorMsg ? (
				<Alert
					variant="danger"
					onClose={() => setErrorMsg("")}
					dismissible
				>
					{errorMsg}
				</Alert>
			) : (
				false
			)}
			{giaRisposto === true ? (
				<>
					<Alert variant="secondary">
						Hai già risposto a questo indovinello.
					</Alert>
					{esitoRisposta ? (
						<AlertEsito esito={esitoRisposta} />
					) : (
						false
					)}
					<div className="d-flex flex-row-reverse p-4">
						<CancelButton />
					</div>
				</>
			) : (
				<>
					<Form onSubmit={handleSubmit}>
						<Form.Group>
							<Form.Label>Rispondi all'indovinello</Form.Label>
							<Form.Control
								disabled={
									giaRisposto === "waiting" ||
									props.timerScaduto
								}
								placeholder={
									giaRisposto === "waiting"
										? "Attendere..."
										: "Inserire risposta"
								}
								value={risposta}
								onChange={(ev) => setRisposta(ev.target.value)}
							></Form.Control>
						</Form.Group>
						<div className="d-flex flex-row-reverse p-4">
							{!props.timerScaduto ? <Button
								type="submit"
								variant="dark"
								className="mx-4"
								
							>
								Rispondi
							</Button> : false}
							<CancelButton />
						</div>
					</Form>
				</>
			)}
		</>
	);
}

function AlertEsito(props) {
	const alertEsitoSwitch = () => {
		switch (props.esito) {
			case "waiting":
				return (
					<Alert variant="info">
						Elaborazione in corso, attendere...
					</Alert>
				);
			case "si":
				return (
					<Alert variant="success">
						Congratulazioni! Risposta giusta!
					</Alert>
				);
			case "no":
				return (
					<Alert variant="danger">
						Mi dispiace, risposta sbagliata!
					</Alert>
				);
			case "chiuso":
				return (
					<Alert variant="danger">
						Mi dispiace, L'indovinello è già chiuso
					</Alert>
				);
			default:
				return false;
		}
	};
	return <>{alertEsitoSwitch()}</>;
	/*
	return (<>
		{props.esito === "waiting" ? <Alert variant="info">Elaborazione in corso, attendere...</Alert> : props.esito === "si" ? <Alert variant="success">Congratulazioni! Risposta giusta!</Alert> : <Alert variant="danger">Mi dispiace, risposta sbagliata!</Alert>}
	</>)*/
}

export { IndovinelloPage };

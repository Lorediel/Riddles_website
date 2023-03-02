import { useEffect, useState } from "react";
import {
	Row,
	Col,
	Container,
	Card,
	Alert,
	ListGroup,
	ListGroupItem,
	Spinner,
} from "react-bootstrap";
import { CancelButton } from "./FormCreazione";
import API from "./API";
import { Difficolta, LegendaDifficolta } from "./Homepage";
import { FaCrown } from "react-icons/fa";
import "./my_style.css";
import { IconContext } from "react-icons/lib";

function IndovinelloChiuso(props) {
	const [rispostaGiusta, setRispostaGiusta] = useState("");
	const [risposteUtenti, setRisposteUtenti] = useState([]);
	const [vincitore, setVincitore] = useState("");
	const [loading, setLoading] = useState(true);
	const indovinello = props.indovinello;

	//Prendo questi dati solamente quando servono in modo da non sovraccaricare troppo il caricamento
	//iniziale degli indovinelli andando a chiedere dati che, potenzialmente, non vengono chiesti.
	useEffect(() => {
		const getInfo = async () => {
			try {
				const info = await API.getIndovinelloChiusoInfo(indovinello.id);
				setRispostaGiusta(info.risposta);
				setRisposteUtenti(info.risposteUtenti);
				setVincitore(info.vincitore);
				setLoading(false);
			} catch (e) {
				props.handleError();
			}
		};
		getInfo();
	}, []);

	//Funzione a parte perché ho tre possibilità
	const displayVincitore = () => {
		if (loading) {
			return (
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			);
		} else if (vincitore) {
			return (
				<>
					<div className="d-flex">
						<IconContext.Provider value={{ color: "gold" }}>
							<FaCrown size={140} />
						</IconContext.Provider>
						<h2 className="m-auto">{vincitore}</h2>
					</div>
				</>
			);
		} else {
			return <h2>Non è presente un vincitore</h2>;
		}
	};

	return (
		<Container className="my-3">
			<h1>Indovinello chiuso</h1>
			<Row className="my-3">
				<Col md={6}>
					<IndovinelloInfo indovinello={props.indovinello} />
				</Col>
				<Col md={4}>
					<h3>Vincitore:</h3>
					{displayVincitore()}
				</Col>
				<Col md={2}>
					<LegendaDifficolta />
				</Col>
			</Row>
			<Row>
				{loading ? (
					<Spinner
						className="bigSpinner m-auto"
						animation="border"
						role="status"
					>
						<span className="visually-hidden">Loading...</span>
					</Spinner>
				) : (
					<>
						<h3>Risposta giusta:</h3>
						<Alert className="text-center" variant="success">
							{rispostaGiusta}
						</Alert>
						<h3>Risposte degli utenti:</h3>
						<ListGroup className="no-padding">
							{risposteUtenti.map((r) => (
								<ListGroupItem key={r.idUser}>
									{r.testo}
								</ListGroupItem>
							))}
						</ListGroup>
					</>
				)}

				<div className="d-flex flex-row-reverse p-4">
					<CancelButton />
				</div>
			</Row>
		</Container>
	);
}

function IndovinelloInfo(props) {
	const durata = props.indovinello.durata;

	return (
		<Card border="success">
			<Card.Title className="mx-2 mt-2"><b>Testo:</b></Card.Title>
			<Card.Body><b>{props.indovinello.domanda}</b></Card.Body>
			<Card.Footer>
				Difficoltà:{" "}
				{<Difficolta difficolta={props.indovinello.difficolta} />}
				<div>
					Durata: {Math.floor(durata / 60)}:
					{durata % 60 < 10 ? `0${durata % 60}` : durata % 60}
				</div>
			</Card.Footer>
		</Card>
	);
}

export { IndovinelloChiuso, IndovinelloInfo };

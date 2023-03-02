import { Form, Alert, Button, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function FormCreazione(props) {
	const [domanda, setDomanda] = useState("");
	const [risposta, setRisposta] = useState("");
	const [difficolta, setDifficolta] = useState("facile");
	const [suggerimento1, setSuggerimento1] = useState("");
	const [suggerimento2, setSuggerimento2] = useState("");
	const [durata, setDurata] = useState(30);
	const [errorMsg, setErrorMsg] = useState(""); // stringa vuota '' = non c'e' errore
	const [addingMessage, setAddingMessage] = useState("");

	const handleSubmit = (event) => {
		event.preventDefault();
		let isValid = true;
		const errorMessages = [];

		if (
			domanda.trim() === "" ||
			risposta.trim() === "" ||
			difficolta.trim() === "" ||
			suggerimento1.trim() === "" ||
			suggerimento2.trim() === ""
		) {
			isValid = false;
			errorMessages.push("Uno o più campi vuoti, attenzione agli spazi!");
		}
		if (
			durata < 30 ||
			durata > 600 ||
			isNaN(durata) ||
			!Number.isInteger(parseInt(durata))
		) {
			isValid = false;
			errorMessages.push("Valore durata invalido");
		}

		//VALIDAZIONE DA AGGIUNGERE
		if (isValid) {
			let indovinello = {
				domanda: domanda,
				risposta: risposta,
				difficolta: difficolta,
				suggerimento1: suggerimento1,
				suggerimento2: suggerimento2,
				durata: durata,
			};
			setAddingMessage("Creazione in corso, sarai reindirizzato a breve");
			props.aggiungiIndovinello(indovinello);
		} else {
			setErrorMsg(errorMessages.join(" | "));
		}
	};
	return (
		<>
			<Container>
				<Row className="mt-4">
					<Col>
						<h1>Crea un nuovo indovinello</h1>
					</Col>
				</Row>
				<Row>
					<Col>
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
						<Form onSubmit={handleSubmit}>
							{/* TESTO */}
							<Form.Group>
								<Form.Label>Testo dell'indovinello</Form.Label>
								<Form.Control
									value={domanda}
									onChange={(ev) =>
										setDomanda(ev.target.value)
									}
								></Form.Control>
							</Form.Group>
							{/* RISPOSTA */}
							<Form.Group>
								<Form.Label>Testo della risposta</Form.Label>
								<Form.Control
									value={risposta}
									onChange={(ev) =>
										setRisposta(ev.target.value)
									}
								></Form.Control>
							</Form.Group>
							{/* DIFFICOLTA' */}
							<Form.Group>
								<Form.Label>Difficoltà</Form.Label>
								<Form.Select
									onChange={(ev) => {
										setDifficolta(ev.target.value);
									}}
								>
									<option value="facile">Facile</option>
									<option value="media">Media</option>
									<option value="difficile">Difficile</option>
								</Form.Select>
							</Form.Group>
							{/* DURATA*/}
							<Form.Group>
								<Form.Label>
									Durata (minimo 30, massimo 600 secondi)
								</Form.Label>
								<Form.Control
									value={durata}
									onChange={(ev) =>
										setDurata(ev.target.value)
									}
									type="number"
									min={30}
									max={600}
								></Form.Control>
							</Form.Group>
							{/* SUGGERIMENTO 1 */}
							<Form.Group>
								<Form.Label>Suggerimento 1</Form.Label>
								<Form.Control
									value={suggerimento1}
									onChange={(ev) =>
										setSuggerimento1(ev.target.value)
									}
								></Form.Control>
							</Form.Group>
							{/* SUGGERIMENTO 2 */}
							<Form.Group>
								<Form.Label>Suggerimento 2</Form.Label>
								<Form.Control
									value={suggerimento2}
									onChange={(ev) =>
										setSuggerimento2(ev.target.value)
									}
								></Form.Control>
							</Form.Group>
							<div className="d-flex flex-row-reverse p-4">
								<Button
									type="submit"
									variant="dark"
									className="mx-4"
								
								>
									Crea
								</Button>
								<CancelButton></CancelButton>
							</div>
						</Form>
						{addingMessage ? (
							<Alert variant="info">{addingMessage}</Alert>
						) : (
							false
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
}

function CancelButton(props) {
	const navigate = useNavigate();
	return (
		<Button
			variant="secondary"
			onClick={() => {
				navigate("/");
			}}
		>
			Indietro
		</Button>
	);
}

export { FormCreazione, CancelButton };

import { useEffect, useState } from "react";
import {
	Container,
	ListGroup,
	Row,
	Col,
	Button,
	Alert,
	Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
	AiOutlineUnlock,
	AiOutlineLock,
	AiOutlineEye,
	AiOutlineArrowRight,
} from "react-icons/ai";
import API from "./API";
import { IconContext } from "react-icons/lib";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";

function Homepage(props) {
	const classifica = props.classifica;
	const indovinelli = props.indovinelli;
	const loggedIn = props.loggedIn;

	useEffect(() => {
		//Funzione per prendere tutti gli indovinelli
		const getAll = () => {
			API.getAllIndovinelli()
				.then((indovinelli) => {
					props.changeIndovinelli(indovinelli);
					//per prendere la classifica
					API.getClassifica().then((c) => {
						//Posso non controllare l'ordine perché JSON mantiene l'ordine degli array.
						props.changeClassifica(c);
						props.changeLoading(false);
					});
				})
				.catch((err) => {
					props.changeLoading(false);
					props.handleError();
				});
		};
		getAll();
		//Polling per tenere aggiornata classifica e indovinelli
		if (loggedIn) {
			let interval = setInterval(() => {
				getAll();
			}, 1000);

			return () => {
				clearInterval(interval);
			};
		}
	}, [loggedIn]);

	return (
		<Container className="mt-5">
			{props.loading ? (
				<Alert variant="info">
					Caricando i dati dal server, attendere
				</Alert>
			) : (
				<Row>
					<Col md={2}>
						<h2>Classifica</h2>
						<Classifica classifica={classifica}></Classifica>
						<h5 className="mt-3">Legenda</h5>
						<LegendaDifficolta />
					</Col>
					<Col md={5}>
						<h2>
							<IconContext.Provider
								value={{ color: "limegreen" }}
							>
								<AiOutlineUnlock />
							</IconContext.Provider>
							Aperti
						</h2>

						<ListaIndovinelli
							user={props.user}
							indovinelli={indovinelli.filter(
								(i) => i.stato === "aperto"
							)}
							loggedIn={loggedIn}
						></ListaIndovinelli>
					</Col>
					<Col md={5}>
						<h2>
							<IconContext.Provider value={{ color: "red" }}>
								<AiOutlineLock variant="success" />
							</IconContext.Provider>
							Chiusi
						</h2>
						<ListaIndovinelli
							user={props.user}
							indovinelli={indovinelli.filter(
								(i) => i.stato === "chiuso"
							)}
							loggedIn={loggedIn}
						></ListaIndovinelli>
					</Col>
				</Row>
			)}
		</Container>
	);
}

function ListaIndovinelli(props) {
	const indovinelli = props.indovinelli;

	return (
		<>
			<ListGroup as="ol">
				{indovinelli.map((i) => (
					<Indovinello
						user={props.user}
						indovinello={i}
						key={i.id}
						loggedIn={props.loggedIn}
					/>
				))}
			</ListGroup>
		</>
	);
}

function Indovinello(props) {
	const id = props.indovinello.id;
	const domanda = props.indovinello.domanda;
	const difficolta = props.indovinello.difficolta;
	const stato = props.indovinello.stato;
	const autore = props.indovinello.autore;
	const loggedIn = props.loggedIn;

	return (
		<ListGroup.Item as="li">
			<Row className="align-items-center">
				<Col md={8}>
					<div className="fw-bold">{domanda}</div>
					difficoltà: <Difficolta difficolta={difficolta} />
				</Col>
				<Col md={4}>
					{loggedIn ? (
						<BottoneIndovinello
							className="mx-auto"
							user={props.user}
							autore={autore}
							id={id}
							stato={stato}
						/>
					) : (
						false
					)}
				</Col>
			</Row>
		</ListGroup.Item>
	);
}

function BottoneIndovinello(props) {
	const navigate = useNavigate();

	const getTestoInterno = () => {
		if (props.stato === "aperto") {
			if (props.user.id === props.autore) {
				return (
					<>
						Visualizza <AiOutlineEye />
					</>
				);
			} else {
				return (
					<>
						Rispondi <AiOutlineArrowRight />
					</>
				);
			}
		} else {
			return (
				<>
					Visualizza <AiOutlineEye />
				</>
			);
		}
	};

	return (
		<div>
			<Button
				variant="dark"
				onClick={() => {
					navigate(`/indovinelli/${props.id}`);
				}}
			>
				{getTestoInterno()}
			</Button>
		</div>
	);
}

function Difficolta(props) {
	let livello;
	const difficoltaArray = [1, 2, 3];
	switch (props.difficolta) {
		case "facile":
			livello = 1;
			break;
		case "media":
			livello = 2;
			break;
		case "difficile":
			livello = 3;
			break;
		default:
			break;
	}
	return difficoltaArray.map((i) => {
		if (livello >= i) {
			return <IoMdRadioButtonOn key={i} />;
		} else {
			return <IoMdRadioButtonOff key={i} />;
		}
	});
}

function LegendaDifficolta(props) {
	return (
		<>
			<Table>
				<thead>
					<tr key="headerTable">
						<th>Difficoltà</th>
						<th>Simbolo</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Facile</td>
						<td>
							<Difficolta difficolta={"facile"} />
						</td>
					</tr>
					<tr>
						<td>Media</td>
						<td>
							<Difficolta difficolta={"media"} />
						</td>
					</tr>
					<tr>
						<td>Facile</td>
						<td>
							<Difficolta difficolta={"difficile"} />
						</td>
					</tr>
				</tbody>
			</Table>
		</>
	);
}

function Classifica(props) {
	return (
		<>
			<ListGroup as="ol" numbered>
				{props.classifica.map((element) => (
					<ListGroup.Item
						as="li"
						className="d-flex justify-content-between align-items-start"
						key={element.username}
					>
						<div className="ms-2 me-auto">
							<div className="fw-bold">{element.username}</div>
							Punti: {element.punti}
						</div>
					</ListGroup.Item>
				))}
			</ListGroup>
		</>
	);
}

export { Homepage, Difficolta, LegendaDifficolta };

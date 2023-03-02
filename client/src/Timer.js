import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import API from "./API";

const Timer = (props) => {
	const [seconds, setSeconds] = useState(-1);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timerRequest = () => {
			API.getTimer(props.id).then((timer) => {
				if (timer.timerValue === "scaduto") {
					setSeconds(0);
					props.disableTimer();
				} else if (timer.timerValue === "non inizializzato") {
					setSeconds(props.durata);
				} else {
					setSeconds(timer.timerValue);
					props.changeSuggerimento1(timer.suggerimento1);
					props.changeSuggerimento2(timer.suggerimento2);
				}
				setLoading(false);
			});
		};
		//Fatta la prima volta per ottenere il timer
		timerRequest();
		//Set dell'intervallo per la richiesta ogni secondo
		let interval = setInterval(() => {
			timerRequest();
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, []); //warning per le funzioni chiamate dalle props. Non messe perché inutili e causerebbero solo problemi di re-render

	return (
		<>
			{loading ? (
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			) : (
				<div>
					<h1>
						{" "}
						{Math.floor(seconds / 60)}:
						{seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}
					</h1>
				</div>
			)}
		</>
	);
};

export { Timer };

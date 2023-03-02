import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsQuestionSquare } from "react-icons/bs";
import "./my_style.css";

function LoginForm(props) {
	const [username, setUsername] = useState("user1");
	const [password, setPassword] = useState("pass");
	const [errorMessage, setErrorMessage] = useState("");

	const navigate = useNavigate();

	const handleSubmit = (event) => {
		event.preventDefault();
		setErrorMessage("");
		const credentials = { username, password };
		const errorMessages = [];

		let valid = true;
		if (username === "" || password === "") {
			valid = false;
			errorMessages.push("Uno o più campi vuoti");
		}
		if (valid) {
			//callback che fa la post di autenticazione
			props.login(credentials);
		} else {
			setErrorMessage(errorMessages.join(" | "));
		}
	};
	return (
		<Container className="mt-5">
			<Row>
				<Col md={3}></Col>
				<Col md={6}>
					<Row>
						<h2>Login</h2>
					</Row>
					<Row>
						<BsQuestionSquare className="rotated" size={210} />
					</Row>

					<Form onSubmit={handleSubmit} className="pt-1">
						{errorMessage ? (
							<Alert className="mt-3" variant="danger">
								{errorMessage}
							</Alert>
						) : (
							""
						)}
						{props.loginMessage && !errorMessage ? (
							<Alert className="mt-3" variant="danger">
								username e password non corretti
							</Alert>
						) : false}
						<Form.Group className="mt-3" controlId="username">
							<Form.Label>Username</Form.Label>
							<Form.Control
								value={username}
								onChange={(ev) => setUsername(ev.target.value)}
							/>
						</Form.Group>
						<Form.Group className="mt-3" controlId="password">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								value={password}
								onChange={(ev) => setPassword(ev.target.value)}
							/>
						</Form.Group>
						<div className="d-flex flex-row-reverse p-4">
							<Button
								variant="dark"
								type="submit"
							>
								Login
							</Button>
							<Button
								className="mx-4"
								variant="secondary"
								onClick={() => {
									navigate("/tutti");
								}}
							>
								Cancel
							</Button>
						</div>
					</Form>
				</Col>
				<Col md={3}></Col>
			</Row>
		</Container>
	);
}

function LogoutButton(props) {
	return (
		<Col>
			<span className="text-light mx-4">
				Benvenuto {props.user?.username}
			</span>
			<Button variant="outline-light" onClick={props.logout}>
				Logout
			</Button>
		</Col>
	);
}

function LoginNavigateButton(props) {
	const navigate = useNavigate();
	return (
		<Col>
			<Button
				variant="light"
				onClick={() => {
					props.changeLoginMessage("");
					navigate("/login");
				}}
			>
				Login
			</Button>
		</Col>
	);
}

export { LogoutButton, LoginNavigateButton, LoginForm };

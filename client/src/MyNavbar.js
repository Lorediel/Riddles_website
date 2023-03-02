import { Navbar, Container, Nav } from "react-bootstrap";
import {LoginNavigateButton,LogoutButton} from './LoginComponents';
import {useNavigate} from 'react-router-dom';
import { BsQuestionSquare } from "react-icons/bs";
import "./my_style.css"


function MyNavbar(props) {
	const navigate = useNavigate();
	return (
		<Navbar bg="dark" variant="dark">
			<Container>
				<Navbar.Brand><BsQuestionSquare className="rotated" /> Indovinelli</Navbar.Brand>
				<Nav className="me-auto">
					<Nav.Link onClick={() => {navigate("/")}}>Tutti gli indovinelli</Nav.Link>
					{props.loggedIn ? <Nav.Link onClick={() => {navigate("/miei")}} >I miei indovinelli</Nav.Link> : false}
					{props.loggedIn ? <Nav.Link onClick={() => {navigate("/crea")}} >Crea </Nav.Link> : false}
				</Nav>
                <div>
                    {props.loggedIn ? <LogoutButton logout={props.logout} user={props.user} /> : <LoginNavigateButton changeLoginMessage = {props.changeLoginMessage}/>}
                </div>
			</Container>
		</Navbar>
	);
}



export default MyNavbar;

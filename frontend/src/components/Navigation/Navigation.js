import { Navbar, Container, Button } from 'react-bootstrap';

function Navigation({address, balance, balanceUnit, connectAccount}) {
  function connectedWallet() {
    return `${address} (${balance} ${balanceUnit})`;
  }
  return (
    <Navbar>
      <Container>
        <Navbar.Brand href="#">Forging Tokens</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            {
              address ? connectedWallet() : <Button onClick={connectAccount}>Connect</Button>
            }
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;

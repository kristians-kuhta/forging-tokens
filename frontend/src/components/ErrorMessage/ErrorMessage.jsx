import Toast from 'react-bootstrap/Toast';

function ErrorMessage({text}) {
  return <Toast className="d-inline-block m-1" bg="danger" key={Date.now()} >
    <Toast.Body className={'text-white'}>
      { text }
    </Toast.Body>
  </Toast>;
}

export default ErrorMessage;

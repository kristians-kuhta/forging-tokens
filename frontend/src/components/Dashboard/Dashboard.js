function Dashboard({provider, isCorrectChain}) {
  if (!provider) {
    return <p>Connect to use the app!</p>;
  } else if (isCorrectChain) {
    return <p>Account connected</p>;
  } else {
    return <p>Please, switch to Polygon Mumbai testnet to use the app!</p>;
  }
}

export default Dashboard;

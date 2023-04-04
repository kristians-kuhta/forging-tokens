function Dashboard({provider}) {
  return (
    provider ? <p>Account connected</p> : <p>Connect to use the app</p>
  );
}

export default Dashboard;

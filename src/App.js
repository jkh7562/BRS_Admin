import './App.css';

function Text(props) {
    return <p>{props.children}</p>;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Text>Test</Text>
      </header>
    </div>
  );
}

export default App;

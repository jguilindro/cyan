import React from 'react';
import '../styles/App.css';
import PianoComponent from './PianoComponent'
import VisualComponent from './VisualComponent'

function App() {
  return (
    <div id="App" className="App">
      <VisualComponent></VisualComponent>
      <PianoComponent></PianoComponent>
    </div>
  );
}

export default App;

import React, { Component } from 'react';
import Presenter from '@snakesilk/react-presenter';
import HighScore from './HighScore';
import { createGame } from './game';
import './App.css';

const {game, players} = createGame();

class App extends Component {
  render() {
    return (
      <div className="App">
        <Presenter
          game={game}
          videoOverlay={<HighScore game={game} players={players}/>}
          fillWindow
        >
          <h1>Hurry Fup</h1>

          <ul className="instructions">
            <li>Do not fall down.</li>
            <li>Press <u>any</u> key to create <u>player</u>. Use same key to <u>Jump</u>.</li>
            <li>Press <u>any another key</u> to create <u>another player</u>.</li>
            <li>First player that passes platform, triggers move.</li>
          </ul>
        </Presenter>
      </div>
    );
  }
}

export default App;

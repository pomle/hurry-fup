import React, { Component } from 'react';
import Presenter from '@snakesilk/react-presenter';
import { createGame } from './game';
import './App.css';

const game = createGame();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      game: null,
    };
  }

  componentDidMount() {
    window.game = game;
  }

  render() {
    return (
      <div className="App" ref={node => this.node = node}>
        <Presenter game={game} fillWindow/>
      </div>
    );
  }
}

export default App;

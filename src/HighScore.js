import React, { Component } from 'react';

class HighScore extends Component {
  constructor(props) {
    super(props);
    console.log(props);

    const {game, players} = props;

    game.scene.events.bind(game.scene.EVENT_UPDATE_TIME, () => {
      players.forEach(({player}) => {
        if (player.velocity.x > this.state.topSpeed) {
          this.setState({
            topSpeed: player.velocity.x,
          });
        }

        if (player.position.x > this.state.topDistance) {
          this.setState({
            topDistance: player.position.x,
          });
        }
      });
    });

    this.state = {
      topSpeed: 0,
      topDistance: 0,
    };
  }

  render() {
    return (
      <div className="HighScore">
        <h2>High Score</h2>

        <table>
          <tbody>
            <tr>
              <th>Distance</th>
              <td>{this.state.topDistance.toFixed()}</td>
            </tr>
            <tr>
              <th>Speed</th>
              <td>{this.state.topSpeed.toFixed()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default HighScore;

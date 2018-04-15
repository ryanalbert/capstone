import React, { Component } from "react";
import logo from "./logo.svg";
import "./css/App.css";
import { ListGroup, ListGroupItem } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import openSocket from "socket.io-client";
const socket = openSocket("http://localhost:8000");

class App extends Component {
  state = {
    top100: null,
    timestamp: null
  };

  componentDidMount = () => {
    /*
    this.subscribeToTimer((err, timestamp) =>
      this.setState({
        timestamp
      })
    );
    */
    this.fetchTop100((err, top100) => {
      console.log(top100);
      this.setState({ top100 });
    });
  };

  subscribeToTimer = cb => {
    socket.on("timer", timestamp => cb(null, timestamp));
    socket.emit("subscribeToTimer", 1000);
  };

  fetchTop100 = callback => {
    socket.on("top100", top100 => callback(null, top100));
    socket.emit("fetchTop100");
  };

  fetchGame = callback => {};

  renderTop100 = () => {};

  render() {
    return (
      <div className="wrapper">
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
        <div>Four</div>
        <div>Five</div>
        <div>Six</div>
        <div>Seven</div>
        <div>Eight</div>
        <div>Nine</div>
        <div>Ten</div>
        <div>Eleven</div>
        <div>Twelve</div>
        {/*}
        <ListGroup>
          <ListGroupItem>1</ListGroupItem>
          <ListGroupItem>2</ListGroupItem>
          <ListGroupItem>3</ListGroupItem>
        </ListGroup>
        */}
      </div>
    );
  }
}

export default App;

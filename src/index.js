import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory } from "react-router-dom";
import { Home, Room } from "./pages";
import { cards } from "./Game/logic/cards";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const App = () => {
  const history = useHistory();

  // image loading
  for (let i = 0; i < cards.length; i++) {
    const img = new Image();
    img.src = cards[i].front;
  }

  return (
    <Switch>
      <Route exact path="/">
        <Home history={history} />
      </Route>
      <Route exact path="/rooms/:id">
        <Room history={history} />
      </Route>
      <Redirect to="/" />
    </Switch>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

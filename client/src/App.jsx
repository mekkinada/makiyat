import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import jwt_decode from 'jwt-decode';

import store from './redux/store';
import theme from './utils/theme';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './containers/Login/actions';

import PrivateRoute from './components/PrivateRoute';

import Example from './containers/Example';
import Cards from './containers/Cards';
import Navbar from './components/Navbar';
import Register from './containers/Register';
import Login from './containers/Login';
import CriarCard from './containers/CriarCard';
import EditCard from './containers/EditCard';

if (localStorage.jwtToken) {
  setAuthToken(localStorage.jwtToken);

  const decoded = jwt_decode(localStorage.jwtToken);

  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000;

  if (decoded.exp < currentTime) {

    store.dispatch(logoutUser());

    window.location.href = '/login';
  }
}

const App = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Route path="/" exact component={Cards} />
        <Route path="/register" exact component={Register} />
        <Route path="/login" exact component={Login} />

        <Switch>
          <PrivateRoute exact path="/criar-card" component={CriarCard} />
        </Switch>

        <Switch>
          <PrivateRoute exact path="/edit-card/:id" component={EditCard} />
        </Switch>
      </Router>
    </ThemeProvider>
  </Provider>
);

export default App;


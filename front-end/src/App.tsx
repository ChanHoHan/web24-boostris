import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './App.scss';
import LobbyPage from './pages/LobbyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Tetris from './components/Tetris';
// import Login from './components/login';
import OauthCallbackRouter from './routes/OauthCallbackRouter';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          {/* <PrivateRoute exact path="/" component={Town} /> */}
          <Route exact path="/" component={LobbyPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/tetris" component={Tetris}></Route>
          <Route path="/oauth" component={OauthCallbackRouter}></Route>
          {/* <Redirect path="*" to="/" /> */}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;

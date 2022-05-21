import React from 'react';
import { Route, BrowserRouter, Redirect } from 'react-router-dom';
import Login from './public/Login/Login';
import Dashboard from './private/Dashboard/Dashboard';
import Users from './private/Users/Users';
import Limits from './private/Limits/Limits';
import Settings from './private/Settings/Settings'
import Logs from './private/Logs/Logs';
import Symbols from './private/Symbols/Symbols';
import TelegramChat from './private/Users/TelegramChat';

function Routes() {

    function PrivateRoute({ children, ...rest }) {
        return (
            <Route {...rest} render={() => {
                return localStorage.getItem("token")
                    ? children
                    : <Redirect to='/' />
            }} />
        )
    }

    return (
        <BrowserRouter>
            <Route path="/" exact>
                <Login />
            </Route>
            <PrivateRoute path="/dashboard">
                <Dashboard />
            </PrivateRoute>
            <PrivateRoute path="/settings">
                <Settings />
            </PrivateRoute>
            <PrivateRoute path="/symbols">
                <Symbols />
            </PrivateRoute>
            <PrivateRoute path="/logs">
                <Logs />
            </PrivateRoute>
            <PrivateRoute path="/users">
                <Users />
            </PrivateRoute>
            <PrivateRoute path="/limits">
                <Limits />
            </PrivateRoute>
            <PrivateRoute path="/telegram-chat">
                <TelegramChat />
            </PrivateRoute>
        </BrowserRouter>
    )
}

export default Routes;
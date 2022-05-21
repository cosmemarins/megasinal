import React, { useState, useEffect } from 'react';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import Toast from '../../components/Toast/Toast';
import SelectSymbol from '../../components/SelectSymbol/SelectSymbol';
import MyStrategies from './MyStrategies/MyStrategies';
import SharedStrategies from './SharedStrategies/SharedStrategies';

function Strategies() {

    const [symbol, setSymbol] = useState('');

    const [notification, setNotification] = useState({ type: '', text: '' });

    function onSymbolChange(event) {
        setSymbol(event.target.value);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">My Strategies</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <div className="me-2 mt-3">
                                <SelectSymbol symbol={symbol} disabled={false} onChange={onSymbolChange} showAny={false} onlyFavorites={false} />
                            </div>
                            <button id="btnNewStrategy" className="btn btn-primary animate-up-2" data-bs-toggle="modal" data-bs-target="#modalStrategy">
                                <svg className="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" /></svg>
                                New Strategy
                            </button>
                        </div>
                    </div>
                </div>
                <MyStrategies symbol={symbol} onNotification={setNotification} />
                <SharedStrategies symbol={symbol} onNotification={setNotification} />
                <Footer />
            </main>
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default Strategies;

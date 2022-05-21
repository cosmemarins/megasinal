import React, { useState, useEffect } from 'react';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import CandleChart from './CandleChart';
import SelectSymbol from '../../components/SelectSymbol/SelectSymbol';
import { getDashboard } from '../../services/HydraService';
import InfoBlock from './InfoBlock/InfoBlock';
import Toast from '../../components/Toast/Toast';
import useWebSocket from 'react-use-websocket';

function Dashboard() {

    const [notification, setNotification] = useState({ text: '', type: '' });
    const [chartSymbol, setChartSymbol] = useState('BTCUSDT');
    const [report, setReport] = useState({});

    useEffect(() => {
        getDashboard()
            .then(result => setReport(result))
            .catch(error => {
                console.error(error.response ? error.response.data : error);
                setNotification({ type: 'error', text: error.response ? error.response.data : error });
            })
    }, [])

    function onChangeSymbol(event) {
        setChartSymbol(event.target.value);
    }

    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
        onOpen: () => {
            console.log('Admin connected to App WS!');
        },
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.book)
                    setReport(prevState => ({ ...prevState, book: new Date().toLocaleTimeString('en-US') }));
                else if (lastJsonMessage.miniTicker)
                    setReport(prevState => ({ ...prevState, miniTicker: new Date().toLocaleTimeString('en-US') }));
            }
        },
        queryParams: { 'token': localStorage.getItem('token') },
        onError: (event) => {
            console.error(event);
            setNotification({ type: 'error', text: JSON.stringify(event) });
        },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    })

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">Dashboard</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <SelectSymbol onlyFavorites={false} onChange={onChangeSymbol} />
                        </div>
                    </div>
                </div>
                <CandleChart symbol={chartSymbol} />
                <div className="row">
                    <InfoBlock title="Active Automations" value={report.automations} precision={0} background="success">
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                            </path>
                        </svg>
                    </InfoBlock>
                    <InfoBlock title="Active Monitors" value={report.monitors} precision={0} background="info">
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                    </InfoBlock>
                    <InfoBlock title="Active Users" value={report.users} precision={0} background="primary">
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    </InfoBlock>
                    <InfoBlock title="Active Connections" value={report.connections ? report.connections.length : 0} precision={0} background="secondary">
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    </InfoBlock>
                    <InfoBlock title="Mini-Ticker Health" value={report.miniTicker} precision={0} background="warning">
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                    </InfoBlock>
                    <InfoBlock title="Book Health" value={report.book} precision={0} background="danger">
                        <svg className="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
                    </InfoBlock>
                </div>
                <Footer />
            </main>
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    )
}

export default Dashboard;
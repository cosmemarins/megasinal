import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import { getLogList } from '../../services/LogsService';
import Pagination from '../../components/Pagination/Pagination';
import Toast from '../../components/Toast/Toast';
import LogModal from '../../components/Logs/LogModal';
import LogRow from './LogRow';
import BeholderButton from './Beholder/BeholderButton';
import BeholderModal from './Beholder/BeholderModal';
import SelectUser from './SelectUser';

function Logs() {

    const defaultLocation = useLocation();

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page');
    }

    const history = useHistory();

    useEffect(() => {
        return history.listen((location) => {
            setPage(getPage(location));
        })
    }, [history])

    const [logs, setLogs] = useState([]);

    const [count, setCount] = useState(0);

    const [notification, setNotification] = useState({ type: '', text: '' });

    const [viewLog, setViewLog] = useState('');

    const [userId, setUserId] = useState('');

    const [page, setPage] = useState(getPage());

    useEffect(() => {
        getLogList(userId, page || 1)
            .then(result => {
                setLogs(result.rows);
                setCount(result.count);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });

    }, [page, userId])

    function onViewClick(event) {
        const file = event.target.id.replace('logs', '');
        setViewLog(file.replace('.log', ''));
    }

    function onUserChange(event) {
        setUserId(event.target.value);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">Logs</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <BeholderButton />
                            <SelectUser onChange={onUserChange} />
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Log File</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                logs && logs.length
                                    ? logs.map(log => (<LogRow key={log} data={log} onViewClick={onViewClick} />))
                                    : <React.Fragment></React.Fragment>
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
                <Footer />
            </main>
            <BeholderModal />
            <LogModal file={viewLog} />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default Logs;

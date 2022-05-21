import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import AutomationModal from './AutomationModal/AutomationModal';
import GridModal from './GridModal/GridModal';
import AutomationRow from './AutomationRow';
import { getAutomations, startAutomation, stopAutomation, deleteAutomation } from '../../services/AutomationsService';
import Pagination from '../../components/Pagination/Pagination';
import Toast from '../../components/Toast/Toast';
import NewAutomationButton from './NewAutomationButton';
import BacktestButton from './BacktestModal/BacktestButton';
import BacktestModal from './BacktestModal/BacktestModal';

function Automations() {

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

    const [automations, setAutomations] = useState([]);

    const [count, setCount] = useState(0);

    const [notification, setNotification] = useState({ type: '', text: '' });

    const DEFAULT_AUTOMATION = {
        symbol: "",
        conditions: "",
        actions: [],
        name: '',
        indexes: ''
    }

    const [editAutomation, setEditAutomation] = useState(DEFAULT_AUTOMATION);

    const [page, setPage] = useState(getPage());

    useEffect(() => {
        getAutomations(page || 1)
            .then(result => {
                setAutomations(result.rows);
                setCount(result.count);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });

    }, [page])

    function onEditClick(event) {
        const id = event.target.id.replace('edit', '');
        const automation = automations.find(m => m.id == id);
        setEditAutomation({ ...automation });
    }

    function onStopClick(event) {
        const id = event.target.id.replace('stop', '');
        stopAutomation(id)
            .then(automation => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message)
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onStartClick(event) {
        const id = event.target.id.replace('start', '');
        startAutomation(id)
            .then(automation => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message)
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onDeleteClick(event) {
        const id = event.target.id.replace('delete', '');
        deleteAutomation(id)
            .then(automation => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message)
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onAutomationSubmit(automation) {
        history.go(0);
    }

    function onNewAutomationClick(event) {
        if (event.target.id === 'linkSchedule')
            setEditAutomation({ ...DEFAULT_AUTOMATION, schedule: new Date().toISOString() });
        else
            setEditAutomation({ ...DEFAULT_AUTOMATION });
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">Automations</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <BacktestButton />
                            <NewAutomationButton onClick={onNewAutomationClick} />
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Symbol</th>
                                <th className="border-gray-200">Name</th>
                                <th className="border-gray-200">Status</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                automations && automations.length
                                    ? automations.map(automation => (<AutomationRow key={automation.id} data={automation} onEditClick={onEditClick} onStartClick={onStartClick} onStopClick={onStopClick} onDeleteClick={onDeleteClick} />))
                                    : <React.Fragment></React.Fragment>
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
                <Footer />
            </main>
            <AutomationModal data={editAutomation} onSubmit={onAutomationSubmit} />
            <GridModal data={editAutomation} onSubmit={onAutomationSubmit} />
            <BacktestModal />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default Automations;

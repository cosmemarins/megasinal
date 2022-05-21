import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import LimitRow from './LimitRow';
import { getLimits, startLimit, stopLimit, deleteLimit } from '../../services/LimitsService';
import Pagination from '../../components/Pagination/Pagination';
import Toast from '../../components/Toast/Toast';
import NewLimitButton from './NewLimitButton';
import LimitModal from './LimitModal';

function Limits() {

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

    const [limits, setLimits] = useState([]);

    const [count, setCount] = useState(0);

    const [notification, setNotification] = useState({ type: '', text: '' });

    const [editLimit, setEditLimit] = useState({});

    const [page, setPage] = useState(getPage());

    useEffect(() => {
        getLimits(page || 1)
            .then(result => {
                setLimits(result.rows);
                setCount(result.count);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });

    }, [page])

    function onEditClick(event) {
        const id = event.target.id.replace('edit', '');
        const limit = limits.find(m => m.id == id);
        setEditLimit({ ...limit });
    }

    function onStopClick(event) {
        const id = event.target.id.replace('stop', '');
        stopLimit(id)
            .then(result => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onStartClick(event) {
        const id = event.target.id.replace('start', '');
        startLimit(id)
            .then(result => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message)
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onDeleteClick(event) {
        const id = event.target.id.replace('delete', '');
        deleteLimit(id)
            .then(result => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onLimitSubmit(order) {
        history.go(0);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">Limits</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <NewLimitButton />
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Name</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                limits && limits.length
                                    ? limits.map(limit => (<LimitRow key={limit.id} data={limit} onEditClick={onEditClick} onStartClick={onStartClick} onStopClick={onStopClick} onDeleteClick={onDeleteClick} />))
                                    : <React.Fragment></React.Fragment>
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
                <Footer />
            </main>
            <LimitModal onSubmit={onLimitSubmit} data={editLimit} />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default Limits;

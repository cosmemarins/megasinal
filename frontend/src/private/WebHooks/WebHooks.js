import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import WebHookRow from './WebHookRow';
import Pagination from '../../components/Pagination/Pagination';
import WebHookModal from './WebHookModal';
import Toast from '../../components/Toast/Toast';
import NewWebHookButton from './NewWebHookButton';
import { getWebHooks, deleteWebHook } from '../../services/WebHooksService';

function WebHooks() {

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

    const [webHooks, setWebHooks] = useState([]);

    const [count, setCount] = useState(0);

    const [notification, setNotification] = useState({ type: '', text: '' });

    const [editWebHook, setEditWebHook] = useState({});

    const [page, setPage] = useState(getPage());

    useEffect(() => {
        getWebHooks(page || 1)
            .then(result => {
                setWebHooks(result.rows);
                setCount(result.count);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }, [page])

    function onEditClick(event) {
        const id = event.target.id.replace('edit', '');
        const webHook = webHooks.find(wh => wh.id == id);
        setEditWebHook({ ...webHook });
    }

    function onDeleteClick(event) {
        const id = event.target.id.replace('delete', '');
        deleteWebHook(id)
            .then(webHooks => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onWebHookSubmit(order) {
        history.go(0);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">WebHooks</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <NewWebHookButton />
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Symbol</th>
                                <th className="border-gray-200">Name</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                webHooks && webHooks.length
                                    ? webHooks.map(webHook => (<WebHookRow key={webHook.id} data={webHook} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />))
                                    : <React.Fragment></React.Fragment>
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
                <Footer />
            </main>
            <WebHookModal data={editWebHook} onSubmit={onWebHookSubmit} />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    );
}

export default WebHooks;

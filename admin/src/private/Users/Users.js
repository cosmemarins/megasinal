import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import NewUserButton from './NewUserButton';
import UserRow from './UserRow';
import Pagination from '../../components/Pagination/Pagination';
import { getUsers, deleteUser, startUser, stopUser } from '../../services/UsersService';
import Toast from '../../components/Toast/Toast';
import SearchUser from './SearchUser';
import UserModal from './UserModal/UserModal';

function Users() {

    const defaultLocation = useLocation();

    const history = useHistory();

    const [users, setUsers] = useState([]);

    const [editUser, setEditUser] = useState({});

    const [count, setCount] = useState(0);

    const [search, setSearch] = useState('');

    const [page, setPage] = useState(getPage());

    const [notification, setNotification] = useState({ type: '', text: '' });

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page');
    }

    useEffect(() => {
        return history.listen((location) => {
            setPage(getPage(location));
        })
    }, [history])

    useEffect(() => {
        getUsers(search, page || 1)
            .then(result => {
                setUsers(result.rows);
                setCount(result.count);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });

    }, [page, search])

    function onEditClick(event) {
        const id = event.target.id.replace('edit', '');
        setEditUser(users.find(u => u.id == id));
    }

    function onStopClick(event) {
        const id = event.target.id.replace('stop', '');
        stopUser(id)
            .then(result => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onStartClick(event) {
        const id = event.target.id.replace('start', '');
        startUser(id)
            .then(result => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message)
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onDeleteClick(event) {
        const id = event.target.id.replace('delete', '');
        deleteUser(id)
            .then(result => { history.go(0) })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }

    function onSearchChange(event) {
        setSearch(event.target.value);
    }

    function onModalSubmit(event) {
        history.go(0);
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h2 className="h4">Users</h2>
                    </div>
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="d-inline-flex align-items-center">
                            <NewUserButton />
                            <SearchUser placeholder={search} onChange={onSearchChange} />
                        </div>
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Name</th>
                                <th className="border-gray-200">Email</th>
                                <th className="border-gray-200">Limit</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                users && users.length
                                    ? users.map(user => (<UserRow key={user.id} data={user} onEditClick={onEditClick} onStartClick={onStartClick} onStopClick={onStopClick} onDeleteClick={onDeleteClick} />))
                                    : <React.Fragment></React.Fragment>
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} />
                </div>
                <Footer />
            </main>
            <UserModal data={editUser} onSubmit={onModalSubmit} />
            <Toast type={notification.type} text={notification.text} />
        </React.Fragment>
    )
}

export default Users;
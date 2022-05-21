import React, { useState, useEffect } from 'react';
import { getActiveUsers } from '../../services/UsersService'

/**
 * props:
 * - onChange
 */
function SelectUser(props) {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        getActiveUsers()
            .then(result => setUsers(result))
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setUsers(['ERROR']);
            });
    }, [])

    return (
        <select id="userId" className="form-select" onChange={props.onChange}>
            <option value="">All</option>
            {
                users && users.length
                    ? users.map(u => (<option key={"u"+u.id} value={u.id}>{u.name}</option>))
                    : <React.Fragment></React.Fragment>
            }
        </select>
    )
}

export default SelectUser;

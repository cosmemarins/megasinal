import React, { useRef, useState, useEffect } from 'react';
import { saveUser, resetUserPassword } from '../../../services/UsersService';
import SelectLimit from './SelectLimit';
import SwitchInput from '../../../components/SwitchInput/SwitchInput';

/**
 * props:
 * - data
 * - onSubmit
 */
function UserModal(props) {

    const DEFAULT_USER = {
        name: '',
        email: '',
        password: '',
        limitId: 0,
        telegramChat: '',
        phone: '',
        isActive: false
    }

    const [error, setError] = useState('');

    const [user, setUser] = useState(DEFAULT_USER);

    const btnClose = useRef('');
    const btnSave = useRef('');

    function onSubmit(event) {
        saveUser(user.id, user)
            .then(result => {
                btnClose.current.click();
                if (props.onSubmit) props.onSubmit(result);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setError(err.response ? err.response.data : err.message);
            })
    }

    function onResetClick(event) {
        resetUserPassword(user.id)
            .then(result => {
                btnClose.current.click();
                if (props.onSubmit) props.onSubmit(result);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setError(err.response ? err.response.data : err.message);
            })
    }

    function onInputChange(event) {
        setUser(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    useEffect(() => {
        setUser(props.data);
    }, [props.data.id])

    useEffect(() => {
        const modal = document.getElementById('modalUser');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setUser({ ...DEFAULT_USER });
        })
    }, [])

    return (
        <div className="modal fade" id="modalUser" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">{props.data.id ? 'Edit ' : 'New '}User</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="name">Name:</label>
                                        <input type="text" id="name" className="form-control" onChange={onInputChange} value={user.name} placeholder="User's full name" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="email">Email:</label>
                                        <input type="text" id="email" className="form-control" onChange={onInputChange} value={user.email} placeholder="user@email.com" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="phone">Cellphone:</label>
                                        <input type="text" id="phone" className="form-control" onChange={onInputChange} value={user.phone} placeholder="+5551123456789" />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="telegramChat">Telegram Chat ID: <a className="badge bg-secondary py-1" href="/telegram-chat" target="_blank">?</a></label>
                                        <input type="text" id="telegramChat" className="form-control" onChange={onInputChange} value={user.telegramChat} placeholder="123456789" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="limit">Limit:</label>
                                        <SelectLimit id={user.limitId} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <SwitchInput id="isActive" text="Is Active?" onChange={onInputChange} isChecked={user.isActive} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {
                            error
                                ? <div className="alert alert-danger mt-1 col-9 py-1">{error}</div>
                                : <React.Fragment></React.Fragment>
                        }
                        {
                            user.id > 0
                                ? <button type="button" className="btn btn-sm btn-secondary" onClick={onResetClick}>Reset Password</button>
                                : <React.Fragment></React.Fragment>
                        }
                        <button ref={btnSave} type="button" className="btn btn-sm btn-primary" onClick={onSubmit}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserModal;

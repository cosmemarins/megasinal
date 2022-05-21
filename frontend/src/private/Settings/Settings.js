import React, { useState, useEffect, useRef } from 'react';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import Toast from '../../components/Toast/Toast';

import { getSettings, updateSettings } from '../../services/SettingsService';

function Settings() {

    const confirmPassword = useRef('');
    const [settings, setSettings] = useState({});
    const [notification, setNotification] = useState({});

    useEffect(() => {

        getSettings()
            .then(result => setSettings(result))
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            })
    }, []);

    function onInputChange(event) {
        setSettings(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    function onFormSubmit(event) {
        if ((settings.password || confirmPassword.current.value)
            && settings.password !== confirmPassword.current.value)
            return setNotification({ type: 'error', text: `The fields New Password and Confirm Password must be equal.` });

        updateSettings(settings)
            .then(result => {
                if (result)
                    setNotification({ type: 'success', text: `Settings saved successfully!` });
                else
                    setNotification({ type: 'error', text: result });
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            })
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h1 className="h4">Settings</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card card-body border-0 shadow mb-4">
                            <h2 className="h5 mb-4">Personal Settings</h2>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input className="form-control" id="email" type="email" placeholder="name@company.com" value={settings.email || ''} onChange={onInputChange} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="phone">Cellphone</label>
                                        <input className="form-control" id="phone" type="text" placeholder="+1 51 123456789" value={settings.phone || ''} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div>
                                        <label htmlFor="password">New Password</label>
                                        <input className="form-control" id="password" type="password" placeholder="Enter your new password" value={settings.password || ''} onChange={onInputChange} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div>
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <input ref={confirmPassword} className="form-control" id="confirmPassword" type="password" placeholder="Your new password again" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="telegramChat">Telegram Chat ID</label><a href={"https://t.me/" + settings.telegramBot} className="badge bg-secondary py-1 ms-1">?</a>
                                        <input className="form-control" id="telegramChat" type="text" placeholder="Enter the Telegram Chat ID" value={settings.telegramChat || ''} onChange={onInputChange} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="limit">Limit Plan</label>
                                        <input className="form-control" id="limit" type="text" disabled={true} value={settings.limit ? settings.limit.name : ''} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap">
                                    <div className="col-sm-3">
                                        <button className="btn btn-gray-800 mt-2 animate-up-2" type="button" onClick={onFormSubmit}>Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card card-body border-0 shadow mb-4">
                            <h2 className="h5 my-4">Binance Settings</h2>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="accessKey">Access Key</label>
                                        <input className="form-control" id="accessKey" type="text" placeholder="Enter the API Access Key" value={settings.accessKey || ''} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="secretKey">New Secret Key</label>
                                        <input className="form-control" id="secretKey" type="password" placeholder="Enter your new API Secret Key" value={settings.secretKey || ''} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap">
                                    <div className="col-sm-3">
                                        <button className="btn btn-gray-800 mt-2 animate-up-2" type="button" onClick={onFormSubmit}>Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
            <Toast text={notification.text} type={notification.type} />
        </React.Fragment >
    );
}

export default Settings;

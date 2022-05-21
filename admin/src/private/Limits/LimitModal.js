import React, { useRef, useState, useEffect } from 'react';
import SwitchInput from '../../components/SwitchInput/SwitchInput';
import { saveLimit } from '../../services/LimitsService';

/**
 * props:
 * - data
 * - onSubmit
 */
function LimitModal(props) {

    const DEFAULT_LIMIT = {
        name: '',
        maxAutomations: 0,
        maxMonitors: 0,
        MaxBacktests: 0,
        isActive: false
    }

    const [error, setError] = useState('');

    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const btnClose = useRef('');

    function onSubmit(event) {
        saveLimit(limit.id, limit)
            .then(result => {
                btnClose.current.click();
                if (props.onSubmit) props.onSubmit(result);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setError(err.message);
            })
    }

    function onInputChange(event) {
        setLimit(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    useEffect(() => {
        setLimit(props.data);
    }, [props.data.id])

    useEffect(() => {
        const modal = document.getElementById('modalLimit');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setLimit({ ...DEFAULT_LIMIT });
        })
    }, [])

    return (
        <div className="modal fade" id="modalLimit" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">{props.data.id ? 'Edit ' : 'New '}Limit</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="name">Name:</label>
                                        <input type="text" id="name" className="form-control" onChange={onInputChange} value={limit.name} placeholder="Limit's name" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-sm-6 mb-3">
                                    <div className="form-group mb-4">
                                        <label htmlFor="maxAutomations">Max. Automations:</label>
                                        <input type="number" id="maxAutomations" className="form-control" onChange={onInputChange} value={limit.maxAutomations} placeholder="0" />
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 mb-3">
                                    <div className="form-group mb-4">
                                        <label htmlFor="maxMonitors">Max. <br />Monitors:</label>
                                        <input type="number" id="maxMonitors" className="form-control" onChange={onInputChange} value={limit.maxMonitors} placeholder="0" />
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 mb-3">
                                    <div className="form-group mb-4">
                                        <label htmlFor="maxBacktests">Max. Backtests/mo.:</label>
                                        <input type="number" id="maxBacktests" className="form-control" onChange={onInputChange} value={limit.maxBacktests} placeholder="0" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <SwitchInput id="isActive" text="Is Active?" onChange={onInputChange} isChecked={limit.isActive} />
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
                        <button type="button" className="btn btn-sm btn-primary" onClick={onSubmit}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LimitModal;

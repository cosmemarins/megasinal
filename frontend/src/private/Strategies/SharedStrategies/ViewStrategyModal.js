import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { copyStrategy } from '../../../services/StrategiesService';

/**
 * props:
 * - data
 */
function ViewStrategyModal(props) {

    const DEFAULT_STRATEGY = {
        id: 0,
        symbol: '',
        name: '',
        sharedWith: '',
        startedAt: '',
        monitor: {},
        buyAutomation: {},
        sellAutomation: {},
        user: {}
    }

    const history = useHistory();

    const btnClose = useRef('');

    const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);

    const [error, setError] = useState('');

    useEffect(() => {
        if (!props.data || !props.data.id)
            setStrategy({ ...DEFAULT_STRATEGY });
        else
            setStrategy(props.data);
    }, [props.data])

    function errorHandling(err) {
        setError(err.response ? err.response.data : err.message);
    }

    function onCopyClick(event) {
        copyStrategy(strategy.id)
            .then(result => {
                btnClose.current.click();
                return history.go(0);
            })
            .catch(err => errorHandling(err))
    }

    useEffect(() => {
        const modal = document.getElementById('modalViewStrategy');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setStrategy({ ...DEFAULT_STRATEGY });
        })
    }, [])

    return (
        <div className="modal fade" id="modalViewStrategy" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title">Strategy Details</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form>
                        <div className="modal-body">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b>Symbol:</b> {strategy.symbol}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <b>Name:</b> {strategy.name}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <b>Author:</b> {strategy.user.name}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <b>Monitor:</b> {strategy.monitor.type} {strategy.monitor.interval}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <b>Buy Automation:</b> {strategy.buyAutomation.name}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <b>Sell Automation:</b> {strategy.sellAutomation.name}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {
                                error ?
                                    <div className="alert alert-danger mt-1 col-7 py-1">{error}</div>
                                    : <React.Fragment></React.Fragment>
                            }
                            <button type="button" className="btn btn-sm btn-primary" onClick={onCopyClick}>
                                <svg className="icon icon-xs" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                                Copy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    )
}

export default ViewStrategyModal;

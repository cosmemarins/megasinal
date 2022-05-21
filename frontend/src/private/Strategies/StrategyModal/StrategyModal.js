import React, { useRef, useState, useEffect } from 'react';
import SelectSymbol from '../../../components/SelectSymbol/SelectSymbol';
import SwitchInput from '../../../components/SwitchInput/SwitchInput';
import { saveStrategy } from '../../../services/StrategiesService';
import SelectMonitor from './SelectMonitor';
import SelectAutomation from './SelectAutomation';
import ShareInput from './ShareInput';

/**
 * props:
 * - data
 * - onSubmit
 */
function StrategyModal(props) {

    const DEFAULT_STRATEGY = {
        id: 0,
        name: "",
        symbol: "",
        userId: 0,
        buyAutomationId: 0,
        sellAutomationId: 0,
        monitorId: 0,
        isActive: false,
        startedAt: "",
        sharedWith: "none"
    }

    const [error, setError] = useState('');

    const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);

    const btnClose = useRef('');
    const btnSave = useRef('');

    useEffect(() => {
        const modal = document.getElementById('modalStrategy');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setStrategy({ ...DEFAULT_STRATEGY });
        })
    }, [])

    function onSubmit(event) {
        saveStrategy(strategy.id, strategy)
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
        setStrategy(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    useEffect(() => {
        if (!props.data || !props.data.id)
            setStrategy({ ...DEFAULT_STRATEGY });
        else
            setStrategy(props.data);
    }, [props.data])

    return (
        <div className="modal fade" id="modalStrategy" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">{props.data.id ? 'Edit ' : 'New '}Strategy</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="symbol">Symbol:</label>
                                        <SelectSymbol onChange={onInputChange} symbol={strategy.symbol} onlyFavorites={false} disabled={strategy.id > 0} showAny={false} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="name">Name: </label>
                                        <input type="text" id="name" className="form-control" onChange={onInputChange} value={strategy.name ? strategy.name : ''} placeholder="My Strategy Name" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="monitorId">Monitor: </label>
                                        <SelectMonitor symbol={strategy.symbol} monitorId={strategy.monitorId} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="buyAutomationId">Buy Automation: </label>
                                        <SelectAutomation symbol={strategy.symbol} id="buyAutomationId" automationId={strategy.buyAutomationId} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="buyAutomationId">Sell Automation: </label>
                                        <SelectAutomation symbol={strategy.symbol} id="sellAutomationId" automationId={strategy.sellAutomationId} onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            <ShareInput sharedWith={strategy.sharedWith} onChange={onInputChange} />
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <SwitchInput id="isActive" text="Is Active?" onChange={onInputChange} isChecked={strategy.isActive} />
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
                        <button ref={btnSave} type="button" className="btn btn-sm btn-primary" onClick={onSubmit}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StrategyModal;

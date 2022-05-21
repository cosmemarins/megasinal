import React, { useState, useEffect, useRef } from 'react';

/**
 * props:
 * - data
 */
function SymbolModal(props) {

    const DEFAULT_SYMBOL = {
        symbol: '',
        basePrecision: '',
        quotePrecision: '',
        minNotional: '',
        minLotSize: '',
        tickSize: '',
        stepSize: ''
    }

    const btnClose = useRef('');
    const [error, setError] = useState('');
    const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);

    useEffect(() => {
        if (!props.data) return;
        setSymbol(props.data);
    }, [props.data])

    useEffect(() => {
        const modal = document.getElementById('modalSymbol');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setSymbol({ ...DEFAULT_SYMBOL });
        })
    }, [])

    return (
        <div className="modal fade" id="modalSymbol" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">View Symbol</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="py-3">
                            <div className="form-group mb-4">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group mb-4">
                                            <label htmlFor="symbol">Symbol</label>
                                            <div className="input-group">
                                                <input className="form-control" id="symbol" type="text" placeholder="BTCUSD" defaultValue={symbol.symbol} required disabled />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b>Base Precision: </b>{symbol.basePrecision}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <b>Quote Precision: </b>{symbol.quotePrecision}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b>Min. Notional: </b>{symbol.minNotional}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <b>Min. Lot Size: </b>{symbol.minLotSize}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b>Tick Size: </b>{symbol.tickSize}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <b>Step Size: </b>{symbol.stepSize}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        error
                            ? <div className="alert alert-danger">{error}</div>
                            : <React.Fragment></React.Fragment>
                    }
                </div>
            </div>
        </div>
    )
}

export default SymbolModal;
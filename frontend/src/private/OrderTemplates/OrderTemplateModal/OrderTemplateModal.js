import React, { useRef, useState, useEffect } from 'react';
import SelectSymbol from '../../../components/SelectSymbol/SelectSymbol';
import SelectSide from '../../../components/NewOrder/SelectSide';
import OrderType from '../../../components/NewOrder/OrderType';
import { saveOrderTemplate } from '../../../services/OrderTemplatesService';
import { STOP_TYPES } from '../../../services/ExchangeService';
import { getIndexes } from '../../../services/BeholderService';
import PriceTemplate from './PriceTemplate';
import QuantityTemplate from './QuantityTemplate';
import TrailingTemplate from './TrailingTemplate';

/**
 * props:
 * - data
 * - onSubmit
 */
function OrderTemplateModal(props) {

    const DEFAULT_ORDER_TEMPLATE = {
        name: '',
        symbol: '',
        type: 'MARKET',
        side: 'BUY',
        limitPrice: '',
        limitPriceMultiplier: 1,
        stopPrice: '',
        stopPriceMultiplier: 1,
        quantity: '',
        quantityMultiplier: 1,
        icebergQty: '',
        icebergQtyMultiplier: 1
    }

    const [error, setError] = useState('');

    const [orderTemplate, setOrderTemplate] = useState(DEFAULT_ORDER_TEMPLATE);

    const btnClose = useRef('');
    const btnSave = useRef('');

    function onSubmit(event) {
        saveOrderTemplate(orderTemplate.id, orderTemplate)
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
        setOrderTemplate(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    useEffect(() => {
        setError('');

        if (!props.data || !props.data.id)
            setOrderTemplate(DEFAULT_ORDER_TEMPLATE);
        else
            setOrderTemplate(props.data);
    }, [props.data])

    function getPriceClasses(orderType) {
        if (!orderType) return "col-md-6 mb-3 d-none";
        return ['MARKET', 'STOP_LOSS', 'TAKE_PROFIT', 'TRAILING_STOP'].includes(orderType) ? "col-md-6 mb-3 d-none" : "col-md-6 mb-3";
    }

    function getStopPriceClasses(orderType) {
        return STOP_TYPES.includes(orderType) ? "col-md-6 mb-3" : "col-md-6 mb-3 d-none";
    }

    useEffect(() => {
        const modal = document.getElementById('modalOrderTemplate');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setOrderTemplate({ ...DEFAULT_ORDER_TEMPLATE });
        })
    }, [])

    return (
        <div className="modal fade" id="modalOrderTemplate" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">{orderTemplate.id ? "Edit" : "New"} Order Template</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="symbol">Symbol:</label>
                                        <SelectSymbol symbol={orderTemplate.symbol} onChange={onInputChange} onlyFavorites={false} showAny={true} disabled={orderTemplate.id > 0} />
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <SelectSide side={orderTemplate.side} onChange={onInputChange} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <OrderType type={orderTemplate.type} onChange={onInputChange} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="name">Name:</label>
                                        <input id="name" type="text" className="form-control" value={orderTemplate.name || ''} placeholder="My Template Name" onChange={onInputChange} />
                                    </div>
                                </div>
                            </div>
                            {
                                orderTemplate.type === 'TRAILING_STOP'
                                    ? <TrailingTemplate data={orderTemplate} onChange={onInputChange} />
                                    : (
                                        <div className="row">
                                            <div className={getPriceClasses(orderTemplate.type)}>
                                                <PriceTemplate id="limitPrice" text="Unit Price:" symbol={orderTemplate.symbol} onChange={onInputChange} price={orderTemplate.limitPrice} multiplier={orderTemplate.limitPriceMultiplier} />
                                            </div>
                                            <div className={getStopPriceClasses(orderTemplate.type)}>
                                                <PriceTemplate id="stopPrice" text="Stop Price:" symbol={orderTemplate.symbol} onChange={onInputChange} price={orderTemplate.stopPrice} multiplier={orderTemplate.stopPriceMultiplier} />
                                            </div>
                                        </div>
                                    )
                            }
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <QuantityTemplate id="quantity" text="Quantity:" quantity={orderTemplate.quantity} multiplier={orderTemplate.quantityMultiplier} onChange={onInputChange} />
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

export default OrderTemplateModal;

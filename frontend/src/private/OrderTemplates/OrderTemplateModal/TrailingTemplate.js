import React, { useState, useEffect } from 'react';
import PriceTemplate from './PriceTemplate';

/**
 * props:
 * - data
 * - onChange
 */
function TrailingTemplate(props) {

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

    const [orderTemplate, setOrderTemplate] = useState(DEFAULT_ORDER_TEMPLATE);

    useEffect(() => {
        setOrderTemplate(props.data);
    }, [props.data])

    return (
        <div className="row">
            <div className="col-md-6 mb-3">
                <PriceTemplate id="limitPrice" text="Activation Price:" symbol={orderTemplate.symbol} onChange={props.onChange} price={orderTemplate.limitPrice} multiplier={orderTemplate.limitPriceMultiplier} />
            </div>
            <div className="col-md-3 mb-3">
                <label htmlFor="stopPriceMultiplier">Callback Rate:</label>
                <div className="input-group">
                    <input id="stopPriceMultiplier" type="number" className="form-control" value={orderTemplate.stopPriceMultiplier || ''} placeholder="1" onChange={props.onChange} />
                    <span className="input-group-text bg-secondary">
                        %
                    </span>
                </div>
            </div>
            <div className="col-md-3 mb-3">
                <label htmlFor="stopPrice">Current Stop:</label>
                <input id="stopPrice" type="number" className="form-control" value={orderTemplate.stopPrice || ''} placeholder="0" disabled={true} />
            </div>
        </div>
    )
}

export default TrailingTemplate;

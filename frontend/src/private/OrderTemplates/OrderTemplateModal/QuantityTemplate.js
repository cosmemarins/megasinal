import React, { useEffect, useState } from 'react';

/**
 * props:
 * - id
 * - text
 * - quantity
 * - multiplier
 * - onChange
 */
function QuantityTemplate(props) {

    const [quantityTemplate, setQuantityTemplate] = useState({ quantity: '', multiplier: '' });

    useEffect(() => {
        setQuantityTemplate({ quantity: props.quantity, multiplier: props.multiplier });
    }, [props.quantity, props.multiplier])

    return (
        <div className="form-group">
            <label htmlFor={props.id}>{props.text} <span data-bs-toggle="tooltip" data-bs-placement="top" title="Max. Wallet trades the maximum you have. Min. Notional trades the minimum allowed. Multiplying by 1 = 100%." className="badge bg-warning py-1">?</span></label>
            <div className="input-group">
                <input id={props.id} list="qtyOptions" type="text" className="form-control w-50" onChange={props.onChange} placeholder="0" value={quantityTemplate.quantity || ''} />
                <span className="input-group-text bg-secondary">
                    X
                </span>
                <input id={props.id + "Multiplier"} type="number" className="form-control" onChange={props.onChange} placeholder="1" value={quantityTemplate.multiplier || ''} />
                <datalist id="qtyOptions">
                    <option>LAST_ORDER_QTY</option>
                    <option>MAX_WALLET</option>
                    <option>MIN_NOTIONAL</option>
                </datalist>
            </div>
        </div>
    )
}

export default QuantityTemplate;
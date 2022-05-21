import React, { useEffect, useState } from 'react';
import { getMonitorsBySymbol } from '../../../services/MonitorsService';

/**
 * props:
 * - id
 * - text
 * - symbol
 * - price
 * - multiplier
 * - onChange
 */
function PriceTemplate(props) {

    const [intervals, setIntervals] = useState([]);
    const [priceTemplate, setPriceTemplate] = useState({ price: '', multiplier: '' });

    useEffect(() => {
        setPriceTemplate({ price: props.price, multiplier: props.multiplier });
    }, [props.price, props.multiplier])

    useEffect(() => {
        if (!props.symbol) return;
        getMonitorsBySymbol(props.symbol)
            .then(monitors => setIntervals(monitors.filter(m => m.type === 'CANDLES' && m.isActive && !m.isSystemMon).map(m => m.interval)))
            .catch(err => console.log(err.response ? err.response.data : err.message));
    }, [props.symbol])

    return (
        <div className="form-group">
            <label htmlFor={props.id}>{props.text} <span data-bs-toggle="tooltip" data-bs-placement="top" title="Specify a price or choose an index. Multiplying by 1 = 100%." className="badge bg-warning py-1">?</span></label>
            <div className="input-group">
                <input id={props.id} list="priceVariables" type="text" className="form-control w-50" onChange={props.onChange} placeholder="0" value={priceTemplate.price || ''} />
                <span className="input-group-text bg-secondary">
                    X
                </span>
                <input id={props.id + "Multiplier"} type="number" step="any" className="form-control" onChange={props.onChange} placeholder="1" value={priceTemplate.multiplier || ''} />
                <datalist id="priceVariables">
                    <option>BOOK_ASK</option>
                    <option>BOOK_BID</option>
                    {
                        intervals.map(item => (
                            <React.Fragment key={item}>
                                <option>{"LAST_CANDLE_" + item + "_OPEN"}</option>
                                <option>{"LAST_CANDLE_" + item + "_HIGH"}</option>
                                <option>{"LAST_CANDLE_" + item + "_LOW"}</option>
                                <option>{"LAST_CANDLE_" + item + "_CLOSE"}</option>
                            </React.Fragment>
                        ))
                    }
                    <option>LAST_ORDER_AVG</option>
                    <option>LAST_ORDER_LIMIT</option>
                    <option>LAST_ORDER_STOP</option>
                </datalist>
            </div>
        </div>
    )
}

export default PriceTemplate;

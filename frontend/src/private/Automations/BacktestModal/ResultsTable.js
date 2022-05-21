import React, { useState, useEffect } from 'react';

/**
 * props:
 * - data
 */
function ResultsTable(props) {

    const [backtest, setBacktest] = useState({});

    useEffect(() => {
        if (!props.data) return;
        setBacktest(props.data);
    }, [props.data])

    function getCoin(coin) {
        return coin && typeof coin === 'number' ? coin.toFixed(3) : coin;
    }

    function getPerc(value) {
        if (!value) return <React.Fragment></React.Fragment>;

        let bg;
        if (value > 0) {
            value = "+" + value.toFixed(2) + "%";
            bg = "badge bg-success py-1 ms-1";
        }
        else if (value < 0) {
            value = value.toFixed(2) + "%";
            bg = "badge bg-danger py-1 ms-1";
        }
        else {
            value = "0%";
            bg = "badge bg-secondary py-1 ms-1";
        }

        return <span className={bg}>{value}</span>;
    }

    function getItem(order) {
        const date = new Date(order.transactTime);
        const frm = Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(date);
        return frm;
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <b>End Base: </b> {getCoin(backtest.endBase)} {getPerc(backtest.basePerc)}
                </div>
                <div className="col-md-6 mb-3">
                    <b>End Quote: </b> {getCoin(backtest.endQuote)} {getPerc(backtest.quotePerc)}
                </div>
            </div>
            <div className="row divBacktestResults">
                <div className="col-md-6 mb-3">
                    <ul className="list-group">
                        <li className="list-group-item list-group-item-warning">BUY ({backtest.buys})</li>
                        {
                            backtest.results && backtest.results.length && backtest.results.filter(r => r.side === 'BUY').map(order => (
                                <li key={"o" + order.transactTime} className="list-group-item">{getItem(order)}</li>
                            ))
                        }
                    </ul>
                </div>
                <div className="col-md-6 mb-3">
                    <ul className="list-group">
                        <li className="list-group-item list-group-item-success">SELL ({backtest.sells})</li>
                        {
                            backtest.results && backtest.results.length && backtest.results.filter(r => r.side === 'SELL').map(order => (
                                <li key={"o" + order.transactTime} className="list-group-item">{getItem(order)}</li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </React.Fragment>
    )
}

export default ResultsTable;
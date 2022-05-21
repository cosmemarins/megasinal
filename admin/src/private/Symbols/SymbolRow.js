import React, { useState, useEffect } from 'react';

/**
 * props.onclick
 * props.data:
 * - symbol
 * - basePrecision
 * - quotePrecision
 * - minNotional
 * - minLotSize
 * - isFavorite
 */
function SymbolRow(props) {

    const [symbol, setSymbol] = useState({});

    useEffect(() => {
        if (!props.data) return;
        setSymbol(props.data);
    }, [props.data.symbol])

    return (
        <tr>
            <td className="text-gray-900">
                {
                    symbol.base
                        ? <img src={`/img/icons/black/${symbol.base.toLowerCase()}.svg`} className="me-2" width={16} />
                        : <React.Fragment></React.Fragment>
                }
                {symbol.symbol}
            </td>
            <td className="text-gray-900">
                {symbol.basePrecision}
            </td>
            <td className="text-gray-900">
                {symbol.quotePrecision}
            </td>
            <td className="text-gray-900">
                {symbol.minNotional}
            </td>
            <td className="text-gray-900">
                {symbol.minLotSize}
            </td>
            <td>
                <button id={"view" + symbol.symbol} className="btn btn-sm btn-info animate-up-2 me-2" onClick={props.onClick} data-bs-toggle="modal" data-bs-target="#modalSymbol">
                    <svg className="icon icon-xs" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                </button>
            </td>
        </tr>
    );
}

export default SymbolRow;
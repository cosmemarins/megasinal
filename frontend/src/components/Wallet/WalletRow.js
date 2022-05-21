import React from 'react';

function WalletRow(props) {
    if (!parseFloat(props.available) && !parseFloat(props.onOrder)) return <React.Fragment></React.Fragment>;

    return (
        <tr>
            <td className="text-gray-900">
                <img className="me-2" width={16} src={`/img/icons/black/${props.symbol.toLowerCase()}.svg`} />
                {props.symbol}
            </td>
            <td className="text-gray-900">
                {`${parseFloat(props.available).toFixed(8)}`.substring(0, 10)}
            </td>
            <td className="text-gray-900">
                {`${parseFloat(props.onOrder).toFixed(8)}`.substring(0, 10)}
            </td>
        </tr>
    )
}

export default WalletRow;
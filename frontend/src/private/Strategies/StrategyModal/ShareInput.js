import React, { useState, useEffect } from 'react';

/**
 * props:
 * - sharedWith
 * - onChange
 */
function ShareInput(props) {

    const [index, setIndex] = useState(0);
    const [showSharedWith, setShowSharedWith] = useState(false);
    const [sharedWith, setSharedWith] = useState('none');

    useEffect(() => {

        if (props.sharedWith === 'none')
            setIndex(0);
        else if (props.sharedWith === 'everyone')
            setIndex(1)
        else
            setIndex(2);

        setSharedWith(props.sharedWith);
        setShowSharedWith(props.sharedWith !== 'everyone' && props.sharedWith !== 'none');

    }, [props.sharedWith])

    function getActiveClass(isActive) {
        return isActive ? "btn btn-primary" : "btn btn-gray-100";
    }

    function getVisibleClass(show) {
        return show ? 'col-12 mb-3' : 'd-none';
    }

    function onShareClick(event) {
        const id = event.target.id;
        let sharedWith;
        switch (id) {
            case 'btnDontShare': sharedWith = 'none'; break;
            case 'btnSharePublicly': sharedWith = 'everyone'; break;
            case 'btnShareWith': sharedWith = ''; break;
        }

        props.onChange({ target: { id: 'sharedWith', value: sharedWith } });
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-12 mb-3">
                    <div className="form-group">
                        <label htmlFor="shareWith">Share Strategy? </label>
                        <div className="btn-group" role="group">
                            <button id="btnDontShare" className={getActiveClass(index === 0)} onClick={onShareClick}>Don't Share</button>
                            <button id="btnSharePublicly" className={getActiveClass(index === 1)} onClick={onShareClick}>Share Publicly</button>
                            <button id="btnShareWith" className={getActiveClass(index === 2)} onClick={onShareClick}>Share With...</button>
                        </div>
                    </div>
                </div>
                <div className={getVisibleClass(showSharedWith)}>
                    <input type="text" id="sharedWith" className="form-control" onChange={props.onChange} value={sharedWith ? sharedWith : ''} placeholder="comma separated emails" />
                </div>
            </div>
        </React.Fragment>
    )
}

export default ShareInput;
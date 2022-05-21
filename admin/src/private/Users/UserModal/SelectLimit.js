import React, { useState, useEffect } from 'react';
import { getActiveLimits, getAllLimits } from '../../../services/LimitsService';

/**
 * props:
 * - id
 * - onChange
 */
function SelectLimit(props) {

    const [limits, setLimits] = useState(["LOADING"]);

    useEffect(() => {

        let promise;
        if (props.id > 0) {
            promise = getAllLimits();
        } else {
            promise = getActiveLimits();
        }

        promise.then(limitObjects => {
            setLimits(limitObjects);
        })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setLimits(['ERROR']);
            })
    }, [props.id])

    return (
        <select id="limitId" className="form-select" value={props.id} onChange={props.onChange}>
            <option value="">Select...</option>
            {
                limits && limits.length > 0
                    ? limits.map(limit => (<option key={"limit" + limit.id} value={limit.id}>{limit.name}</option>))
                    : <React.Fragment></React.Fragment>
            }
        </select>
    )
}

export default SelectLimit;

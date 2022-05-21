import React, { useState, useEffect } from 'react';
import { getAutomationsBySymbol } from '../../../services/AutomationsService';

/**
 * props:
 * - symbol
 * - id
 * - automationId
 * - onChange
 */
function SelectAutomation(props) {

    const [automations, setAutomations] = useState([]);

    useEffect(() => {
        if (!props.symbol) return setAutomations([]);

        getAutomationsBySymbol(props.symbol)
            .then(automations => setAutomations(automations))
            .catch(err => setAutomations([err.response ? err.response.data : err.message]));
    }, [props.symbol])

    function onAutomationChange(event) {
        if (props.onChange)
            props.onChange(event);
    }

    return (
        <select className="form-select" id={props.id} value={props.automationId} onChange={onAutomationChange}>
            <option value="0">Select...</option>
            {
                automations
                    ? automations.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))
                    : <option>NO AUTOMATIONS</option>
            }
        </select>
    )
}

export default SelectAutomation;
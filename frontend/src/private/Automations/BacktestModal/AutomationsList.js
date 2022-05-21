import React, { useState, useEffect } from 'react';

/**
 * props:
 * - automationIds
 * - data
 * - onChange
 */
function AutomationsList(props) {

    const [automations, setAutomations] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (!props.data) return;
        setAutomations(props.data);
    }, [props.data])

    useEffect(() => {
        setSelected(props.automationIds);
    }, [props.automationIds])

    function onAutomationsSelected(event) {
        if (event.target.checked) {
            selected.push(parseInt(event.target.value));
        } else {
            const index = selected.findIndex(id => id == event.target.value);
            selected.splice(index, 1);
        }
        setSelected(selected);
        props.onChange({ target: { value: selected, id: 'automationIds' } });
    }

    return (
        <div className="row">
            <div className="col-12 mb-3">
                <label>Automations:</label>
                <ul className="list-group divAutomationsList">
                    {
                        automations && automations.length
                            ? (
                                automations.map(a => (
                                    <li className="list-group-item" key={"a" + a.id}>
                                        <input className="form-check-input me-1" type="checkbox" value={a.id} onChange={onAutomationsSelected} checked={selected.includes(a.id)} />
                                        {a.name}
                                    </li>
                                ))
                            )
                            : <React.Fragment>{"No automations for this symbol."}</React.Fragment>
                    }
                </ul>
            </div>
        </div>
    )
}

export default AutomationsList;
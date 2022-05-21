import React, { useState, useEffect } from 'react';
import {getMonitorsBySymbol} from '../../../services/MonitorsService';

/**
 * props:
 * - symbol
 * - monitorId
 * - onChange
 */
function SelectMonitor(props) {

    const [monitors, setMonitors] = useState([]);

    useEffect(() => {
        if(!props.symbol) return setMonitors([]);

        getMonitorsBySymbol(props.symbol)
            .then(monitors => setMonitors(monitors))
            .catch(err => setMonitors([err.response ? err.response.data : err.message]));
    }, [props.symbol])

    function onMonitorChange(event) {
        if (props.onChange)
            props.onChange(event);
    }

    return (
        <select className="form-select" id="monitorId" value={props.monitorId} onChange={onMonitorChange}>
            <option value="0">Select...</option>
            {
                monitors
                    ? monitors.map(m => (<option key={m.id} value={m.id}>{m.type} {m.interval}</option>))
                    : <option>NO MONITORS</option>
            }
        </select>
    )
}

export default SelectMonitor;
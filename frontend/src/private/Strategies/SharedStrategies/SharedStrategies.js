import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getSharedStrategies } from '../../../services/StrategiesService';
import SharedStrategyRow from './SharedStrategyRow';
import SwitchInput from '../../../components/SwitchInput/SwitchInput';
import Pager from '../../../components/Pager/Pager';
import ViewStrategyModal from './ViewStrategyModal';

/**
 * props:
 * - symbol
 * - onNotification
 */
function SharedStrategies(props) {

    const history = useHistory();

    const [strategies, setStrategies] = useState([]);

    const [count, setCount] = useState(0);

    const [viewStrategy, setViewStrategy] = useState({});

    const [page, setPage] = useState(1);

    const [includePublic, setIncludePublic] = useState(true);

    useEffect(() => {
        getSharedStrategies(props.symbol, includePublic, page || 1)
            .then(result => {
                setStrategies(result.rows);
                setCount(result.count);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                props.onNotification({ type: 'error', text: err.response ? err.response.data : err.message });
            });
    }, [page, props.symbol, includePublic])

    function onViewClick(event) {
        const id = event.target.id.replace('view', '');
        setViewStrategy(strategies.find(s => s.id == id));
    }

    function onPublicChange(event) {
        setIncludePublic(event.target.value);
    }

    return (
        <React.Fragment>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="d-block mb-4 mb-md-0">
                    <h2 className="h4">Shared Strategies</h2>
                </div>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <div className="d-inline-flex align-items-center">
                        <SwitchInput id="includePublic" text="Include Public?" isChecked={includePublic} onChange={onPublicChange} />
                    </div>
                </div>
            </div>
            <div className="card card-body border-0 shadow table-wrapper table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th className="border-gray-200">Symbol</th>
                            <th className="border-gray-200">Name</th>
                            <th className="border-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            strategies && strategies.length
                                ? strategies.map(strategy => (<SharedStrategyRow key={strategy.id} data={strategy} onViewClick={onViewClick} />))
                                : <React.Fragment></React.Fragment>
                        }
                    </tbody>
                </table>
                <Pager count={count} page={page} size={10} onClick={setPage} />
            </div>
            <ViewStrategyModal data={viewStrategy} />
        </React.Fragment>
    )
}

export default SharedStrategies;
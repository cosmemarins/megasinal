import React, { useRef, useState, useEffect } from 'react';
import SelectSymbol from '../../../components/SelectSymbol/SelectSymbol';
import LogButton from '../../../components/Logs/LogButton';
import LogView from '../../../components/Logs/LogView';
import DateTime from '../AutomationModal/ScheduleArea/DateTime';
import AutomationsList from './AutomationsList';
import { getAllAutomations } from '../../../services/AutomationsService';
import { getSymbol } from '../../../services/SymbolsService';
import { getMemoryIndex } from '../../../services/BeholderService';
import { doBacktest } from '../../../services/AutomationsService';
import ResultsTable from './ResultsTable';
import ResultsButton from './ResultsButton';

function BacktestModal() {

    const DEFAULT_BACKTEST = {
        symbol: '',
        startBase: 0,
        startQuote: 0,
        startTime: 0,
        startDate: '',
        endDate: '',
        endTime: 0,
        automationIds: []
    }

    const [testing, setTesting] = useState(false);
    const [error, setError] = useState('');

    const [backtest, setBacktest] = useState(DEFAULT_BACKTEST);
    const [automations, setAutomations] = useState([]);

    const btnClose = useRef('');
    const btnTest = useRef('');

    function onSubmit(event) {
        if (testing) return;

        setError('');
        setTesting(true);
        doBacktest(backtest)
            .then(result => {
                result.automationIds = backtest.automationIds;
                setBacktest({ ...result, startTime: backtest.startTime, endTime: backtest.endTime });
                setTesting(false);
                setShowLogs(false);
                setShowResults(true);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err);
                setError(err.response ? err.response.data : err.message);
                setTesting(false);
            })
    }

    function onInputChange(event) {
        setBacktest(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    useEffect(() => {
        getAllAutomations()
            .then(results => {
                results = backtest.symbol
                    ? results.filter(a => !a.schedule && !a.name.startsWith('GRID ') && a.symbol === backtest.symbol)
                    : results.filter(a => !a.schedule && !a.name.startsWith('GRID '));

                setAutomations(results);
                setShowLogs(false);
                setShowResults(false);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err);
                setError(err.response ? err.response.data : err.message);
            })
    }, [backtest.symbol])

    const [showLogs, setShowLogs] = useState(false);
    function onLogClick(event) {
        if (!showLogs) setShowResults(false);
        setShowLogs(!showLogs);
    }

    const [showResults, setShowResults] = useState(false);
    function onViewResultsClick(event) {
        if (!showResults) setShowLogs(false);
        setShowResults(!showResults);
    }

    function onSymbolChange(event) {
        if (!event.target.value) return;

        const backtest = { ...DEFAULT_BACKTEST };
        backtest.symbol = event.target.value;

        let symbol;
        getSymbol(backtest.symbol)
            .then(symbolObj => {
                symbol = symbolObj;
                return getMemoryIndex(symbol.base, 'WALLET', null);
            })
            .then(base => {
                backtest.startBase = base;
                return getMemoryIndex(symbol.quote, 'WALLET', null);
            })
            .then(quote => {
                backtest.startQuote = quote;
                setBacktest({ ...backtest });
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err);
                setError(err.response ? err.response.data : err.message);
            })
    }

    useEffect(() => {
        const modal = document.getElementById('modalBacktest');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setBacktest({ ...DEFAULT_BACKTEST });
            setShowLogs(false);
        })
    }, [])

    return (
        <div className="modal fade" id="modalBacktest" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">Backtest</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="symbol">Symbol:</label>
                                        <SelectSymbol symbol={backtest.symbol} onChange={onSymbolChange} onlyFavorites={true} />
                                    </div>
                                </div>
                            </div>
                            {
                                !showLogs && !showResults
                                    ? (
                                        <React.Fragment>
                                            <AutomationsList automationIds={backtest.automationIds} data={automations} onChange={onInputChange} />
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="startBase">Start Base:</label>
                                                        <input type="number" id="startBase" className="form-control" placeholder="0" value={backtest.startBase || ''} onChange={onInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="startQuote">Start Quote:</label>
                                                        <input type="number" id="startQuote" className="form-control" placeholder="0" value={backtest.startQuote || ''} onChange={onInputChange} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="startTime">Start Date:</label>
                                                        <DateTime id="startTime" onChange={onInputChange} date={backtest.startDate || ''} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="endTime">End Date:</label>
                                                        <DateTime id="endTime" onChange={onInputChange} date={backtest.endDate || ''} />
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    )
                                    : <React.Fragment></React.Fragment>
                            }
                            {
                                !showLogs && showResults
                                    ? <ResultsTable data={backtest} />
                                    : <React.Fragment></React.Fragment>
                            }
                            {
                                showLogs && !showResults
                                    ? <LogView file={"backtest-" + backtest.userId} />
                                    : (
                                        <React.Fragment>
                                        </React.Fragment>
                                    )
                            }
                        </div>
                    </div>
                    <div className="modal-footer">
                        {
                            error
                                ? <div className="alert alert-danger mt-1 col-9 py-1">{error}</div>
                                : <React.Fragment></React.Fragment>
                        }
                        <LogButton id={backtest.id} onClick={onLogClick} />
                        <ResultsButton id={backtest.id} onClick={onViewResultsClick} />
                        <button ref={btnTest} type="button" className="btn btn-sm btn-primary" onClick={onSubmit} disabled={backtest.automationIds.length ? false : true}>
                            {
                                testing
                                    ? "Testing..."
                                    : "Start Test"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BacktestModal;

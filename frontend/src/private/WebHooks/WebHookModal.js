import React, { useRef, useState, useEffect } from 'react';
import SelectSymbol from '../../components/SelectSymbol/SelectSymbol';
import { saveWebHook } from '../../services/WebHooksService';

/**
 * props:
 * - data
 * - onSubmit
 */
function WebHookModal(props) {

    const DEFAULT_WEBHOOK = {
        symbol: '',
        key: '',
        id: 0,
        userId: 0,
        name: '',
        host: '*'
    }

    const [error, setError] = useState('');

    const [webHook, setWebHook] = useState(DEFAULT_WEBHOOK);

    const btnClose = useRef('');
    const btnSave = useRef('');

    function onSubmit(event) {
        saveWebHook(webHook.id, webHook)
            .then(result => {
                btnClose.current.click();
                if (props.onSubmit) props.onSubmit(result);
            })
            .catch(err => {
                console.error(err.response ? err.response.data : err.message);
                setError(err.response ? err.response.data : err.message);
            })
    }

    function onInputChange(event) {
        setWebHook(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    useEffect(() => {
        if (!props.data || !props.data.id) return;
        setWebHook(props.data);
    }, [props.data])

    function getWebHookUrl() {
        if (!webHook.key) return `It will be generated after save. Come back later.`;
        return `${process.env.REACT_APP_API_URL}/wh/${webHook.userId}/${webHook.key}`;
    }

    useEffect(() => {
        const modal = document.getElementById('modalWebHook');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setWebHook({ ...DEFAULT_WEBHOOK });
        })
    }, [])

    return (
        <div className="modal fade" id="modalWebHook" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">{props.data.id ? 'Edit ' : 'New '}WebHook</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-7 mb-3">
                                <div className="form-group">
                                    <label htmlFor="symbol">Symbol:</label>
                                    <SelectSymbol onChange={onInputChange} symbol={webHook.symbol} onlyFavorites={false} disabled={!!webHook.key} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <div className="form-group">
                                    <label htmlFor="name">Name:</label>
                                    <input type="text" id="name" className="form-control" onChange={onInputChange} value={webHook.name || ''} placeholder="WebHook's name" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <div className="form-group">
                                    <label htmlFor="host">Authorized Host:</label>
                                    <input type="text" id="host" className="form-control" onChange={onInputChange} value={webHook.host || ''} placeholder="*" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <div className="form-group">
                                    <label htmlFor="url">Post URL:</label>
                                    <input type="text" id="url" disabled={true} className="form-control" onChange={onInputChange} value={getWebHookUrl()} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {
                            error
                                ? <div className="alert alert-danger mt-1 col-9 py-1">{error}</div>
                                : <React.Fragment></React.Fragment>
                        }
                        <button ref={btnSave} type="button" className="btn btn-sm btn-primary" onClick={onSubmit}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WebHookModal;

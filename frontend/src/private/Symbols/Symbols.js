import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { searchSymbols } from '../../services/SymbolsService';
import SymbolModal from './SymbolModal';
import SymbolRow from './SymbolRow';
import Pagination from '../../components/Pagination/Pagination';
import SelectQuote, { getDefaultQuote, setDefaultQuote } from '../../components/SelectQuote/SelectQuote';
import Menu from '../../components/Menu/Menu';
import Footer from '../../components/Footer/Footer';
import Toast from '../../components/Toast/Toast';

function Symbols() {

    const history = useHistory();

    const defaultLocation = useLocation();

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page') || '1';
    }

    useEffect(() => {
        return history.listen((location) => {
            setPage(getPage(location));
        })
    }, [history])

    const [symbols, setSymbols] = useState([]);

    const [quote, setQuote] = useState(getDefaultQuote());

    const [count, setCount] = useState(0);

    const [page, setPage] = useState(getPage());

    const [notification, setNotification] = useState({});

    const [viewSymbol, setViewSymbol] = useState({
        symbol: '',
        basePrecision: '',
        quotePrecision: '',
        minNotional: '',
        minLotSize: ''
    });

    function onQuoteChange(event) {
        setQuote(event.target.value);
        setDefaultQuote(event.target.value);
    }

    function errorHandling(err) {
        console.error(err.response ? err.response.data : err.message);
        setNotification({ type: 'error', text: err.response ? err.response.data : err.message });
    }

    function loadSymbols(selectedValue) {
        const search = selectedValue === 'FAVORITES' ? '' : selectedValue;
        const onlyFavorites = selectedValue === 'FAVORITES';
        searchSymbols(search, onlyFavorites, getPage())
            .then(result => {
                setSymbols(result.rows);
                setCount(result.count);
            })
            .catch(err => errorHandling(err))
    }

    useEffect(() => {
        loadSymbols(quote);
    }, [quote, page])

    function onViewClick(event) {
        const coinpair = event.target.id.replace("view", "");
        const symbol = symbols.find(s => s.symbol === coinpair);
        setViewSymbol({...symbol});
    }

    return (
        <React.Fragment>
            <Menu />
            <main className="content">
                <div className="row py-4">
                    <div className="col-10">
                        <h2 className="h4">Symbols</h2>
                    </div>
                    <div className="col-2">
                        <SelectQuote onChange={onQuoteChange} />
                    </div>
                </div>
                <div className="card card-body border-0 shadow table-wrapper table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th className="border-gray-200">Symbol</th>
                                <th className="border-gray-200">Base Prec</th>
                                <th className="border-gray-200">Quote Prec</th>
                                <th className="border-gray-200">Min Notional</th>
                                <th className="border-gray-200">Min Lot Size</th>
                                <th className="border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                symbols && symbols.length
                                    ?
                                    symbols.map(item => <SymbolRow key={item.symbol} data={item} onClick={onViewClick} />)
                                    : <React.Fragment></React.Fragment>
                            }
                        </tbody>
                    </table>
                    <Pagination count={count} size={20} max={15} />
                </div>
                <Footer />
            </main>
            <Toast text={notification.text} type={notification.type} />
            <SymbolModal data={viewSymbol} />
        </React.Fragment>
    );
}

export default Symbols;

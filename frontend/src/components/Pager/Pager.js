import React, { useState, useEffect } from 'react';

/**
 * props:
 * - count
 * - page
 * - size
 * - onClick
 */
function Pager(props) {

    const PAGE_SIZE = props.size || 10;

    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(props.page || 1);
    }, [props.page])

    const pagesQty = Math.ceil(props.count / PAGE_SIZE);

    function getBottom() {
        if (props.count > 0)
            return (<div className="fw-normal small mt-4 mt-lg-0"><b>{props.count}</b> results.</div>);
        else
            return (<div className="fw-normal small mt-4 mt-lg-0"><b>No results found.</b></div>);
    }

    function onPaginatingUp() {
        props.onClick(page + 1);
    }

    function onPaginatingDown() {
        props.onClick(page - 1);
    }

    return (
        <div className="card-footer px-3 border-0 d-flex flex-column flex-lg-row align-items-center justify-content-between">
            <nav>
                {
                    pagesQty === 0 || page === 1
                        ? <React.Fragment></React.Fragment>
                        : (
                            <button id="btnPreviousPage" className='btn btn-outline-primary' onClick={onPaginatingDown}>
                                <svg className="icon icon-sm" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </button>
                        )
                }
                {
                    pagesQty === 0 || page === pagesQty
                        ? <React.Fragment></React.Fragment>
                        : (
                            <button id="btnNextPage" className='btn btn-outline-primary ms-2' onClick={onPaginatingUp}>
                                <svg className="icon icon-sm" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </button>
                        )
                }
            </nav>
            {getBottom()}
        </div>
    )
}

export default Pager;
import React from 'react';

function Footer() {
    return (
        <React.Fragment>
            <footer className="bg-white rounded shadow p-5 mb-4 mt-4">
                <div className="row">
                    <div className="col-12 col-md-4 col-xl-6 mb-4 mb-md-0">
                        <p className="mb-0 text-center text-lg-start">© 2021-<span className="current-year">2022</span> <a
                            className="text-primary fw-normal" href="https://www.megasinal.com">MegaSinal</a></p>
                    </div>
                    <div className="col-12 col-md-8 col-xl-6 text-center text-lg-start">

                        <ul className="list-inline list-group-flush list-group-borderless text-md-end mb-0">
                            <li className="list-inline-item px-0 px-sm-2">
                                <a href="https://www.megasinal.com/">About</a>
                            </li>
                            <li className="list-inline-item px-0 px-sm-2">
                                <a href="https://www.megasinal.com/">Contact</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        </React.Fragment>
    );
}

export default Footer;

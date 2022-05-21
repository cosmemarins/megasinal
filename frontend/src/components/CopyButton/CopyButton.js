import React, { useState } from 'react';

/**
 * props:
 * - text
 */
function CopyButton(props) {

    const [pressed, setPressed] = useState(false);

    function copy() {
        setPressed(true);
        
        navigator.clipboard.writeText(props.text);

        setTimeout(() => {
            setPressed(false);
        }, 3000)
    }

    return (
        <button type="button" className="btn btn-primary btn-xs ms-2" title="Copy to the clipboard" onClick={copy}>
            {
                pressed
                    ? <svg className="icon icon-xs" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    : <svg className="icon icon-xs" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
            }
        </button>
    )
}

export default CopyButton;
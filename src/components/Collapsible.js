import React, { useState } from 'react';
import '../styles/App.css';

const Collapsible = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="collapsible">
            <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
                <span className={`arrow ${isOpen ? 'open' : ''}`}>&gt;</span>
                <span className="collapsible-title">{title}</span>
            </div>
            {isOpen && <div className="collapsible-content">{children}</div>}
        </div>
    );
};

export default Collapsible;
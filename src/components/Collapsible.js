import React, { useState } from 'react'; // Imports React and the useState hook from React library.
import '../styles/App.css'; // Imports stylesheet for styling.

// Defines the Collapsible functional component with props `title` for the collapsible header and `children` for the collapsible content.
const Collapsible = ({ title, children }) => {
    // Initializes a state variable `isOpen` with a default value of false indicating that the collapsible content is initially hidden.
    const [isOpen, setIsOpen] = useState(false);

    // Renders the Collapsible component.
    return (
        // `collapsible` class is used for the outermost div for styling purposes.
        <div className="collapsible">
            {/* The collapsible header section. Clicking this section toggles the visibility of the collapsible content. */}
            <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
                {/* A span element for the arrow symbol. The `arrow` class applies basic styling, and the `open` class is conditionally applied based on the `isOpen` state. */}
                <span className={`arrow ${isOpen ? 'open' : ''}`}>&gt;</span>
                {/* Displays the title of the collapsible. */}
                <span className="collapsible-title">{title}</span>
            </div>
            {/* Conditionally renders the children elements within the collapsible content area based on the `isOpen` state. */}
            {isOpen && <div className="collapsible-content">{children}</div>}
        </div>
    );
};

export default Collapsible; // Exports the Collapsible component for use in other parts of the application.

import React from 'react';
import logoPlaceholder from "../../loader.svg";
import './Loader.css';
const Loader = () => {
    return (
        <div className="loader d-flex flex-column justify-content-center align-items-center">
            <img className="mb-4" id="mySVG" width="50" height="50" src={logoPlaceholder} alt="Loading" />
        </div>
    )
}

export default Loader;
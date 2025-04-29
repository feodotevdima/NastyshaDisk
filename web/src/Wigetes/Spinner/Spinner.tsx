import React, { useState } from 'react';
import './Spinner.css'; 

const Spinner = () => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );
}

export default Spinner;
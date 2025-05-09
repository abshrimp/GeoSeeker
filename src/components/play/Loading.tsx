import React from 'react';
import compassIcon from '../../assets/images/compass.svg';
import './Loading.css';

const Loading: React.FC = () => {
    return (
        <div id="loading" className="loading">
            <img className="loadingIcon" src={compassIcon} alt="Loading" />
            <div>Loading...</div>
        </div>
    );
};

export default Loading; 
import React from 'react';

interface RotatingCompassProps {
    degree: number;
    size?: number;
}

const RotatingCompass: React.FC<RotatingCompassProps> = ({ degree, size = 50 }) => {
    const center = 25;
    return (
        <svg
            className="rotating-compass"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width={size}
            height={size}
            style={{ display: 'block' }}
        >
            <circle cx={center} cy={center} r={13} fill="#444444" fillOpacity="0.7" />
            <circle cx={center} cy={center} r={18} stroke="#222222" strokeWidth={13} fill="transparent" />
            <g style={{ transform: `rotate(-${degree}deg)`, transformOrigin: `${center}px ${center}px` }}>
                <polygon points="25,8 20,25 30,25" fill="red" />
                <polygon points="25,42 20,25 30,25" fill="white" />
            </g>
        </svg>
    );
};

export default RotatingCompass; 
import React, { useState, useEffect } from 'react';
import './Compass.css';

interface CompassProps {
    degree: number;
}

interface CompassItem {
    direction: string;
    latitudeLines: JSX.Element[];
    labelClass: string;
}

const Compass: React.FC<CompassProps> = ({ degree }) => {
    const [compassItems, setCompassItems] = useState<CompassItem[]>([]);

    // コンパスの初期アイテムを設定
    useEffect(() => {
        const directions = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
        const newCompassItems = directions.map((direction) => {
            const latitudeLines: JSX.Element[] = [];
            let rem = 0.328125;

            for (let i = 0; i < 6; i++) {
                if (i === 3) rem += 1.5;
                latitudeLines.push(
                    <span key={i} style={{ left: `${rem}rem` }} className="latitude-lines" />
                );
                rem += 0.65625;
            }

            return {
                direction,
                latitudeLines,
                labelClass: direction === 'N' ? 'north latitude-label' : 'latitude-label',
            };
        });

        setCompassItems(newCompassItems);
    }, []);

    // 動的スタイルを計算する関数
    const getItemStyles = (index: number) => {
        const rot = -(((degree + 22.5 + 180) % 360 - 180) * 43.5 / 360);
        let transRem = rot;
        if (rot > 10 && index > 5) transRem -= 43.5; // E, SE の調整
        if (rot < -10 && index < 2) transRem += 43.5; // S, SW の調整

        const isScaled =
            Math.abs(((degree + 22.5 + 180) % 45) - 22.5) < 5 &&
            index === (Math.round(degree / 45) + 4) % 8;

        return {
            containerStyle: {
                width: '5.4375rem',
                transform: `translate(${transRem}rem)`,
            },
            labelStyle: isScaled ? { transform: 'scale(1.4)' } : {},
        };
    };

    return (
        <div className="compass-container">
            <div className="compass">
                <div id="compassContainer" className="compass-inner">
                    {compassItems.map((item, index) => {
                        const { containerStyle, labelStyle } = getItemStyles(index);
                        return (
                            <div
                                key={item.direction}
                                className="latitude-item"
                                style={containerStyle}
                            >
                                {item.latitudeLines}
                                <span className={item.labelClass} style={labelStyle}>
                                    {item.direction}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="compass-top-indicator"></div>
                <div className="compass-bottom-indicator"></div>
            </div>
        </div>
    );
};

export default Compass; 
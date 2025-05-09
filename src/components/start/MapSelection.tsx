import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import Dropdown from '../ui/Dropdown';
import { Globe, MapPin, Award } from 'lucide-react';
import citiesData from '../../data/cities.json';
import './MapSelection.css';

type DropdownOption = {
    label: string;
    value: string;
};

type CitiesData = {
    [prefecture: string]: {
        [city: string]: {
            [ward: string]: number;
        } | number;
    } | number;
} & { [key: string]: any };

const cities = citiesData as CitiesData;

interface MapSelectionProps {
    stats: { plays: number, average: number };
}

const MapSelection: React.FC<MapSelectionProps> = ({ stats }) => {
    const { gameState, setGameState } = useGame();

    const [selectedPrefecture, setSelectedPrefecture] = useState(() => {
        const saved = localStorage.getItem('selectedPrefecture');
        return saved || '';
    });
    const [selectedCity, setSelectedCity] = useState(() => {
        const saved = localStorage.getItem('selectedCity');
        return saved || '';
    });
    const [selectedDistrict, setSelectedDistrict] = useState(() => {
        const saved = localStorage.getItem('selectedDistrict');
        return saved || '';
    });

    // 都道府県の初期化
    useEffect(() => {
        if (!selectedPrefecture) {
            const defaultPref = Object.keys(cities)[0];
            setSelectedPrefecture(defaultPref);
            localStorage.setItem('selectedPrefecture', defaultPref);
        }
    }, []);

    // 都道府県が変更されたときの処理
    useEffect(() => {
        const pref = cities[selectedPrefecture];
        if (typeof pref === 'object') {
            const cityList = Object.keys(pref);
            const savedCity = localStorage.getItem('selectedCity');
            const validCity = savedCity && cityList.includes(savedCity) ? savedCity : cityList[0] || '';
            setSelectedCity(validCity);
        } else if (typeof pref === 'number') {
            setSelectedCity('');
            setGameState({
                map_id: pref,
                map_name: selectedPrefecture,
            });
        }
        setSelectedDistrict('');
    }, [selectedPrefecture]);

    // 市区町村の変更を監視
    useEffect(() => {
        localStorage.setItem('selectedCity', selectedCity);
        
        const city = cities[selectedPrefecture]?.[selectedCity];
        if (typeof city === 'object') {
            const wardList = Object.keys(city);
            const savedDistrict = localStorage.getItem('selectedDistrict');
            const validDistrict = savedDistrict && wardList.includes(savedDistrict) ? savedDistrict : wardList[0] || '';
            setSelectedDistrict(validDistrict);
        } else if (typeof city === 'number') {
            setSelectedDistrict('');
            setGameState({
                map_id: city,
                map_name: selectedPrefecture + " " + selectedCity,
            });
        }
    }, [selectedCity, selectedPrefecture]);

    // 区の変更を監視
    useEffect(() => {
        localStorage.setItem('selectedDistrict', selectedDistrict);
        
        const city = cities[selectedPrefecture]?.[selectedCity];
        if (typeof city === 'object' && selectedDistrict) {
            const map_name = selectedDistrict[selectedDistrict.length - 1] == "区" ?
                (selectedCity == "東京23区" ? selectedPrefecture + " " + selectedDistrict : selectedCity + " " + selectedDistrict)
                : selectedDistrict == "全域" ? selectedPrefecture + " " + selectedCity
                    : selectedPrefecture + " " + selectedDistrict;
            setGameState({
                map_id: city[selectedDistrict],
                map_name: map_name,
            });
        }
    }, [selectedDistrict, selectedCity, selectedPrefecture]);

    const prefectureOptions = Object.keys(cities).map(key => ({ label: key, value: key }));

    const getCityOptions = (): DropdownOption[] => {
        const pref = cities[selectedPrefecture];
        return typeof pref === 'object' ? Object.keys(pref).map(key => ({ label: key, value: key })) : [];
    };

    const getDistrictOptions = (): DropdownOption[] => {
        const city = cities[selectedPrefecture]?.[selectedCity];
        return typeof city === 'object' ? Object.keys(city).map(key => ({ label: key, value: key })) : [];
    };

    const handlePrefectureChange = (value: string) => {
        setSelectedPrefecture(value);
        localStorage.setItem('selectedPrefecture', value);
    };

    const handleCityChange = (value: string) => {
        setSelectedCity(value);
    };

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value);
    };

    return (
        <div className="map-selection">
            <div className="map-selection-header">
                <Globe className="globe-icon" />
                <h2>Select Map</h2>
            </div>

            <div className="dropdown-container">
                <div className="dropdown-item">
                    <Dropdown
                        options={prefectureOptions}
                        value={selectedPrefecture}
                        onChange={handlePrefectureChange}
                        placeholder="-"
                        fullWidth
                        disabled={prefectureOptions.length === 0}
                        className="select-text"
                    />
                </div>

                <div className="dropdown-item">
                    <Dropdown
                        options={getCityOptions()}
                        value={selectedCity}
                        onChange={handleCityChange}
                        placeholder="-"
                        fullWidth
                        disabled={!selectedPrefecture || getCityOptions().length === 0}
                        className="select-text"
                    />
                </div>

                <div className="dropdown-item">
                    <Dropdown
                        options={getDistrictOptions()}
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        placeholder="-"
                        fullWidth
                        disabled={!selectedCity || getDistrictOptions().length === 0}
                        className="select-text"
                    />
                </div>
            </div>

            {gameState.map_name && (
                <div className="map-info">
                    <p className="map-description">{gameState.map_name}</p>

                    <div className="map-stats">
                        <div className="stat-item">
                            <MapPin className="map-pin-icon" />
                            <span>{stats.plays.toLocaleString()} plays</span>
                        </div>

                        <div className="stat-item">
                            <Award className="award-icon" />
                            <span>Avg. Score: {stats.plays > 0 ? Math.round(stats.average).toLocaleString() : '-'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapSelection;

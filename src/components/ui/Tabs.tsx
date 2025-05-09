import React, { useState } from 'react';
import './Tabs.css';

interface Tab {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="tabs-root">
            <nav className="tabs-nav">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`tabs-btn${isActive ? ' tabs-btn-active' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Tabs;
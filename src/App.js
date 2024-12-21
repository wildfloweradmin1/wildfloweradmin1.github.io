import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Events from './components/Events';
import Artists from './components/Artists';
import About from './components/About';
import ThemeSwitcher from './components/ThemeSwitcher';
import { themes } from './themes';

function App() {
    const [activePage, setActivePage] = useState('events');
    const [currentTheme, setCurrentTheme] = useState('midnight');

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', themes[currentTheme].primary);
        document.documentElement.style.setProperty('--secondary-color', themes[currentTheme].secondary);
        document.documentElement.style.setProperty('--text-color', themes[currentTheme].text);
        document.documentElement.style.setProperty('--accent-color', themes[currentTheme].accent);
    }, [currentTheme]);

    const renderContent = () => {
        switch (activePage) {
            case 'artists':
                return <Artists />;
            case 'about':
                return <About />;
            default:
                return <Events />;
        }
    };

    return (
        <div className="App" style={{
            backgroundColor: themes[currentTheme].primary,
            color: themes[currentTheme].text
        }}>
            <ThemeSwitcher currentTheme={currentTheme} setTheme={setCurrentTheme} />
            <Header setActivePage={setActivePage} theme={themes[currentTheme]} />
            <main className="content" style={{
                backgroundColor: themes[currentTheme].primary,
                color: themes[currentTheme].text
            }}>
                {renderContent()}
            </main>
        </div>
    );
}

export default App;

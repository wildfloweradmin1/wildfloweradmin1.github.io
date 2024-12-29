import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Events from './components/Events';
import Artists from './components/Artists';
import About from './components/About';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { themes } from './themes';

function App() {
    const [currentTheme, setCurrentTheme] = useState('midnight');
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', themes[currentTheme].primary);
        document.documentElement.style.setProperty('--secondary-color', themes[currentTheme].secondary);
        document.documentElement.style.setProperty('--text-color', themes[currentTheme].text);
        document.documentElement.style.setProperty('--accent-color', themes[currentTheme].accent);
    }, [currentTheme]);

    return (
        <Router basename="/j7qf5y/wf">
            <div className="App" style={{
                backgroundColor: themes[currentTheme].primary,
                color: themes[currentTheme].text
            }}>
                <Header theme={themes[currentTheme]} />
                <main className="content" style={{
                    backgroundColor: themes[currentTheme].primary,
                    color: themes[currentTheme].text
                }}>
                    <Routes>
                        <Route path="/" element={<Events />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/artists" element={<Artists />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/admin" element={
                            isLoggedIn ? (
                                <AdminDashboard 
                                    onLogout={() => {
                                        setIsLoggedIn(false);
                                        localStorage.removeItem('isLoggedIn');
                                    }}
                                    currentTheme={currentTheme}
                                    setTheme={setCurrentTheme}
                                />
                            ) : (
                                <Login onLogin={setIsLoggedIn} />
                            )
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

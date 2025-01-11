import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Events from './components/features/events/Events';
import Artists from './components/features/artists/Artists';
import About from './components/features/about/About';
import Login from './components/Login';
import AdminDashboard from './components/features/admin/AdminDashboard';
import config from './config/env';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

    return (
        <Router basename={config.routerBase}>
            <Layout>
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
                            />
                        ) : (
                            <Login onLogin={setIsLoggedIn} />
                        )
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;

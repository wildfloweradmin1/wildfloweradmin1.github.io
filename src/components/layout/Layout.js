import React from 'react';
import Header from './Header/Header';
import './Layout.css';

function Layout({ children }) {
    return (
        <div className="layout">
            <Header />
            <main className="content">
                {children}
            </main>
        </div>
    );
}

export default Layout; 
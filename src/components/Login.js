import React, { useState } from 'react';

function Login({ onLogin }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd want to validate against a backend
        // This is just a simple example
        if (credentials.username === 'admin' && credentials.password === 'password123') {
            onLogin(true);
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Admin Login</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login; 
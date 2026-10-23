import {useState} from 'react';
import { Link } from 'react-router-dom'

export function Login() {
    const [email, setEmail] = useState('');
    const[password,setPassword] = useState('');

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <Link className="auth-brand" to="/home" aria-label="Etry home">etry<span>.</span></Link>
                <div className="auth-message">
                    <p className="auth-eyebrow">A better way to shop</p>
                    <h1>Yours are closer than you think.</h1>
                    <p>Discover pieces you'wish.</p>
                </div>
                <p className="auth-panel-note">Thoughtful finds. Easy everyday shopping.</p>
            </section>

            <section className="auth-content">
                <div className="auth-card">
                    <p className="auth-eyebrow auth-card-eyebrow">Welcome back</p>
                    <h2>Sign in to Etry</h2>
                    <p className="auth-subtitle">Enter your details to access your account.</p>

                    <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder="y@gmail.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <div className="auth-label-row">
                                <label htmlFor="password">Password</label>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>
                        <button className="auth-submit" type="submit">Sign in</button>
                    </form>

                    <p className="auth-switch">
                        New to Etry? <Link to="/signup">Create an account</Link>
                    </p>
                </div>
                <p className="auth-footer">© 2026 Etry. Shop with Etry.</p>
            </section>
        </main>
    )
}
export default Login;
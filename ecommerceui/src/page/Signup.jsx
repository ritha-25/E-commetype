import {useState} from 'react';
import { Link ,useNavigate} from 'react-router-dom'
import axios from 'axios';

function Signup() {
    const navigate = useNavigate();
    const[name,setName]=useState('');
    const[email,setEmail]= useState('');
    const[password,setPassword]=useState('');
    const[confirmPassword,setConfirmPassword]=useState('');
    const [isSubmitting,setIsSubmitting]=useState(false);
    const handling=async (event)=>{
        event.preventDefault();
    
    if(confirmPassword!==password){
        alert("passwords do not match");
        return;
    }
        setIsSubmitting(true);
        try {
        const payload = {name,email,password,confirmPassword};
        await axios.post('http://localhost:3000/api/auth/register',payload);
        alert("signup successful");
        navigate('/login');
        }
        catch{
            alert("error signing up");
        }
         finally {
            setIsSubmitting(false); 
        }
    };
    
    return (
        <main className="auth-page">
            <section className="auth-panel">
                <Link className="auth-brand" to="/home" aria-label="Etry home">etry<span>.</span></Link>
                <div className="auth-message">
                    <p className="auth-eyebrow">Find your next favorite</p>
                    <h1>A little more you in every day.</h1>
                    <p>Create an account to explore thoughtful finds from sellers you can trust.</p>
                </div>
                <p className="auth-panel-note">Thoughtful finds. Easy everyday shopping.</p>
            </section>

            <section className="auth-content">
                <div className="auth-card">
                    <p className="auth-eyebrow auth-card-eyebrow">Join the community</p>
                    <h2>Create your account</h2>
                    <p className="auth-subtitle">Sign up to discover and shop your favorites.</p>

                    <form className="auth-form" onSubmit={handling}>
                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                autoComplete="name"
                                placeholder="Your name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder="Enter your password again"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                            />
                        </div>
                        <button className="auth-submit" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
                <p className="auth-footer">© 2026 Etry. Shop with confidence.</p>
            </section>
        </main>
    );
}   

export default Signup;
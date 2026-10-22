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
        const response = await axios.post('http://localhost:3000/api/auth/register',payload); 
        alert("signup successful");
        navigate('/login');
        }
        catch(error){
            alert("error signing up");
        }
         finally {
            setIsSubmitting(false); 
        }
    };
    
    return (
        <div className="signup-container">
            <h2>Signup</h2>
            <form onSubmit={handling}>
                <label htmlFor="name">Name</label >
                
                <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)
                  
                }   style={{width:'20%',padding:'5px'}}/>
                <br></br>
                 <label htmlFor="email">Email</label> 
                 <input type="email" id="email" value={email} onChange={(event)=>setEmail(event.target.value)} style={{width:'20%',padding:'5px'}}/>
                 <br></br>
                  <label htmlFor="password">Password</label> 
                   <input type="password" id="password" value={password} onChange={(event)=>setPassword(event.target.value)} style={{width:'20%',padding:'5px'}}/>
                   <br></br>
                    <label htmlFor="confirmPassword">Confirm Password</label> 
                     <input type="password" id="confirmPassword" value={confirmPassword} onChange={(event)=>setConfirmPassword(event.target.value)} style={{width:'20%',padding:'5px'}}/>
                     <br></br>  
                     <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing up...' : 'Signup'}
                     </button>
            </form>
 </div>
    );
}   

export default Signup;
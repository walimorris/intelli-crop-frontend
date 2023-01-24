import React, {useEffect} from 'react';
import {Auth} from "aws-amplify";

const LogoutCTA = (signOut) => {

    const handleLogout = async () => {
        try {
            await Auth.signOut({global: true});
        } catch (error) {
            console.log(`error signing out: ${error}`);
        }
    };

    useEffect(() => {
        document.getElementById('logout-button').addEventListener('click', handleLogout);
        return () => {
            document.getElementById('logout-button').removeEventListener('click', handleLogout);
        }
    }, []);

    return (
        <div id={'logout-cta'}>
            <h1 id={'welcome-text'}>Welcome to Intelli-Crop</h1>
            <button id={'logout-button'} onClick={handleLogout}>Logout</button>
        </div>
    )
};

export default LogoutCTA;

import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import caller_auth from '../_services/caller_auth';

const AuthGuard = ( {children} ) => {
    const [response, setResponse] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async() => {
            const data = {
                jeton: localStorage.getItem('token'),
            };

            try {
              
                const res = await fetch(`${caller_auth.API_URL}/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
    
                const jsonRes = await res.json();
                setResponse(jsonRes);
    
                if (jsonRes.statut === 'Succès') {
                    
                } else {
                    localStorage.removeItem('token');
                    toast.error('Votre session a expiré, veuillez vous reconnecter.');
                    navigate('/login');
                }
            } catch (error) {
                localStorage.removeItem('token');
                toast.error('Votre session a expiré, veuillez vous reconnecter.');
                navigate('/login');
            }
        }

        checkAuthentication();

    }, [useNavigate])

    return children;
};

export default AuthGuard;
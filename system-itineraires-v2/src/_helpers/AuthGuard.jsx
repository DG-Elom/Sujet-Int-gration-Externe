import React from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import caller_auth from '../_services/caller_auth';

const AuthGuard = ( {children} ) => {
    const navigate = useNavigate();
    const toastDisplayed = useRef(false);

    useEffect(() => {
        const checkAuthentication = async() => {
            const data = {
                // Je récupère le token présent dans le local storage de l'utilisateur
                jeton: localStorage.getItem('token'),
            };

            try {
                console.log(`${caller_auth.API_URL}/verify`);
                const res = await fetch(`${caller_auth.API_URL}/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                console.log('Réponse JSON:');
                const jsonRes = await res.json();
                console.log('Réponse JSON:', jsonRes);
                if (jsonRes.statut === 'Succès') {

                } else {
                    localStorage.removeItem('token');
                    toast.error('Votre session a expiré, veuillez vous reconnecter.');
                    navigate('/login');
                    toastDisplayed.current = true;
                }
            } catch (error) {
                localStorage.removeItem('token');
                toast.error('Votre session a expiré, veuillez vous reconnecter.');
                navigate('/login');
                toastDisplayed.current = true;
            }
        }

        checkAuthentication();

    }, [useNavigate, toastDisplayed])

    return children;
};

export default AuthGuard;
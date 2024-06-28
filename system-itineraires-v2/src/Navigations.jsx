import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './frontend/Dashboard';
import Inscription from './frontend/Inscription';
import Connexion from './frontend/Connexion';
import Maps from './frontend/Maps';
import Stations from './frontend/Stations';
import Historique from './frontend/Historique';
import AuthGuard from './_helpers/AuthGuard';
import Profil from './frontend/Profil';

export default function Navigations(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Inscription />} />
                <Route path="/login" element={<Connexion />} />
                <Route path='/*' element={
                    <AuthGuard>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/profil" element={<Profil />} />
                            <Route path="/maps" element={<Maps />} />
                            <Route path="/stations" element={<Stations />} />
                        </Routes>
                    </AuthGuard>
                }/>
            </Routes>
        </BrowserRouter>
    );
}
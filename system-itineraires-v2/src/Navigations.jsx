import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './frontend/Dashboard';
import Inscription from './frontend/Inscription';
import Connexion from './frontend/Connexion';
import Maps from './frontend/Maps';
import Stations from './frontend/Stations';
import Historique from './frontend/Historique';
import AuthGuard from './_helpers/AuthGuard';

export default function Navigations(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Inscription />}></Route>
                <Route path="/login" element={<Connexion />}></Route>
                <Route path='/*' element={
                    <AuthGuard>
                        <Routes>
                            <Route path="/" element={<Dashboard />}></Route>
                            <Route path="/maps" element={<Maps />} />
                            <Route path="/stations" element={<Stations />} />
                            <Route path="/historique" element={<Historique />} />
                        </Routes>
                    </AuthGuard>
          }/>
            </Routes>
        </BrowserRouter>
    );
}
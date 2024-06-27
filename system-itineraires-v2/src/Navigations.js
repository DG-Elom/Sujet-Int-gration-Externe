import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './frontend/Dashboard';
import Inscription from './frontend/Inscription';
import Connexion from './frontend/Connexion';

export default function Navigations(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/register" element={<Inscription />}></Route>
                <Route path="/login" element={<Connexion />}></Route>
            </Routes>
        </BrowserRouter>
    );
}
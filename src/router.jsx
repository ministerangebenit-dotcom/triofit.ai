import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Landing from "./pages/Landing";

import Conversation from "./pages/Conversation";

export default function Router() {

    return (

        <Routes>

            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/conversation"
                    element={<Conversation />}
                />

            </Route>

        </Routes>

    );

}

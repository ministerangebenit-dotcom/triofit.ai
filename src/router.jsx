import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Landing from "./pages/Landing";

export default function Router() {

return (

<Routes>

<Route
element={<MainLayout />}
>

<Route
path="/"
element={<Landing />}
/>

</Route>

</Routes>

);

}

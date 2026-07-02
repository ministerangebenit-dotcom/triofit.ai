import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import NameEntry from "./pages/NameEntry";
import GoalScreen from "./pages/GoalScreen";
import Conversation from "./pages/Conversation";

export default function Router() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/name" element={<NameEntry />} />
        <Route path="/goal" element={<GoalScreen />} />
        <Route path="/conversation" element={<Conversation />} />
      </Route>
    </Routes>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
<<<<<<< HEAD
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./components/Layout";
=======
import ProtectedRoute from "./ProtectedRoute";
>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
<<<<<<< HEAD
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
=======
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907
    </Routes>
  </BrowserRouter>
);

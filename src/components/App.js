import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { SiteProvider } from "./contexts/SiteContext";
import { RegisterProvider } from "./contexts/RegisterContext";
import ProtectedRoute from "./common/ProtectedRoute";
import LoadingBar from "./common/LoadingBar";
import styled from "styled-components";
import LoginPage from "./login/LoginPage";
import InactiveModal from "./common/InactiveModal";
import SelectionPage from "./selection/SelectionPage";
import ImagePage from "./image/ImagePage";
import PageNotFound from "./common/PageNotFound";
import RegisterPage from "./register/RegisterPage";
import SetPassword from "./login/SetPassword";
import DebugPage from "./debug/DebugPage";
import "./App.css";

const queryClient = new QueryClient();
const basename = process.env.BASENAME;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InactiveModal />
      <SiteProvider>
        <Container>
          <LoadingBar />
          <Routes basename={basename}>
            <Route exact path="/" element={<LoginPage />} />
            <RegisterProvider>
              <Route path="/register" element={<RegisterPage />} />
            </RegisterProvider>
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/debug" element={<DebugPage />} />
            <ProtectedRoute path="/selection" element={SelectionPage} />
            <ProtectedRoute path="/image" element={ImagePage} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Container>
      </SiteProvider>
    </QueryClientProvider>
  );
}

const Container = styled.div`
  height: 100vh;
  overflow: hidden;
`;

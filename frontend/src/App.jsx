import React, { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import PostCreatePage from "./pages/PostCreatePage";
import RouteBuilderPage from "./pages/RouteBuilderPage";
import LoginPage from "./pages/LoginPage";
import LoginCompletePage from "./pages/LoginCompletePage";
import LoginFailedPage from "./pages/LoginFailedPage";
import MyPage from "./pages/MyPage";
import AccountRecoveryPage from "./pages/AccountRecoveryPage";

function App() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState("id");
  const demoCredential = { id: "oshiashi", password: "1234" };
  const handleSidebarNavigate = (target) => {
    if (target === "home") setPage("home");
    else if (target === "route-builder") setPage("route-builder");
    else if (target === "post-create") setPage("post-create");
    else if (target === "mypage") setPage("mypage");
    else if (target === "browse" || target === "community") setPage("home");
  };

  return (
    <div className="App">
      {page === "login" && (
        <LoginPage
          onLogin={(identifier, password) => {
            const isValid =
              identifier.trim() === demoCredential.id && password.trim() === demoCredential.password;

            if (isValid) {
              setIsLoggedIn(true);
              setPage("login-complete");
              return;
            }

            setIsLoggedIn(false);
            setPage("login-failed");
          }}
          onGoHome={() => setPage("home")}
          onNavigate={handleSidebarNavigate}
          onGoRecovery={(tab) => {
            setRecoveryTab(tab);
            setPage("account-recovery");
          }}
        />
      )}
      {page === "account-recovery" && (
        <AccountRecoveryPage
          initialTab={recoveryTab}
          onGoLogin={() => setPage("login")}
          onNavigate={handleSidebarNavigate}
        />
      )}
      {page === "login-complete" && (
        <LoginCompletePage onGoLogin={() => setPage("login")} onNavigate={handleSidebarNavigate} />
      )}
      {page === "login-failed" && (
        <LoginFailedPage onRetryLogin={() => setPage("login")} onNavigate={handleSidebarNavigate} />
      )}
      {page === "home" && (
        <Home
          isLoggedIn={isLoggedIn}
          onGoLogin={() => setPage("login")}
          onLogout={() => setIsLoggedIn(false)}
          onGoCreatePost={() => setPage("post-create")}
          onGoRouteBuilder={() => setPage("route-builder")}
          onGoMyPage={() => setPage("mypage")}
          onNavigate={handleSidebarNavigate}
        />
      )}
      {page === "post-create" && (
        <PostCreatePage
          onGoHome={() => setPage("home")}
          onGoRouteBuilder={() => setPage("route-builder")}
          onNavigate={handleSidebarNavigate}
        />
      )}
      {page === "route-builder" && (
        <RouteBuilderPage
          onGoHome={() => setPage("home")}
          onGoCreatePost={() => setPage("post-create")}
          onNavigate={handleSidebarNavigate}
        />
      )}
      {page === "mypage" && <MyPage onNavigate={handleSidebarNavigate} onGoCreatePost={() => setPage("post-create")} />}
    </div>
  );
}

export default App;

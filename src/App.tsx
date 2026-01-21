import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { routeConfig } from "./config/routeConfig.tsx";

function AppRoutes() {
    const routes = useRoutes(routeConfig);
    return routes;
}

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App;

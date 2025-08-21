import App from "@/App";
import ContactPage from "@/page/ContactPage";
import Home from "@/page/Home";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: "contact",
                element: <ContactPage />
            }
        ]
    }
])
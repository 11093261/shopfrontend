import { createContext, useEffect, useState } from "react";

const Usercontext = createContext({
    postAuth: []
});

const Userscontext = ({ children }) => {
    const [postAuth, setPostAuth] = useState([]);
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    useEffect(() => {
        
        const cookieData = getCookie("post");
        if (cookieData) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(cookieData));
                setPostAuth(parsedData);
            } catch (error) {
                console.error("Error parsing cookie data:", error);
            }
        }
    }, []);
    useEffect(() => {
        const checkCookieChange = () => {
            const cookieData = getCookie("post");
            if (cookieData) {
                try {
                    const parsedData = JSON.parse(decodeURIComponent(cookieData));
                    if (JSON.stringify(parsedData) !== JSON.stringify(postAuth)) {
                        setPostAuth(parsedData);
                    }
                } catch (error) {
                    console.error("Error parsing cookie data:", error);
                }
            }
        };
        const interval = setInterval(checkCookieChange, 1000);
        return () => clearInterval(interval);
    }, [postAuth]);

    return (
        <Usercontext.Provider value={{ postAuth, setPostAuth }}>
            {children}
        </Usercontext.Provider>
    );
};

export { Userscontext, Usercontext };
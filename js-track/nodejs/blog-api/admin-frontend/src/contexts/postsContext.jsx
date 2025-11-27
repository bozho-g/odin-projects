import { createContext, useContext } from "react";

const PostsContext = createContext();

export const PostsProvider = ({ value, children }) => {
    return <PostsContext.Provider value={value}>
        {children}</PostsContext.Provider>;
};

export const usePosts = () => {
    return useContext(PostsContext);
};
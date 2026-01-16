import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/endpoints/users";

export function useGetUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        keepPreviousData: true,
    });
}
import { useQuery } from '@tanstack/react-query';
import { getUserByUsername } from '../api/endpoints/users';

export function useFindUserByUsername(username) {
    return useQuery({
        queryKey: ['user', username],
        queryFn: () => getUserByUsername(username),
        enabled: !!username,
        retry: false,
    });
}

export default useFindUserByUsername;

import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/endpoints/posts';

export function usePosts(params = {}) {
    return useQuery({
        queryKey: ['posts', params],
        queryFn: () => getPosts(params),
        refetchInterval: 30000,
    });
}

export default usePosts;

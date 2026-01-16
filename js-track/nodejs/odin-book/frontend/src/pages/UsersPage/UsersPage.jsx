import { useState } from "react";
import styles from "./UsersPage.module.css";
import { useGetUsers } from "../../hooks/useGetUsers";
import { useDebounce } from "../../hooks/useDebounce";
import { ProfileHeader } from "../UserPage/UserPage";
import { UserCard } from "../../components/UserCard/UserCard";

export function UsersPage() {
    const [query, setQuery] = useState('');
    const debouncedInput = useDebounce(query, 300);
    const { data: users, isLoading, isError } = useGetUsers();

    const filteredUsers = users?.filter((user) => user.username.toLowerCase().includes(debouncedInput.toLowerCase()));

    return (<div className={styles.container}>
        <ProfileHeader title="Users" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." />
        {isLoading && <span className="loader" />}
        {isError && <p>Error loading users.</p>}
        {filteredUsers && filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
        ))}
    </div>);
}
function Error({ children }) {
    return (
        <div>
            {children ||
                (<>
                    <h2>Not Authorized</h2>
                    <p>You do not have permission to view this page.</p>
                </>)
            }
        </div >
    );
};

export default Error;
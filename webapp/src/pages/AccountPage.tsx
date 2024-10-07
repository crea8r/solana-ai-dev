import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AccountPage: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Define a type for the placeholder user to ensure consistency
    type User = {
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        orgName: string;
    };

    // Placeholder user data
    const placeholderUser: User = {
        username: 'exampleUser',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        orgName: 'Example Organization', // Ensure orgName is included
    };

    // Use user data from context if available, otherwise use placeholder
    const user = authContext?.user || placeholderUser;

    return (
        <div className="w-full h-full account-page flex items-center justify-center">
            <div className='flex flex-col items-center justify-center border border-gray-400 h-1/2 w-1/2'>
                <h1 className='text-2xl font-bold'>Account Information</h1>
                <div className="account-details">
                    <p><strong>Organization Name:</strong> {user.orgName}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    {'email' in user && <p><strong>Email:</strong> {user.email}</p>}
                    {'firstName' in user && <p><strong>First Name:</strong> {user.firstName}</p>}
                    {'lastName' in user && <p><strong>Last Name:</strong> {user.lastName}</p>}
                </div>
            </div>
        </div>
    );
};

export default AccountPage;

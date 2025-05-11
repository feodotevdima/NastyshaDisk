import React, { useState, useEffect } from 'react';
import GetUsers from './API/GetUsers';
import GetOwner from './API/GetOwner';
import User from '../../Entities/UserEntity';
import Owner from './UI/Owner';
import GetConnectedUsers from './API/GetConnectedUsers';
import Connected from './UI/Connected';
import { FileEvents, fileEventEmitter } from '../../Shered/UpdateFiles';
import Spinner from '../../Wigetes/Spinner/Spinner';
import { useLocation } from 'react-router-dom';
import './SharePage.css'


const SharePage = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
    const [owner, setOwner] = useState<User | null>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const { path } = location.state || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await GetUsers(path);
                setAllUsers(users);

                const cUsers = await GetConnectedUsers(path);
                setConnectedUsers(cUsers.data);

                const ownerResponse = await GetOwner(path);
                setStatus(ownerResponse.status);
                
                if (ownerResponse.status === 200) {
                    setOwner(ownerResponse.data);
                }
            } 
            finally {
                setLoading(false);
            }

            const update = async () => 
            {
                const cUsers = await GetConnectedUsers(path);
                setConnectedUsers(cUsers.data);

                const users = await GetUsers(path);
                setAllUsers(users);
            }
            fileEventEmitter.on(FileEvents.CHECK_CONNECTED_USERS, update);
            return () => {
                fileEventEmitter.off(FileEvents.CHECK_CONNECTED_USERS, update);
            };
        };

        fetchData();
    }, [path]);

    if (loading) {
        return (
            <Spinner />
        );
    }

    if (status != null && status >= 300) {
        return (
            <div>
                {status}
            </div>
        );
    }

    return (
        <>
            {status === 201 && (
                <Owner 
                    allUsers={allUsers}
                    owner={owner}
                    path={path}
                    sharedUsers={connectedUsers}
                />
            )}
            {status === 200 && (
                <Connected 
                    owner={owner}
                    sharedUsers={connectedUsers}
                />
            )}
        </>
    );
};

export default SharePage;
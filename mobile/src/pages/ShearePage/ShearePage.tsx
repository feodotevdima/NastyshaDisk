import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import GetUsers from './API/GetUsers';
import GetOwner from './API/GetOwner';
import User from '../../Entities/UserEntity';
import { SheareScreenProps } from '../../app/NavigationType';
import Owner from './UI/Owner';
import GetConnectedUsers from './API/GetConnectedUsers';
import Connected from './UI/Connected';
import { fileEventEmitter, FileEvents } from './../../sheared/UpdateFiles';

const SheareScreen: React.FC<SheareScreenProps> = ({ route, navigation }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
    const [owner, setOwner] = useState<User | null>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const { path } = route.params;

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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color='rgb(253, 93, 187)' />
            </View>
        );
    }

    if (status != null && status >= 300) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{status}</Text>
            </View>
        );
    }

    return (
        <>
            {status === 201 && (
                <Owner 
                    allUsers={allUsers}
                    owner={owner}
                    path={path}
                    navigation={navigation}
                    sharedUsers={connectedUsers}
                />
            )}
            {status === 200 && (
                <Connected 
                    allUsers={allUsers}
                    owner={owner}
                    path={path}
                    navigation={navigation}
                    sharedUsers={connectedUsers}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(247, 228, 239)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(247, 228, 239)',
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
});

export default SheareScreen;
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import GetUsers from './API/GetUsers';
import GetOwner from './API/GetOwner';
import User from '../../Entities/UserEntity';
import { SheareScreenProps } from '../../app/NavigationType';
import Owner from './UI/Owner';
import GetConnectedUsers from './API/GetConnectedUsers';

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
                
                if (ownerResponse.status === 201) {
                    setOwner(ownerResponse.data);
                }
            } 
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [path]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
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
                />
            )}
            {status === 200 && (
                <View />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffddf1',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffddf1',
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
});

export default SheareScreen;
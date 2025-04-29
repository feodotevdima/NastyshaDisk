import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import User from '../../../Entities/UserEntity';
import AddUser from '../API/AddUser';
import DelUser from '../API/DelUser';

interface ShareScreenProps {
    allUsers: User[];
    owner: User | null;
    path: string;
    navigation: any;
    sharedUsers: User[] | null;
}

const Owner: React.FC<ShareScreenProps> = ({ allUsers, owner, path, navigation, sharedUsers }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    useEffect(() => {
        if (searchQuery.length > 1) {
            const filtered = allUsers.filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [searchQuery, allUsers]);

    const grantAccess = (id: string) => {
        setSearchQuery('');
        AddUser(path, id);
    };

    return (
        <View style={styles.container}>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Добавить пользователя:</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Поиск пользователей"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                
                {filteredUsers.length > 0 && (
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.userItem}
                                onPress={() => grantAccess(item.id)}
                            >
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userEmail}>{item.email}</Text>
                                <Text style={styles.grantAccess}>Дать доступ</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.searchResults}
                    />
                )}
            </View>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Подключенные пользователи:</Text>
                {(sharedUsers!=null && sharedUsers.length > 0) ? (
                    <FlatList
                        style={styles.userCunteyner}
                        data={sharedUsers}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userEmail}>{item.email}</Text>
                                <TouchableOpacity onPress={()=>{DelUser(path, item.id)}}>
                                    <Text style={styles.revokeAccess}>Отозвать доступ</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}>Подключенных пользователей нет</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgb(247, 228, 239)',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    searchResults: {
        maxHeight: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    userItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userCunteyner:{
        borderRadius: 8,
        backgroundColor: 'white',
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    grantAccess: {
        color: '#2e86de',
        marginTop: 8,
        fontWeight: '500',
    },
    revokeAccess: {
        color: 'rgb(255, 0, 76)',
        marginTop: 8,
        fontWeight: '500',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },
});

export default Owner;
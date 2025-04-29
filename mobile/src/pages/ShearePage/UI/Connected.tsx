import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import User from '../../../Entities/UserEntity';
import AddUser from '../API/AddUser';

interface ShareScreenProps {
    allUsers: User[];
    owner: User | null;
    path: string;
    navigation: any;
    sharedUsers: User[] | null;
}

const Connected: React.FC<ShareScreenProps> = ({ allUsers, owner, path, navigation, sharedUsers}) => {
    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Владелец:</Text>
                {owner && (
                    <View style={styles.userItem}>
                        <Text style={styles.userName}>Имя: {owner.name}</Text>
                        <Text style={styles.userEmail}>Почта: {owner.email}</Text>
                    </View>
                )}
            </View>
            
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Подключенные пользователи:</Text>
                {(sharedUsers!=null && sharedUsers.length > 0) ? (
                    <FlatList
                        data={sharedUsers}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userEmail}>{item.email}</Text>
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
        color: '#ee5253',
        marginTop: 8,
        fontWeight: '500',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },
});

export default Connected;
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SheareScreenProps } from '../../app/NavigationType';
import GetUsers from './API/GetUsers';
import User from '../../Entities/UserEntity';

const SheareScreen: React.FC<SheareScreenProps> = ({ route, navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [folderOwner, setFolderOwner] = useState(null);
    const [sharedUsers, setSharedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { path } = route.params;

    useEffect(() => {
      const setUser = async () => {
        const users: User[] = await GetUsers();
        setAllUsers(users);
      }
      setUser();
    }, []);

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
      }, [searchQuery]);

    const grantAccess = (id: string) =>{
      setSearchQuery('')
      console.log(id)
    }

    return (
        <View style={styles.container}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Владелец:</Text>
            {folderOwner && (
              <View style={styles.userItem}>
                <Text style={styles.userName}>{folderOwner}</Text>
                <Text style={styles.userEmail}>{folderOwner}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Добавить пользователя:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск пользователей..."
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
            <Text style={styles.sectionTitle}>Пользователи с доступом:</Text>
            {sharedUsers.length > 0 ? (
              <FlatList
                data={sharedUsers}
                // keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.userItem}>
                    <Text style={styles.userName}>{item}</Text>
                    <Text style={styles.userEmail}>{item}</Text>
                    <TouchableOpacity>
                    {/* onPress={() => revokeAccess(item.id)} */}
                      <Text style={styles.revokeAccess}>Отозвать доступ</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>Нет пользователей с доступом</Text>
            )}
          </View>
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffddf1',
      },
      title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
      error: {
        color: 'red',
        textAlign: 'center',
      },
    });
    
export default SheareScreen;
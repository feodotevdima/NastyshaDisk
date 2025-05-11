import React, { useState, useEffect } from 'react';
import User from '../../../Entities/UserEntity';
import AddUser from '../API/AddUser';
import DelUser from '../API/DelUser';

interface ShareScreenProps {
  allUsers: User[];
  owner: User | null;
  path: string;
  sharedUsers: User[] | null;
}

const Owner: React.FC<ShareScreenProps> = ({ allUsers, owner, path, sharedUsers }) => {
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
    <div className="sharedContainer">
      <div className="section">
        <h3 className="section-title">Добавить пользователя:</h3>
        <input
          className="search-input"
          type="text"
          placeholder="Поиск пользователей"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {filteredUsers.length > 0 && (
          <div className="user-list">
            {filteredUsers.map((item) => (
              <div 
                key={item.id} 
                className="user-item"
                onClick={() => grantAccess(item.id)}
              >
                <div className="user-name">{item.name}</div>
                <div className="user-email">{item.email}</div>
                <div className="action-grant">Дать доступ</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="section">
        <h3 className="section-title">Подключенные пользователи:</h3>
        {sharedUsers && sharedUsers.length > 0 ? (
          <div className="user-list">
            {sharedUsers.map((item) => (
              <div key={item.id} className="user-item">
                <div className="user-name">{item.name}</div>
                <div className="user-email">{item.email}</div>
                <div 
                  className="action-revoke"
                  onClick={() => DelUser(path, item.id)}
                >
                  Отозвать доступ
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-text">Подключенных пользователей нет</div>
        )}
      </div>
    </div>
  );
};

export default Owner;
import React from 'react';
import User from '../../../Entities/UserEntity';

interface ShareScreenProps {
    owner: User | null;
    sharedUsers: User[] | null;
}

const Connected: React.FC<ShareScreenProps> = ({ owner, sharedUsers }) => {
    return (
        <div className='sharedContainer'>
            <div className="section">
                <div className="section-title">Владелец:</div>
                {owner && (
                    <div className="user-item">
                        <div className="user-name">{owner.name}</div>
                        <div className="user-email">{owner.email}</div>
                    </div>
                )}
            </div>
            
            <div className="section">
                <div className="section-title">Подключенные пользователи:</div>
                {(sharedUsers != null && sharedUsers.length > 0) ? (
                    <div className="user-list">
                        {sharedUsers.map((item) => (
                            <div className="user-item" key={item.id}>
                                <div className="user-name">{item.name}</div>
                                <div className="user-email">{item.email}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="userText">Подключенных пользователей больше нет</div>
                )}
            </div>
        </div>
    );
};

export default Connected;
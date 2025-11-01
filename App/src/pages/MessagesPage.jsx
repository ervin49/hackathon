import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { sendMessage as sendToFirebase, generateChatId } from '../services/chatService'; 
import { db } from '../services/firebase'; 
import { collection, query, getDocs, orderBy, startAt, endAt, onSnapshot, where } from 'firebase/firestore'; 

const MessagesPage = () => {
    const { userData } = useAuth();
    const currentUserId = userData?.uid; 
    const username = userData?.username || 'Tu';

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null);
    
    const [selectedUser, setSelectedUser] = useState(null); 
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [conversations, setConversations] = useState([]);
    
    const FIRESTORE_MAX_CHAR = '\uf8ff'; 

    const searchUsersLive = useCallback(async (queryText) => {
        const textToSearch = queryText.trim().toLowerCase(); 
        if (!textToSearch || !currentUserId || textToSearch.length < 3) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setLoadingSearch(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const q = query(
                collection(db, 'users'),
                orderBy('username'), 
                startAt(textToSearch),       
                endAt(textToSearch + FIRESTORE_MAX_CHAR) 
            );
            
            const snapshot = await getDocs(q);
            
            const results = snapshot.docs
                .map(doc => doc.data())
                .filter(user => user.uid !== currentUserId); 
            
            if (results.length === 0) {
                setSearchError(`Nu a fost găsit niciun utilizator care începe cu "${queryText}".`);
            }
            setSearchResults(results);

        } catch (err) {
            console.error("Eroare la căutarea utilizatorului:", err);
            setSearchError("Eroare la căutarea utilizatorului. Verificați Indexul.");
        } finally {
            setLoadingSearch(false);
        }
    }, [currentUserId]); 

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.length >= 3) { 
                 searchUsersLive(searchQuery);
            } else if (searchQuery.length < 3) {
                 setSearchResults([]);
                 if (searchQuery.length > 0) {
                    setSearchError("Introduceți minim 3 caractere.");
                 } else {
                    setSearchError(null);
                 }
            }
        }, 300); 

        return () => clearTimeout(delaySearch);
    }, [searchQuery, searchUsersLive]);

    // Încarcă lista de conversații
    useEffect(() => {
        if (!currentUserId) return;

        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUserId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sortează după ultimul mesaj
            convos.sort((a, b) => {
                const timeA = a.lastMessageTime?.toMillis() || 0;
                const timeB = b.lastMessageTime?.toMillis() || 0;
                return timeB - timeA;
            });
            
            setConversations(convos);
        });

        return () => unsubscribe();
    }, [currentUserId]);

    // Încarcă mesajele pentru conversația selectată
    useEffect(() => {
        if (!selectedUser || !currentUserId) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        
        // Creează ID-ul conversației (același mod ca în chatService)
        const chatId = [currentUserId, selectedUser.uid].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setLoadingMessages(false);
        }, (error) => {
            console.error("Eroare la încărcarea mesajelor:", error);
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [selectedUser, currentUserId]);

    const selectUserForChat = (user) => {
        setSelectedUser(user);
        setSearchResults([]); 
        setSearchError(null);
        setSendSuccess(false);
        setSearchQuery(''); // Curăță și search query-ul
    };

    const selectConversation = (conversation) => {
        // Determină cealaltă persoană din conversație
        const otherUserId = conversation.participants.find(id => id !== currentUserId);
        const otherUserName = conversation.user1Id === currentUserId 
            ? conversation.user2Name 
            : conversation.user1Name;
        
        setSelectedUser({
            uid: otherUserId,
            username: otherUserName
        });
        setSearchResults([]);
        setSearchError(null);
        setSendSuccess(false);
        setSearchQuery('');
    };

    const handleSendInitialMessage = async () => {
        if (!input.trim() || !selectedUser || !currentUserId) return;
        
        setSending(true);
        setSearchError(null);
        setSendSuccess(false);
        
        try {
            await sendToFirebase(
                currentUserId, 
                selectedUser.uid, 
                username, 
                selectedUser.username, 
                input.trim()
            );
            
            setInput('');
            setSendSuccess(true);
            
        } catch (error) {
            console.error("Eroare la trimiterea mesajului:", error);
            setSearchError(error.message || "Nu s-a putut trimite mesajul. Verificați regulile Firebase.");
        } finally {
            setSending(false);
        }
    };

    const isUserLoggedIn = !!currentUserId;

    // Funcție helper pentru formatarea timpului
    const formatTime = (date) => {
        if (!date) return '';
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else if (days === 1) {
            return 'Ieri';
        } else if (days < 7) {
            return `${days} zile`;
        } else {
            return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
        }
    };

    if (!isUserLoggedIn) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#ef4444',
                fontSize: '18px'
            }}>
                Te rog autentifică-te pentru a trimite mesaje.
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#1a1625',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Sidebar - Lista de conversații */}
            <div style={{
                width: '420px',
                backgroundColor: '#231d30',
                borderRight: '1px solid #2d2640',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Search Bar */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #2d2640'
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <FiSearch style={{
                            position: 'absolute',
                            left: '15px',
                            width: '18px',
                            height: '18px',
                            color: '#6b7280'
                        }} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedUser(null); 
                                setSendSuccess(false);
                            }}
                            disabled={loadingSearch}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 45px',
                                backgroundColor: '#1a1625',
                                border: '1px solid #2d2640',
                                borderRadius: '12px',
                                color: '#e5e7eb',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = '#2d2640'}
                        />
                    </div>
                    {loadingSearch && (
                        <p style={{ 
                            color: '#8b5cf6', 
                            fontSize: '13px', 
                            marginTop: '8px',
                            marginLeft: '5px' 
                        }}>
                            Se caută...
                        </p>
                    )}
                    {searchError && (
                        <p style={{ 
                            color: '#ef4444', 
                            fontSize: '13px', 
                            marginTop: '8px',
                            marginLeft: '5px' 
                        }}>
                            {searchError}
                        </p>
                    )}
                </div>

                {/* Lista de conversații */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '8px 0'
                }}>
                    {/* Afișează conversațiile existente când nu se caută */}
                    {searchQuery.length < 3 && conversations.length > 0 && (
                        <>
                            {conversations.map(convo => {
                                const otherUserId = convo.participants.find(id => id !== currentUserId);
                                const otherUserName = convo.user1Id === currentUserId 
                                    ? convo.user2Name 
                                    : convo.user1Name;
                                const isSelected = selectedUser?.uid === otherUserId;
                                
                                return (
                                    <div
                                        key={convo.id}
                                        onClick={() => selectConversation(convo)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '16px 20px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            backgroundColor: isSelected ? '#2d2640' : 'transparent',
                                            borderLeft: isSelected ? '3px solid #8b5cf6' : '3px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = '#2a2436';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            backgroundColor: '#8b5cf6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '15px',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: 'white',
                                            flexShrink: 0
                                        }}>
                                            {otherUserName.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '4px'
                                            }}>
                                                <h3 style={{
                                                    color: '#f9fafb',
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    margin: 0
                                                }}>
                                                    {otherUserName}
                                                </h3>
                                                {convo.lastMessageTime && (
                                                    <span style={{
                                                        color: '#6b7280',
                                                        fontSize: '12px',
                                                        marginLeft: '8px'
                                                    }}>
                                                        {formatTime(convo.lastMessageTime.toDate())}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{
                                                color: '#9ca3af',
                                                fontSize: '13px',
                                                margin: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {convo.lastMessageText || 'Nici un mesaj'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                    
                    {/* Afișează rezultatele căutării */}
                    {searchQuery.length >= 3 && searchResults.length > 0 && (
                        searchResults.map(user => (
                            <div
                                key={user.uid}
                                onClick={() => selectUserForChat(user)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    backgroundColor: selectedUser?.uid === user.uid ? '#2d2640' : 'transparent',
                                    borderLeft: selectedUser?.uid === user.uid ? '3px solid #8b5cf6' : '3px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedUser?.uid !== user.uid) {
                                        e.currentTarget.style.backgroundColor = '#2a2436';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedUser?.uid !== user.uid) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: '#8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                    }}>
                                        <h3 style={{
                                            color: '#f9fafb',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            margin: 0
                                        }}>
                                            {user.username}
                                        </h3>
                                    </div>
                                    <p style={{
                                        color: '#9ca3af',
                                        fontSize: '13px',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Click pentru a începe conversația
                                    </p>
                                </div>

                                {/* Badge sau indicator */}
                                <FiMessageSquare style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#8b5cf6',
                                    marginLeft: '10px'
                                }} />
                            </div>
                        ))
                    )}
                    
                    {/* Mesaj când nu sunt conversații sau rezultate */}
                    {searchQuery.length < 3 && conversations.length === 0 && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            padding: '40px 20px',
                            textAlign: 'center'
                        }}>
                            <FiMessageSquare style={{
                                width: '48px',
                                height: '48px',
                                color: '#4b5563',
                                marginBottom: '16px'
                            }} />
                            <p style={{
                                color: '#6b7280',
                                fontSize: '15px',
                                margin: 0
                            }}>
                                You don't have any conversations yet. Start by searching for users above.
                            </p>
                        </div>
                    )}
                    
                    {searchQuery.length >= 3 && searchResults.length === 0 && !loadingSearch && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            padding: '40px 20px',
                            textAlign: 'center'
                        }}>
                            <FiSearch style={{
                                width: '48px',
                                height: '48px',
                                color: '#4b5563',
                                marginBottom: '16px'
                            }} />
                            <p style={{
                                color: '#6b7280',
                                fontSize: '15px',
                                margin: 0
                            }}>
                                Nu s-au găsit rezultate
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#1a1625'
            }}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '20px 30px',
                            borderBottom: '1px solid #2d2640',
                            backgroundColor: '#231d30'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>
                                    {selectedUser.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{
                                        color: '#f9fafb',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>
                                        {selectedUser.username}
                                    </h2>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '13px',
                                        margin: '2px 0 0 0'
                                    }}>
                                        Începe o conversație nouă
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: '20px 30px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {loadingMessages ? (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <p style={{ color: '#8b5cf6' }}>Se încarcă mesajele...</p>
                                </div>
                            ) : messages.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {messages.map((msg) => {
                                        const isMine = msg.senderId === currentUserId;
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                <div style={{
                                                    maxWidth: '60%',
                                                    padding: '12px 16px',
                                                    borderRadius: '16px',
                                                    backgroundColor: isMine ? '#8b5cf6' : '#2d2640',
                                                    color: '#f9fafb'
                                                }}>
                                                    <p style={{
                                                        margin: '0 0 4px 0',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {msg.text}
                                                    </p>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        color: isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af'
                                                    }}>
                                                        {msg.timestamp ? formatTime(msg.timestamp.toDate()) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    textAlign: 'center'
                                }}>
                                    <FiMessageSquare style={{
                                        width: '64px',
                                        height: '64px',
                                        color: '#4b5563',
                                        margin: '0 auto 20px'
                                    }} />
                                    <h3 style={{
                                        color: '#9ca3af',
                                        fontSize: '18px',
                                        fontWeight: '500',
                                        margin: '0 0 8px 0'
                                    }}>
                                        Trimite primul mesaj către {selectedUser.username}
                                    </h3>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        margin: 0
                                    }}>
                                        Începeți conversația folosind formularul de mai jos
                                    </p>
                                </div>
                            )}
                            
                            {searchError && (
                                <p style={{ 
                                    color: '#ef4444', 
                                    marginTop: '15px',
                                    textAlign: 'center'
                                }}>
                                    {searchError}
                                </p>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '20px 30px',
                            borderTop: '1px solid #2d2640',
                            backgroundColor: '#231d30'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-end'
                            }}>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Write message to ${selectedUser.username}...`}
                                    disabled={sending}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendInitialMessage();
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '14px 18px',
                                        backgroundColor: '#1a1625',
                                        border: '1px solid #2d2640',
                                        borderRadius: '12px',
                                        color: '#e5e7eb',
                                        fontSize: '14px',
                                        resize: 'none',
                                        minHeight: '52px',
                                        maxHeight: '150px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        lineHeight: '1.5'
                                    }}
                                />
                                <button
                                    onClick={handleSendInitialMessage}
                                    disabled={sending || !input.trim()}
                                    style={{
                                        padding: '14px 24px',
                                        backgroundColor: (!input.trim() || sending) ? '#4b5563' : '#8b5cf6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                        opacity: (!input.trim() || sending) ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (input.trim() && !sending) {
                                            e.currentTarget.style.backgroundColor = '#7c3aed';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (input.trim() && !sending) {
                                            e.currentTarget.style.backgroundColor = '#8b5cf6';
                                        }
                                    }}
                                >
                                    <FiSend style={{ width: '16px', height: '16px' }} />
                                    {sending ? 'Trimitere...' : 'Trimite'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#2d2640',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <FiMessageSquare style={{
                                width: '40px',
                                height: '40px',
                                color: '#6b7280'
                            }} />
                        </div>
                        <h2 style={{
                            color: '#9ca3af',
                            fontSize: '24px',
                            fontWeight: '600',
                            margin: '0 0 12px 0'
                        }}>
                            Select a conversation to start messaging
                        </h2>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '15px',
                            margin: 0,
                            maxWidth: '400px'
                        }}>
                            Search for users on the left to start a new conversation or select an existing one.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
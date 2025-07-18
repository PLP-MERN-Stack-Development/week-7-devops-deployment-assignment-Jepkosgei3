import { useState } from 'react';
import RoomSelector from './components/RoomSelector';
import ChatRoom from './components/ChatRoom';
import './index.css';

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      {!username || !room ? (
        <RoomSelector onJoin={(u, r) => {
          setUsername(u);
          setRoom(r);
        }} />
      ) : (
        <ChatRoom username={username} room={room} />
      )}
    </div>
  );
}

export default App;
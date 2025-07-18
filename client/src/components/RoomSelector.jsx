import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:4000';

function RoomSelector({ onJoin }) {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/rooms`, {
      withCredentials: true,
    })
      .then(res => {
        console.log('Rooms fetched successfully:', res.data);
        setRooms(res.data);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Failed to fetch rooms:', err.message, err.response?.data);
        setError('Failed to load rooms. Please try again.');
      });
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoom) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/rooms`, { name: newRoom }, {
        withCredentials: true,
      });
      console.log('Room created successfully:', res.data);
      setRooms([...rooms, res.data]);
      setSelectedRoom(res.data.name);
      setNewRoom('');
      setError(null);
    } catch (err) {
      console.error('❌ Failed to create room:', err.message, err.response?.data);
      setError('Failed to create room. Please try again.');
    }
  };

  const handleDeleteRoom = async (roomName) => {
    if (window.confirm(`Are you sure you want to delete the room "${roomName}"?`) && username === 'admin') {
      try {
        await axios.delete(`${API_BASE_URL}/rooms/${roomName}`, {
          withCredentials: true,
        });
        setRooms(rooms.filter(room => room.name !== roomName));
        if (selectedRoom === roomName) setSelectedRoom('');
        console.log('Room deleted successfully:', roomName);
      } catch (err) {
        console.error('❌ Failed to delete room:', err.message, err.response?.data);
        setError('Failed to delete room. Please try again.');
      }
    } else if (username !== 'admin') {
      setError('Only the admin can delete rooms.');
    }
  };

  const handleJoin = () => {
    if (username && selectedRoom) {
      onJoin(username, selectedRoom);
    } else {
      setError('Please enter a username and select a room.');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-md">
      <h2 className="text-2xl mb-4">Join a Chat Room</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        placeholder="Enter username"
        className="w-full border px-4 py-2 mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <select
        className="w-full border px-4 py-2 mb-4"
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">Select a room</option>
        {rooms.map((room) => (
          <option key={room._id} value={room.name}>
            {room.name}
          </option>
        ))}
      </select>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="New room name"
          className="flex-1 border px-4 py-2"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <button onClick={handleCreateRoom} className="bg-blue-500 text-white px-4 py-2">
          Create
        </button>
      </div>

      <div className="mb-4">
        {rooms.map((room) => (
          <div key={room._id} className="flex justify-between items-center py-1">
            <span>{room.name}</span>
            {username === 'admin' && (
              <button
                onClick={() => handleDeleteRoom(room.name)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleJoin}
        disabled={!username || !selectedRoom}
        className="bg-green-500 text-white px-4 py-2 w-full"
      >
        Join
      </button>
    </div>
  );
}

export default RoomSelector;

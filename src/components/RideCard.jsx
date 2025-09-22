import React from 'react';

const Profile = () => {
  // Demo data, future me API se fetch kar sakte ho
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+91 9876543210",
    profilePic: "https://i.pravatar.cc/150?img=3"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
        <img
          src={user.profilePic}
          alt="Profile"
          className="w-32 h-32 mx-auto rounded-full border-4 border-purple-400 mb-4"
        />
        <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
        <p className="text-gray-300 mb-1">{user.email}</p>
        <p className="text-gray-300 mb-4">{user.phone}</p>
        <button className="px-6 py-2 bg-purple-500 rounded-full font-semibold hover:bg-purple-600 transition">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;

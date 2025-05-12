'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface User {
  id: string;
  photo: string;
}

export default function Home() {
  const [pair, setPair] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPair = async () => {
    setLoading(true);
    setHasLoaded(false);
    try {
      const res = await axios.get('/api/users/random');
      setPair(res.data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleVote = async (winnerId: string, loserId: string) => {
    try {
      setLoading(true);
      await axios.post('/api/users/vote', { winnerId, loserId });
      await fetchPair();
    } catch (e) {
      console.error('Vote failed:', e);
    }
  };

  useEffect(() => {
    fetchPair();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Who's Hotter?</h1>

      {loading && (
        <div className="flex flex-col items-center space-y-4 mb-10">
          <span className="text-lg text-indigo-600 font-medium">🔥 Searching for the hottest pictures...</span>
          <div className="w-48 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-[loading_1s_linear_infinite] w-full"></div>
          </div>
        </div>
      )}

      {!loading && pair && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl transition-opacity duration-500">
          {pair.map((user, idx) => (
            <div
              key={user.id}
              className="cursor-pointer border-2 border-gray-200 rounded-xl p-4 shadow hover:shadow-lg transition-transform hover:scale-105 max-w-[512px] mx-auto opacity-0 animate-fade-in"
              onClick={() => handleVote(user.id, pair[1 - idx].id)}
            >
              <Image
                src={user.photo}
                alt={`User ${idx + 1}`}
                width={512}
                height={683}
                className="object-cover rounded-lg w-full h-auto"
                onLoadingComplete={() => setHasLoaded(true)}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}

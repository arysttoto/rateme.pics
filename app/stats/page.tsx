'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface StatsData {
  name: string;
  photo: string;
  rating: number;
  percentile: number;
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAvatarAndFetchStats() {
      try {
        const hasAvatar = await axios.get('/api/users/hasAvatar');
        if (!hasAvatar.data.photo) {
          router.push('/join');
          return;
        }
        const res = await axios.get('/api/users/stats');
        setData(res.data);
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    checkAvatarAndFetchStats();
  }, [router]);

  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full space-y-6">
        {loading || !data ? (
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mb-4" />
              <div className="h-6 w-40 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-20 bg-gray-200 rounded-xl" />
              <div className="h-20 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-4 w-3/4 bg-gray-200 mx-auto rounded" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={data.photo}
                  alt={`${data.name}'s profile photo`}
                  layout="fill"
                  className="rounded-full object-cover border-4 border-indigo-500 shadow-md"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">{data.name}</h1>
              <p className="text-sm text-gray-500">User Profile</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-xl p-4 text-center shadow w-full h-full">
                <div className="text-sm text-gray-500">Rating</div>
                <div className="text-2xl font-semibold text-indigo-600">{data.rating}</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-center shadow w-full h-full">
                <div className="text-sm text-gray-500">Percentile</div>
                <div className="text-2xl font-semibold text-indigo-600">
                  {`Top ${100 - data.percentile}%`} 
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">Keep up the great work, {data.name}!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

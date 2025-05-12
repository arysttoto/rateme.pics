'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import type { PutBlobResult } from '@vercel/blob';
import Image from 'next/image';

export default function JoinPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null | undefined>(undefined);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkExistingAvatar = async () => {
      try {
        const res = await fetch('/api/users/hasAvatar');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setExistingPhoto(data.photo || null);
      } catch {
        setExistingPhoto(null);
        console.log("No existing avatar");
      }
    };
    checkExistingAvatar();
  }, []);

  const removeAvatar = async () => {
    try {
      await fetch('/api/users/removeAvatar', { method: 'DELETE' });
      setExistingPhoto(null);
    } catch {
      alert('Failed to remove avatar');
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels || !consent) return;

    try {
      setIsLoading(true);
      setMessage(null);

      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = 512;
      canvas.height = 683;

      if (ctx) {
        ctx.drawImage(image, x, y, width, height, 0, 0, 512, 683);
        canvas.toBlob(async (blobData) => {
          if (!blobData) throw new Error("Failed to convert canvas to blob");

          const file = new File([blobData], 'avatar.png', {
            type: 'image/png',
          });

          const response = await fetch(`/api/users/uploadAvatar?filename=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: file,
          });

          if (!response.ok) throw new Error("Upload failed");

          const newBlob = (await response.json()) as PutBlobResult;
          setImageSrc(null); // Close cropper
          setMessage("✅ Upload successful!");
          setExistingPhoto(newBlob.url);
        }, 'image/png');
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (existingPhoto === undefined) {
    return (
      <div className="px-4 py-8 max-w-xl mx-auto text-center">
        <p className="text-gray-600 text-lg">Checking for existing avatar...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">{existingPhoto ? 'Your Current Avatar' : 'Join RateMe'}</h1>
      <p className="mb-6 text-gray-600 text-center">
        {existingPhoto ? 'You have already uploaded a photo. You can remove it below or upload a new one.' : 'Upload your image and consent to public rating to enter the game.'}
      </p>

      {isLoading && (
        <div className="text-center mb-4 text-gray-500">Uploading your photo...</div>
      )}

      {existingPhoto && !imageSrc ? (
        <div className="text-center space-y-6">
          <Image
            src={existingPhoto}
            alt="Your Avatar"
            width={512}
            height={683}
            className="rounded-lg mx-auto"
          />
          <button
            onClick={removeAvatar}
            className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg transition"
          >
            ✖ Remove Avatar
          </button>
        </div>
      ) : !imageSrc ? (
        <div className="space-y-3 text-center">
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={onFileChange}
            className="mx-auto text-sm text-gray-700"
            required
          />
        </div>
      ) : (
        <div>
          <div className="relative w-full max-w-[512px] mx-auto bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="text-sm text-gray-700">Zoom:</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full sm:flex-grow"
            />
          </div>

          <div className="flex items-start gap-3 mt-6">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={() => setConsent(!consent)}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-800"
              >
                Terms and Conditions
              </a>{' '}
              of RateMe.
            </label>
          </div>

          <button
            onClick={getCroppedImage}
            disabled={!consent || isLoading}
            className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold transition ${
              consent && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Uploading...' : 'Submit and Be Judged'}
          </button>

          {message && (
            <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ----------- Helpers -----------
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(file);
  });
};

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
};

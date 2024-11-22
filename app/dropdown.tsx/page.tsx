"use client";

import React, { useState, useCallback, useEffect } from "react";
import { signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Added getDoc to fetch the profile picture
import { db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../lib/cropImage";

const DropdownMenu = ({ profilePic, setProfilePic }: { profilePic: string | null; setProfilePic: (url: string) => void }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const router = useRouter();

  // Fetch profile picture on component mount
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(db, "users", auth.currentUser.uid);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            if (userData.profilePic) {
              setProfilePic(userData.profilePic); // Set the fetched profile picture
            }
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      }
    };

    fetchProfilePic();
  }, [setProfilePic]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    setShowCropper(true); // Show the cropping modal
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropAndUpload = async () => {
    if (!croppedAreaPixels || !imagePreview) return;

    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);

      // Convert cropped image to Blob
      const blob = await fetch(croppedImage).then((res) => res.blob());

      // Upload to Firebase Storage
      const storage = getStorage();
      const fileName = `profile-pictures/${auth.currentUser?.uid || "default"}-profile-pic.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);

      // Get the uploaded profile picture URL
      const imageUrl = await getDownloadURL(storageRef);

      // Save the profile picture URL to Firestore
      const userDoc = doc(db, "users", auth.currentUser?.uid || "default");
      await setDoc(userDoc, { profilePic: imageUrl }, { merge: true });

      setProfilePic(imageUrl);
      setShowCropper(false);
      alert("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading cropped profile picture:", error);
    }
  };

  return (
    <div className="relative">
      {/* Profile Picture */}
      <img
        src={profilePic || "/images/profile-icon.jpg"}
        alt="Admin Profile"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      />

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg w-48">
          <label
            htmlFor="upload-profile-pic"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Upload Profile Picture
            <input
              id="upload-profile-pic"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicSelect}
            />
          </label>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Log Out
          </button>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Crop Your Profile Picture</h2>
            <div className="relative w-full h-64 bg-gray-200">
              <Cropper
                image={imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleCropAndUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;

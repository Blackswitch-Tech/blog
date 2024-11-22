"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../lib/cropImage";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import DropdownMenu from "../dropdown.tsx/page";
import { onAuthStateChanged } from "firebase/auth";
interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  content: string;
}

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const router = useRouter();

    // Protect the admin route
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          // Redirect to login if user is not authenticated
          router.push("/login");
        }
      });
      return () => unsubscribe();
    }, [router]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Blog Posts
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        setBlogPosts(postsData);
  
        // Fetch Profile Picture
        
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            if (userData.profilePic) {
              setProfilePic(userData.profilePic);
            }
          }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  // Listen for Authentication State Changes
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchData(user.uid);
    } else {
      setProfilePic(null); // Clear profile picture if user is not logged in
    }
  });

  return () => unsubscribe(); // Cleanup the listener on unmount
}, []);
  
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleCreateNewBlog = () => {
    setNewTitle("");
    setNewContent("");
    setNewImagePreview(null);
    setCroppedImage(null);
    setShowModal(true);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setNewImagePreview(imageUrl);
    }
  };

  const onCropComplete = useCallback(async (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (newImagePreview && croppedAreaPixels) {
      const croppedImg = await getCroppedImg(newImagePreview, croppedAreaPixels);
      setCroppedImage(croppedImg);
    }
  }, [newImagePreview]);

  const addBlogPost = async () => {
    if (!newTitle || !croppedImage || !newContent) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const blob = await fetch(croppedImage).then((res) => res.blob());
      const storage = getStorage();
      const fileName = `images/${Date.now()}-cropped-image.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      const newPost = {
        title: newTitle,
        date: new Date().toLocaleDateString(),
        image: imageUrl,
        content: newContent,
      };

      const docRef = await addDoc(collection(db, "posts"), newPost);
      setBlogPosts((prevPosts) => [...prevPosts, { id: docRef.id, ...newPost }]);
      setShowModal(false);
      setNewTitle("");
      setNewImagePreview(null);
      setNewImageFile(null);
      setNewContent("");
      setCroppedImage(null);
    } catch (error) {
      console.error("Error adding new blog post:", error);
    }
  };

  
  const handleEditBlogPost = (post: BlogPost) => {
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewImagePreview(post.image);
    setCroppedImage(post.image);
    setEditPostId(post.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const updateBlogPost = async () => {
    if (!editPostId || !newTitle || !croppedImage || !newContent) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const postRef = doc(db, "posts", editPostId);
      await setDoc(
        postRef,
        {
          title: newTitle,
          date: new Date().toLocaleDateString(),
          image: croppedImage,
          content: newContent,
        },
        { merge: true }
      );

      setBlogPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editPostId
            ? { ...post, title: newTitle, image: croppedImage, content: newContent }
            : post
        )
      );

      setShowModal(false);
      setNewTitle("");
      setNewImagePreview(null);
      setNewImageFile(null);
      setNewContent("");
      setCroppedImage(null);
      setEditPostId(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating blog post:", error);
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      setBlogPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  };

  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-gray-100 relative">
      <div className="w-full max-w-4xl flex items-center mb-8 justify-between">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 p-3 border rounded-full border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
         <DropdownMenu profilePic={profilePic} setProfilePic={setProfilePic} />
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link href={`/blog/${post.id}`}>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500">{post.date}</p>
                <p className="mt-2 text-gray-700">{post.content.slice(0, 100)}...</p>
              </div>
            </Link>
            <div className="flex justify-start gap-4 mt-4 p-4">
              <button
                onClick={() => handleEditBlogPost(post)}
                className="flex items-center space-x-1 p-2 text-blue-600 hover:text-blue-800"
              >
                <FaEdit /> <span>Edit</span>
              </button>
              <button
                onClick={() => deleteBlogPost(post.id)}
                className="flex items-center space-x-1 p-2 text-red-600 hover:text-red-800"
              >
                <FaTrash /> <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCreateNewBlog}
        className="hidden lg:block fixed bottom-10 right-10 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-500 focus:outline-none"
      >
        <FaPlus className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">
              {isEditing ? "Edit Blog" : "Create New Blog"}
            </h2>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="file"
              onChange={handleImageUpload}
              className="w-full p-2 mb-4 border rounded"
              accept="image/*"
            />
            {newImagePreview && (
              <div className="relative w-full h-48 mb-4">
                <Cropper
                  image={newImagePreview}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
            {croppedImage && (
              <img
                src={croppedImage}
                alt="Cropped Preview"
                className="w-full h-48 object-cover mb-4"
              />
            )}
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content"
              className="w-full p-4 mb-4 border rounded h-96 resize-none"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              {isEditing ? (
                <button
                  onClick={updateBlogPost}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={addBlogPost}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

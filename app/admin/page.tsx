"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../lib/cropImage";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import Image from "next/image";
import DropdownMenu from "../dropdown.tsx/page";

interface BlogPost {
  id: string;
  title: string;
  image: string;
  content: string;
  date?: string; // Optional if not always provided
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
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch blog posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        setBlogPosts(postsData);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    };

    fetchData();
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

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
      if (newImagePreview && croppedAreaPixels) {
        const croppedImg = await getCroppedImg(newImagePreview, croppedAreaPixels);
        setCroppedImage(croppedImg);
      }
    },
    [newImagePreview]
  );

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
    if (!editPostId || !newTitle || !newContent) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      let updatedImageUrl = croppedImage;

      if (newImageFile && croppedImage) {
        const blob = await fetch(croppedImage).then((res) => res.blob());
        const storage = getStorage();
        const fileName = `images/${Date.now()}-updated-image.jpg`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, blob);
        updatedImageUrl = await getDownloadURL(storageRef);
      }

      const postRef = doc(db, "posts", editPostId);
      await setDoc(
        postRef,
        {
          title: newTitle,
          content: newContent,
          image: updatedImageUrl,
          date: new Date().toLocaleDateString(),
        },
        { merge: true }
      );

      setBlogPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editPostId
            ? { ...post, title: newTitle, content: newContent, image: updatedImageUrl }
            : post
        )
      );

      setShowModal(false);
      alert("Blog post updated successfully!");
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert("Failed to update the blog post.");
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
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-gray-100">
      <div className="w-full max-w-4xl flex items-center mb-8 justify-between space-x-4 md:space-x-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-[90%] p-3 border rounded-full border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue"
        />
        <DropdownMenu profilePic={profilePic} setProfilePic={setProfilePic} />
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <Link href={`/blog/${post.id}`}>
              <Image
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
                width={800}
                height={400}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500">{post.date}</p>
                <p
                  className="mt-2 text-gray-700 overflow-hidden text-ellipsis line-clamp-3"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.content}
                </p>
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
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-16
        md:h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition duration-300"
      >
        <FaPlus size={20} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] sm:w-[70%] md:w-[50%] rounded-lg p-6 shadow-lg max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Blog Title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Blog Content"
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {newImagePreview && (
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
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
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              {isEditing ? (
                <button
                  onClick={updateBlogPost}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={addBlogPost}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
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

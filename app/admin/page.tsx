"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa"; // Import icons
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore"; // Firestore imports
import { db, auth } from "../../lib/firebase"; // Firebase setup
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../lib/cropImage"; // Helper function to crop image and convert to blob
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  content: string;
}

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]); // State for fetched blog posts
  const [showModal, setShowModal] = useState(false); // Show or hide modal
  const [isEditing, setIsEditing] = useState(false); // For checking if we're editing a blog post
  const [editPostId, setEditPostId] = useState<string | null>(null); // ID of the blog post being edited
  const [newTitle, setNewTitle] = useState(""); // New blog title
  const [newContent, setNewContent] = useState(""); // New blog content
  const [newImageFile, setNewImageFile] = useState<File | null>(null); // New blog image file
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null); // Image preview
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // For image cropping
  const [zoom, setZoom] = useState(1); // For image zoom during crop
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // Cropped area
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Final cropped image preview

  const router = useRouter();

  // Fetch blog posts from Firestore when the component mounts
  useEffect(() => {
    const fetchBlogPosts = async () => {
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
    fetchBlogPosts();
  }, []);

  // Handle Log Out
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Show modal for creating a new blog
  const handleCreateNewBlog = () => {
    setNewTitle("");
    setNewContent("");
    setNewImagePreview(null);
    setCroppedImage(null);
    setShowModal(true);
    setIsEditing(false);
  };

  // Handle image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);

      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      setNewImagePreview(imageUrl);
    }
  };

  // Save cropped area of the image
  const onCropComplete = useCallback(async (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    // Automatically crop the image without a button
    if (newImagePreview && croppedAreaPixels) {
      const croppedImg = await getCroppedImg(newImagePreview, croppedAreaPixels);
      setCroppedImage(croppedImg);
    }
  }, [newImagePreview]);

  // Add a new blog post to Firestore
  const addBlogPost = async () => {
    if (!newTitle || !croppedImage || !newContent) {
      alert("Please fill in all fields and upload an image.");
      return;
    }
  
    try {
      // Convert the cropped image to a Blob
      const blob = await fetch(croppedImage).then((res) => res.blob());
  
      // Upload the Blob to Firebase Storage
      const storage = getStorage(); // Initialize Firebase Storage
      const fileName = `images/${Date.now()}-cropped-image.jpg`; // Unique file name
      const storageRef = ref(storage, fileName); // Reference to storage location
      await uploadBytes(storageRef, blob); // Upload the Blob to Firebase Storage
  
      // Get the Firebase Storage download URL
      const imageUrl = await getDownloadURL(storageRef);
  
      // Save the blog post to Firestore
      const newPost = {
        title: newTitle,
        date: new Date().toLocaleDateString(),
        image: imageUrl, // Use the Firebase Storage URL here
        content: newContent,
      };
  
      const docRef = await addDoc(collection(db, "posts"), newPost);
  
      // Update local state
      setBlogPosts((prevPosts) => [...prevPosts, { id: docRef.id, ...newPost }]);
  
      // Reset modal and form state
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
  

  // Open the modal for editing
  const handleEditBlogPost = (post: BlogPost) => {
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewImagePreview(post.image);
    setCroppedImage(post.image);
    setEditPostId(post.id);
    setIsEditing(true);
    setShowModal(true);
  };

  // Update the blog post in Firestore
  const updateBlogPost = async () => {
    if (!editPostId || !newTitle || !croppedImage || !newContent) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const postRef = doc(db, "posts", editPostId); // Reference to the post
      await setDoc(postRef, {
        title: newTitle,
        date: new Date().toLocaleDateString(),
        image: croppedImage,
        content: newContent,
      }, { merge: true }); // Use merge: true to update specific fields

      console.log("Blog post updated successfully");

      // Update the local state with the new changes
      setBlogPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editPostId
            ? { ...post, title: newTitle, image: croppedImage, content: newContent }
            : post
        )
      );

      // Reset modal and state
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

  // Delete a blog post from Firestore
  const deleteBlogPost = async (id: string) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      setBlogPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      console.log("Blog post deleted successfully");
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  };

  // Filter blog posts based on the search term
  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-gray-100 relative">
      {/* Search Bar and Profile */}
      <div className="w-full max-w-4xl flex items-center mb-8 justify-between">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 p-3 border rounded-full border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="relative">
          <img
            src="/images/profile-icon.jpg"
            alt="Admin Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="w-full max-w-4xl space-y-8">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-500">{post.date}</p>
              <p className="mt-2 text-gray-700">{post.content}</p>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleEditBlogPost(post)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <FaEdit /> <span>Edit</span>
                </button>
                <button
                  onClick={() => deleteBlogPost(post.id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <FaTrash /> <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (FAB) for creating a new blog */}
      <button
        onClick={handleCreateNewBlog}
        className="hidden lg:block fixed bottom-10 right-10 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-500 focus:outline-none"
      >
        <FaPlus className="w-6 h-6" />
      </button>

      {/* Modal for creating or editing a blog post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            {/* Ensuring that the modal is scrollable */}
            <h2 className="text-2xl font-semibold mb-4">{isEditing ? "Edit Blog" : "Create New Blog"}</h2>
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

            {/* Image Cropping */}
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

            {/* Cropped Image Preview */}
            {croppedImage && (
              <img src={croppedImage} alt="Cropped Preview" className="w-full h-48 object-cover mb-4" />
            )}

            {/* Expanded textarea for writing content */}
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

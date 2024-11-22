import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useEffect, useState } from "react";

const BlogPost = ({ params }) => {
  const { id } = params; // Extract the dynamic ID from the URL
  const [post, setPost] = useState(null);

  // Fetch the blog post from Firestore
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost(docSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      }
    };

    fetchBlogPost();
  }, [id]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-gray-500">{post.date}</p>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover my-4"
        />
        <p className="text-gray-700">{post.content}</p>
      </div>
    </div>
  );
};

export default BlogPost;

import { fetchAPI } from "../apiClient";

// GET semua data TopicBlog
export const getTopicBlog = async () => {
  try {
    const response = await fetchAPI("topic_blogs");

    // Pastikan respons memiliki properti 'data'
    if (response && response.data) {
      return response.data; // Kembalikan array topik dari properti 'data'
    } else {
      console.error("Invalid API response:", response);
      return []; // Kembalikan array kosong jika respons tidak valid
    }
  } catch (error) {
    console.error("Error fetching topic blogs:", error);
    return []; // Kembalikan array kosong jika terjadi error
  }
};
// GET satu TopicBlog by ID
export const getTopicBlogById = (id) => fetchAPI(`topic_blogs/${id}`);

// CREATE TopicBlog baru
export const createTopicBlog = (data) => fetchAPI("topic_blogs", "POST", data);

// UPDATE TopicBlog
export const updateTopicBlog = (id, data) =>
  fetchAPI(`TopicBlogs/${id}`, "PUT", data);

// DELETE TopicBlog
export const deleteTopicBlog = (id) => fetchAPI(`topic_blogs/${id}`, "DELETE");

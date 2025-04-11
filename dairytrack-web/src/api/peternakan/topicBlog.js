import { fetchAPI } from "../apiClient";

// GET semua data TopicBlog
export const getTopicBlog = () => fetchAPI("topic_blogs");

// GET satu TopicBlog by ID
export const getTopicBlogById = (id) => fetchAPI(`topic_blogs/${id}`);

// CREATE TopicBlog baru
export const createTopicBlog = (data) => fetchAPI("topic_blogs", "POST", data);

// UPDATE TopicBlog
export const updateTopicBlog = (id, data) =>
  fetchAPI(`TopicBlogs/${id}`, "PUT", data);

// DELETE TopicBlog
export const deleteTopicBlog = (id) => fetchAPI(`topic_blogs/${id}`, "DELETE");

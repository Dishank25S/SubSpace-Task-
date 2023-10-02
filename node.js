const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to fetch blog data from the third-party API
async function fetchBlogData() {
  try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Middleware to fetch and analyze blog data
app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogs = await fetchBlogData();

    // Calculate the total number of blogs
    const totalBlogs = blogs.length;

    // Find the blog with the longest title
    const longestTitleBlog = _.maxBy(blogs, (blog) => blog.title.length);

    // Determine the number of blogs with titles containing the word "privacy"
    const privacyBlogs = _.filter(blogs, (blog) =>
      blog.title.toLowerCase().includes('privacy')
    );
    const numPrivacyBlogs = privacyBlogs.length;

    // Create an array of unique blog titles (no duplicates)
    const uniqueBlogTitles = _.uniqBy(blogs, 'title');

    // Respond to the client with the statistics
    res.json({
      totalBlogs,
      longestBlogTitle: longestTitleBlog.title,
      numPrivacyBlogs,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    });
  } catch (error) {
    // Handle errors, log them, and respond with an appropriate error message
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Blog search endpoint
app.get('/api/blog-search', async (req, res) => {
  const query = req.query.query.toLowerCase();

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const blogs = await fetchBlogData();

    // Implement a search functionality that filters the blogs based on the provided query string (case-insensitive)
    const filteredBlogs = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(query)
    );

    // Respond to the client with the filtered blogs
    res.json({ blogs: filteredBlogs });
  } catch (error) {
    // Handle errors, log them, and respond with an appropriate error message
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

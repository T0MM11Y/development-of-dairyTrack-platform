import 'package:dairy_track/modules/peternakan/blog/editBlog.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/peternakan/blog.dart';
import 'package:dairy_track/model/peternakan/blog.dart';
import 'package:dairy_track/config/configApi5000.dart';
import 'package:intl/intl.dart';

class AllBlog extends StatefulWidget {
  @override
  _AllBlogState createState() => _AllBlogState();
}

class _AllBlogState extends State<AllBlog> {
  final TextEditingController _searchController = TextEditingController();

  Future<List<Blog>> fetchBlogs() async {
    try {
      final allBlogs = await getBlogs();
      debugPrint('API Response: $allBlogs');

      final searchText = _searchController.text.toLowerCase();

      final filteredBlogs = allBlogs.where((blog) {
        if (searchText.isNotEmpty &&
            !blog.title.toLowerCase().contains(searchText) &&
            !blog.description.toLowerCase().contains(searchText)) {
          return false;
        }
        return true;
      }).toList();

      return filteredBlogs;
    } catch (e) {
      debugPrint('Error fetching blogs: $e');
      rethrow;
    }
  }

  String formatDate(String? date) {
    if (date == null || date.isEmpty) return 'Unknown';
    try {
      final parsedDate = DateTime.parse(date);
      return DateFormat('dd MMM yyyy, HH:mm').format(parsedDate);
    } catch (e) {
      return 'Invalid date';
    }
  }

  void _addBlog(BuildContext context) {
    Navigator.pushNamed(context, '/add-blog');
  }

  void _addTopic(BuildContext context) {
    Navigator.pushNamed(context, '/create-topic-blog');
  }

  void _editBlog(BuildContext context, Blog blog) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditBlog(blog: blog),
      ),
    );
  }

  void _deleteBlog(BuildContext context, int id) async {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete Blog?', style: TextStyle(color: Colors.red[700])),
        content: const Text('Are you sure you want to delete this blog?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            onPressed: () async {
              try {
                final response = await deleteBlog(id.toString());
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Blog deleted successfully'),
                    backgroundColor: Colors.green,
                  ),
                );
                setState(() {}); // Refresh the UI after deletion
              } catch (e) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to delete blog: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Blog Management',
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 20)),
        backgroundColor: const Color(0xFF4A6FA5),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() {
                _searchController.clear();
              });
            },
          ),
        ],
      ),
      body: Container(
        color: Colors.grey[200], // Background color untuk seluruh body
        child: Column(
          children: [
            // Search Field dengan background yang sama
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200], // Warna background sama dengan body
                  borderRadius: BorderRadius.circular(25),
                ),
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(color: Colors.black),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white, // Warna background text field
                    hintText: 'Search blogs...',
                    hintStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.search, color: Colors.black),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 5),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
              ),
            ),
            // Body
            Expanded(
              child: FutureBuilder<List<Blog>>(
                future: fetchBlogs(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                        child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Color(0xFF4A6FA5)),
                    ));
                  } else if (snapshot.hasError) {
                    return Center(
                        child: Text('Error: ${snapshot.error}',
                            style: const TextStyle(color: Colors.red)));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.article,
                              size: 60, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text('No blogs found',
                              style:
                                  TextStyle(fontSize: 18, color: Colors.grey)),
                          if (_searchController.text.isNotEmpty)
                            TextButton(
                              onPressed: () {
                                setState(() {
                                  _searchController.clear();
                                });
                              },
                              child: const Text('Clear search'),
                            ),
                        ],
                      ),
                    );
                  } else {
                    final blogs = snapshot.data!;
                    return ListView.separated(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      itemCount: blogs.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final blog = blogs[index];
                        return InkWell(
                          borderRadius: BorderRadius.circular(15),
                          onTap: () {
                            // Add navigation to blog detail if needed
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.2),
                                  spreadRadius: 2,
                                  blurRadius: 5,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Blog Image
                                      if (blog.photo != null &&
                                          blog.photo!.isNotEmpty)
                                        ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                          child: Image.network(
                                            '$BASE_URL/${blog.photo!}',
                                            width: 80,
                                            height: 80,
                                            fit: BoxFit.cover,
                                            errorBuilder:
                                                (context, error, stackTrace) =>
                                                    Container(
                                              width: 80,
                                              height: 80,
                                              color: Colors.grey[200],
                                              child: const Icon(
                                                  Icons.broken_image,
                                                  color: Colors.grey),
                                            ),
                                          ),
                                        )
                                      else
                                        Container(
                                            width: 80,
                                            height: 80,
                                            decoration: BoxDecoration(
                                              color: Colors.grey[200],
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            child: const Icon(
                                                Icons.image_not_supported,
                                                color: Colors.grey)),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            // Title with Read More option
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    blog.title,
                                                    style: const TextStyle(
                                                      fontSize: 18,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Color(0xFF2C3E50),
                                                    ),
                                                    maxLines: 2,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            // Topic Chip
                                            if (blog.topicName != null)
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 8,
                                                        vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFF4A6FA5)
                                                      .withOpacity(0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                ),
                                                child: Text(
                                                  blog.topicName!,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        const Color(0xFF4A6FA5),
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                      // Edit/Delete Menu
                                      PopupMenuButton<String>(
                                        icon: const Icon(Icons.more_vert,
                                            color: Colors.grey),
                                        onSelected: (value) {
                                          if (value == 'edit') {
                                            _editBlog(context,
                                                blog); // Kirim objek Blog
                                          } else if (value == 'delete') {
                                            _deleteBlog(context, blog.id!);
                                          }
                                        },
                                        itemBuilder: (context) => [
                                          const PopupMenuItem(
                                            value: 'edit',
                                            child: Row(
                                              children: [
                                                Icon(Icons.edit,
                                                    color: Colors.blue),
                                                SizedBox(width: 8),
                                                Text('Edit'),
                                              ],
                                            ),
                                          ),
                                          const PopupMenuItem(
                                            value: 'delete',
                                            child: Row(
                                              children: [
                                                Icon(Icons.delete,
                                                    color: Colors.red),
                                                SizedBox(width: 8),
                                                Text('Delete'),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  // Description
                                  Text(
                                    blog.description,
                                    style: const TextStyle(
                                        fontSize: 14, color: Colors.black87),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 12),
                                  // Date and View Button
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        formatDate(
                                            blog.createdAt?.toIso8601String()),
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey[600]),
                                      ),
                                      TextButton(
                                        onPressed: () {
                                          // Add view functionality
                                        },
                                        style: TextButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 16),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          backgroundColor:
                                              const Color(0xFF4A6FA5)
                                                  .withOpacity(0.1),
                                        ),
                                        child: const Text('View Details',
                                            style: TextStyle(
                                                color: Color(0xFF4A6FA5))),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'addBlog',
            onPressed: () => _addBlog(context),
            backgroundColor: const Color(0xFF4A6FA5),
            child: const Icon(Icons.add, color: Colors.white),
            tooltip: 'Add Blog',
          ),
          const SizedBox(height: 12),
          FloatingActionButton(
            heroTag: 'addTopic',
            onPressed: () => _addTopic(context),
            backgroundColor: const Color(0xFF2C8C72),
            child: const Icon(Icons.topic, color: Colors.white),
            tooltip: 'Add Topic',
          ),
        ],
      ),
    );
  }
}

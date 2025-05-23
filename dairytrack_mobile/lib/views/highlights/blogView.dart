import 'dart:io';
import 'package:dairytrack_mobile/controller/APIURL1/blogCategoryManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/blogManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/categoryManagementController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';

class BlogView extends StatefulWidget {
  const BlogView({Key? key}) : super(key: key);

  @override
  _BlogViewState createState() => _BlogViewState();
}

class _BlogViewState extends State<BlogView> {
  final BlogManagementController _blogController = BlogManagementController();
  final BlogCategoryManagementController _blogCategoryController =
      BlogCategoryManagementController();
  final CategoryManagementController _categoryController =
      CategoryManagementController();
  List<Blog> _blogs = [];
  List<Category> _categories = [];
  String? _selectedCategoryId;
  bool _isLoading = true;
  String _errorMessage = '';
  final TextEditingController _categoryNameController = TextEditingController();
  final TextEditingController _categoryDescriptionController =
      TextEditingController();
  final TextEditingController _blogTitleController = TextEditingController();
  final TextEditingController _blogContentController = TextEditingController();
  File? _blogImage;
  Blog? _selectedBlog;

  @override
  void initState() {
    super.initState();
    _fetchBlogs();
    _fetchCategories();
  }

  Future<void> _fetchBlogs({String? categoryId}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      List<Blog> blogs =
          await _blogController.listBlogs(categoryId: categoryId);
      setState(() {
        _blogs = blogs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to fetch blogs: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchCategories() async {
    try {
      final response = await _categoryController.listCategories();
      if (response['success']) {
        List<dynamic> categoryData = response['data']['categories'];
        List<Category> categories =
            categoryData.map((json) => Category.fromJson(json)).toList();
        setState(() {
          _categories = categories;
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to fetch categories: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to fetch categories: $e';
      });
    }
  }

  Future<void> _addCategory(String name, String description) async {
    try {
      final response = await _categoryController.addCategory(name, description);
      if (response['success']) {
        _fetchCategories(); // Refresh category list
        Navigator.of(context).pop(); // Close dialog
      } else {
        setState(() {
          _errorMessage = 'Failed to add category: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to add category: $e';
      });
    }
  }

  Future<void> _editCategory(int id, String name, String description) async {
    try {
      final response =
          await _categoryController.updateCategory(id, name, description);
      if (response['success']) {
        _fetchCategories(); // Refresh category list
        Navigator.of(context).pop(); // Close dialog
      } else {
        setState(() {
          _errorMessage = 'Failed to edit category: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to edit category: $e';
      });
    }
  }

  Future<void> _deleteCategory(int id) async {
    try {
      final response = await _categoryController.deleteCategory(id);
      if (response['success']) {
        _fetchCategories(); // Refresh category list
      } else {
        setState(() {
          _errorMessage = 'Failed to delete category: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to delete category: $e';
      });
    }
  }

  Future<void> _assignCategoryToBlog(int blogId, int categoryId) async {
    try {
      final response = await _blogCategoryController.assignCategoryToBlog(
          blogId, categoryId);
      if (response['success']) {
        // Optionally refresh blogs or show a success message
        print('Category assigned successfully');
      } else {
        setState(() {
          _errorMessage =
              'Failed to assign category to blog: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to assign category to blog: $e';
      });
    }
  }

  Future<void> _addBlog(String title, String content, File image) async {
    try {
      final response = await _blogController.addBlog(
        title,
        content,
        image.path,
        [], // Pass an empty list for categoryIds initially
      );
      if (response['success']) {
        _fetchBlogs(); // Refresh blog list
        Navigator.of(context).pop(); // Close dialog
      } else {
        setState(() {
          _errorMessage = 'Failed to add blog: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to add blog: $e';
      });
    }
  }

  Future<void> _editBlog(
      int id, String title, String content, File? image) async {
    try {
      Map<String, dynamic> response;
      if (image != null) {
        response = await _blogController.updateBlog(
          id,
          title: title,
          content: content,
          photoPath: image.path,
        );
      } else {
        response = await _blogController.updateBlog(
          id,
          title: title,
          content: content,
        );
      }

      if (response['success']) {
        _fetchBlogs(); // Refresh blog list
        Navigator.of(context).pop(); // Close dialog
      } else {
        setState(() {
          _errorMessage = 'Failed to edit blog: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to edit blog: $e';
      });
    }
  }

  Future<void> _deleteBlog(int id) async {
    try {
      final response = await _blogController.deleteBlog(id);
      if (response['success']) {
        _fetchBlogs(); // Refresh blog list
      } else {
        setState(() {
          _errorMessage = 'Failed to delete blog: ${response['message']}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to delete blog: $e';
      });
    }
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    setState(() {
      if (pickedFile != null) {
        _blogImage = File(pickedFile.path);
      } else {
        print('No image selected.');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title:
            const Text('Blogs', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.green,
        elevation: 2,
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () {
              // Show add blog dialog
              showDialog(
                context: context,
                builder: (context) {
                  return AlertDialog(
                    title: const Text('Add New Blog',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    content: SingleChildScrollView(
                      child: Column(
                        children: [
                          TextField(
                            controller: _blogTitleController,
                            decoration: InputDecoration(
                                labelText: 'Blog Title',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                )),
                          ),
                          const SizedBox(height: 10),
                          TextField(
                            controller: _blogContentController,
                            decoration: InputDecoration(
                                labelText: 'Blog Content',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                )),
                            maxLines: 3,
                          ),
                          const SizedBox(height: 10),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            onPressed: _pickImage,
                            child: const Text('Pick Image'),
                          ),
                          _blogImage == null
                              ? const Text('No image selected')
                              : Image.file(
                                  _blogImage!,
                                  height: 100,
                                ),
                        ],
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: const Text('Cancel',
                            style: TextStyle(color: Colors.grey)),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: () {
                          if (_blogImage != null) {
                            _addBlog(
                              _blogTitleController.text,
                              _blogContentController.text,
                              _blogImage!,
                            );
                          } else {
                            setState(() {
                              _errorMessage = 'Please pick an image';
                            });
                          }
                        },
                        child: const Text('Add'),
                      ),
                    ],
                  );
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.category, color: Colors.white),
            onPressed: () {
              // Show add category dialog
              showDialog(
                context: context,
                builder: (context) {
                  return AlertDialog(
                    title: const Text('Add New Category',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    content: Column(
                      children: [
                        TextField(
                          controller: _categoryNameController,
                          decoration: InputDecoration(
                              labelText: 'Category Name',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              )),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _categoryDescriptionController,
                          decoration: InputDecoration(
                              labelText: 'Category Description',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              )),
                        ),
                      ],
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: const Text('Cancel',
                            style: TextStyle(color: Colors.grey)),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: () {
                          _addCategory(
                            _categoryNameController.text,
                            _categoryDescriptionController.text,
                          );
                        },
                        child: const Text('Add'),
                      ),
                    ],
                  );
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.list, color: Colors.white),
            onPressed: () {
              // Show category list dialog
              showDialog(
                context: context,
                builder: (context) {
                  return AlertDialog(
                    title: const Text('Category List',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    content: SizedBox(
                      width: double.maxFinite,
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: _categories.length,
                        itemBuilder: (context, index) {
                          final category = _categories[index];
                          return ListTile(
                            title: Text(category.name),
                            subtitle: Text(category.description),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit,
                                      color: Colors.orange),
                                  onPressed: () {
                                    // Show edit category dialog
                                    showDialog(
                                      context: context,
                                      builder: (context) {
                                        final _editCategoryNameController =
                                            TextEditingController(
                                                text: category.name);
                                        final _editCategoryDescriptionController =
                                            TextEditingController(
                                                text: category.description);
                                        return AlertDialog(
                                          title: const Text('Edit Category',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold)),
                                          content: Column(
                                            children: [
                                              TextField(
                                                controller:
                                                    _editCategoryNameController,
                                                decoration: InputDecoration(
                                                    labelText: 'Category Name',
                                                    border: OutlineInputBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              8),
                                                    )),
                                              ),
                                              const SizedBox(height: 10),
                                              TextField(
                                                controller:
                                                    _editCategoryDescriptionController,
                                                decoration: InputDecoration(
                                                    labelText:
                                                        'Category Description',
                                                    border: OutlineInputBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              8),
                                                    )),
                                              ),
                                            ],
                                          ),
                                          actions: [
                                            TextButton(
                                              onPressed: () {
                                                Navigator.of(context).pop();
                                              },
                                              child: const Text('Cancel',
                                                  style: TextStyle(
                                                      color: Colors.grey)),
                                            ),
                                            ElevatedButton(
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.green,
                                                foregroundColor: Colors.white,
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                ),
                                              ),
                                              onPressed: () {
                                                _editCategory(
                                                  category.id,
                                                  _editCategoryNameController
                                                      .text,
                                                  _editCategoryDescriptionController
                                                      .text,
                                                );
                                              },
                                              child: const Text('Save'),
                                            ),
                                          ],
                                        );
                                      },
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete,
                                      color: Colors.red),
                                  onPressed: () {
                                    _deleteCategory(category.id);
                                  },
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: const Text('Close',
                            style: TextStyle(color: Colors.grey)),
                      ),
                    ],
                  );
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.link, color: Colors.white),
            onPressed: () {
              // Show assign category dialog
              showDialog(
                context: context,
                builder: (context) {
                  return AlertDialog(
                    title: const Text('Assign Category to Blog',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    content: Column(
                      children: [
                        DropdownButtonFormField<Blog>(
                          decoration: InputDecoration(
                              labelText: 'Select Blog',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              )),
                          value: _selectedBlog,
                          items: _blogs.map((blog) {
                            return DropdownMenuItem<Blog>(
                              value: blog,
                              child: Text(blog.title),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedBlog = value;
                            });
                          },
                        ),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<Category>(
                          decoration: InputDecoration(
                              labelText: 'Select Category',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              )),
                          items: _categories.map((category) {
                            return DropdownMenuItem<Category>(
                              value: category,
                              child: Text(category.name),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (_selectedBlog != null && value != null) {
                              _assignCategoryToBlog(
                                  _selectedBlog!.id, value.id);
                            }
                          },
                        ),
                      ],
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: const Text('Cancel',
                            style: TextStyle(color: Colors.grey)),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: const Text('Assign'),
                      ),
                    ],
                  );
                },
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(child: Text(_errorMessage))
              : Column(
                  children: [
                    _buildCategoryFilter(),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _blogs.length,
                        itemBuilder: (context, index) {
                          final blog = _blogs[index];
                          return _buildBlogCard(blog);
                        },
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildCategoryFilter() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          labelText: 'Filter by Category',
        ),
        value: _selectedCategoryId,
        items: [
          const DropdownMenuItem(
            value: null,
            child: Text('All Categories'),
          ),
          ..._categories.map((category) => DropdownMenuItem(
                value: category.id.toString(),
                child: Text(category.name),
              )),
        ],
        onChanged: (value) {
          setState(() {
            _selectedCategoryId = value;
          });
          _fetchBlogs(categoryId: value);
        },
      ),
    );
  }

  Widget _buildBlogCard(Blog blog) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                blog.photoUrl,
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const Text('Failed to load image'),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              blog.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              blog.content,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Created At: ${DateFormat('yyyy-MM-dd').format(blog.createdAt)}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                Text(
                  'Updated At: ${DateFormat('yyyy-MM-dd').format(blog.updatedAt)}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.orange),
                  onPressed: () {
                    // Show edit blog dialog
                    showDialog(
                      context: context,
                      builder: (context) {
                        final _editBlogTitleController =
                            TextEditingController(text: blog.title);
                        final _editBlogContentController =
                            TextEditingController(text: blog.content);
                        File? _editBlogImage;
                        return AlertDialog(
                          title: const Text('Edit Blog',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          content: SingleChildScrollView(
                            child: Column(
                              children: [
                                TextField(
                                  controller: _editBlogTitleController,
                                  decoration: InputDecoration(
                                      labelText: 'Blog Title',
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      )),
                                ),
                                const SizedBox(height: 10),
                                TextField(
                                  controller: _editBlogContentController,
                                  decoration: InputDecoration(
                                      labelText: 'Blog Content',
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      )),
                                ),
                                const SizedBox(height: 10),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  onPressed: () async {
                                    final pickedFile = await ImagePicker()
                                        .pickImage(source: ImageSource.gallery);
                                    setState(() {
                                      if (pickedFile != null) {
                                        _editBlogImage = File(pickedFile.path);
                                      } else {
                                        print('No image selected.');
                                      }
                                    });
                                  },
                                  child: const Text('Pick Image'),
                                ),
                                _editBlogImage == null
                                    ? const Text('No image selected')
                                    : Image.file(
                                        _editBlogImage!,
                                        height: 100,
                                      ),
                              ],
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              child: const Text('Cancel',
                                  style: TextStyle(color: Colors.grey)),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              onPressed: () {
                                _editBlog(
                                  blog.id,
                                  _editBlogTitleController.text,
                                  _editBlogContentController.text,
                                  _editBlogImage,
                                );
                              },
                              child: const Text('Save'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () {
                    _deleteBlog(blog.id);
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

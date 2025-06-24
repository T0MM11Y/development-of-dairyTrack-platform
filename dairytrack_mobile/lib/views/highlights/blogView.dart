import 'dart:io';
import 'package:dairytrack_mobile/controller/APIURL1/blogCategoryManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/blogManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/categoryManagementController.dart';
import 'package:dairytrack_mobile/views/highlights/blogDetailView.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart'
    show SharedPreferences;

class BlogView extends StatefulWidget {
  const BlogView({Key? key}) : super(key: key);

  @override
  _BlogViewState createState() => _BlogViewState();
}

class _BlogViewState extends State<BlogView> with TickerProviderStateMixin {
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
  late TextEditingController editContentController;
  File? _blogImage;
  Blog? _selectedBlog;
  bool _isFabExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _expandAnimation;

  // Dark theme colors
  static const Color darkPrimary = Color(0xFF1A1A1A);
  static const Color darkSecondary = Color(0xFF2D2D2D);
  static const Color darkSurface = Color(0xFF3A3A3A);
  static const Color darkAccent = Color(0xFF4CAF50);
  static const Color darkError = Color(0xFFFF5252);
  static const Color darkWarning = Color(0xFFFF9800);
  static const Color darkInfo = Color(0xFF2196F3);
  static const Color darkText = Color(0xFFE0E0E0);
  static const Color darkTextSecondary = Color(0xFFB0B0B0);

  String _userRole = '';
  @override
  void initState() {
    super.initState();
    _getUserRole();

    _fetchBlogs();
    _fetchCategories();

    // Initialize editContentController with empty string or appropriate value
    editContentController = TextEditingController(text: '');

    // Initialize animation controller
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _expandAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  Future<void> _getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('userRole') ?? '';
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isFabExpanded = !_isFabExpanded;
    });

    if (_isFabExpanded) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  Future<void> _removeCategoryFromBlog(
      int blogId, int categoryId, String categoryName, String blogTitle) async {
    final confirmed = await _showConfirmationDialog(
      title: 'Confirm Remove Category',
      content:
          'Are you sure you want to remove the category "$categoryName" from the blog "$blogTitle"?',
      confirmText: 'Remove',
      confirmColor: darkError,
      icon: Icons.remove_circle,
    );
    if (!confirmed) return;

    try {
      // Call API to remove category from blog
      final response = await _blogCategoryController.removeCategoryFromBlog(
          blogId, categoryId);
      if (response['success']) {
        _showSnackBar(
          'Category "$categoryName" was successfully removed from the blog',
          backgroundColor: darkWarning,
          icon: Icons.remove_circle,
        );

        // Refresh data after successfully removing the category
        await _refreshAllData();
      } else {
        _showSnackBar(
          'Failed to remove category: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      _showSnackBar(
        'Failed to remove category: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  // Enhanced snackbar method
  void _showSnackBar(String message, {Color? backgroundColor, IconData? icon}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 8),
            ],
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor ?? darkAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
        elevation: 8,
      ),
    );
  }

  // Enhanced confirmation dialog
  Future<bool> _showConfirmationDialog({
    required String title,
    required String content,
    required String confirmText,
    Color confirmColor = darkError,
    IconData? icon,
  }) async {
    return await showDialog<bool>(
          context: context,
          builder: (BuildContext context) {
            return Theme(
              data: ThemeData.dark().copyWith(
                dialogBackgroundColor: darkSecondary,
                cardColor: darkSecondary,
              ),
              child: AlertDialog(
                backgroundColor: darkSecondary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: confirmColor, size: 24),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      title,
                      style: const TextStyle(
                        color: darkText,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
                content: Text(
                  content,
                  style: const TextStyle(
                    color: darkTextSecondary,
                    fontSize: 14,
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: TextButton.styleFrom(
                      foregroundColor: darkTextSecondary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Batal'),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: confirmColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 2,
                    ),
                    child: Text(confirmText),
                  ),
                ],
              ),
            );
          },
        ) ??
        false;
  }

  // Enhanced dark modal theme
  ThemeData get _darkModalTheme => ThemeData.dark().copyWith(
        dialogBackgroundColor: darkSecondary,
        cardColor: darkSecondary,
        colorScheme: const ColorScheme.dark(
          primary: darkAccent,
          secondary: darkInfo,
          surface: darkSurface,
          background: darkPrimary,
          error: darkError,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: darkSurface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: darkSurface),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: darkSurface),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: darkAccent, width: 2),
          ),
          labelStyle: const TextStyle(color: darkTextSecondary),
          hintStyle: const TextStyle(color: darkTextSecondary),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: darkAccent,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 4,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: darkTextSecondary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      );

// Method untuk refresh semua data
  Future<void> _refreshAllData() async {
    await Future.wait([
      _fetchBlogs(categoryId: _selectedCategoryId),
      _fetchCategories(),
    ]);
  }

// Method untuk refresh dengan loading indicator
  Future<void> _refreshData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await _refreshAllData();
    } catch (e) {
      _showSnackBar(
        'Gagal memuat ulang data: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
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
        Navigator.of(context).pop();
        _showSnackBar(
          'Category "$name" added successfully',
          icon: Icons.check_circle,
        );
        _categoryNameController.clear();
        _categoryDescriptionController.clear();

        // Refresh data setelah berhasil menambah kategori
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage = 'Failed to add category: ${response['message']}';
        });
        _showSnackBar(
          'Failed to add category: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to add category: $e';
      });
      _showSnackBar(
        'Failed to add category: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _editCategory(int id, String name, String description) async {
    final confirmed = await _showConfirmationDialog(
      title: 'Konfirmasi Edit',
      content: 'Apakah Anda yakin ingin mengubah kategori "$name"?',
      confirmText: 'Edit',
      confirmColor: darkWarning,
      icon: Icons.edit,
    );

    if (!confirmed) return;

    try {
      final response =
          await _categoryController.updateCategory(id, name, description);
      if (response['success']) {
        Navigator.of(context).pop();
        Navigator.of(context).pop(); // Close category list dialog
        _showSnackBar(
          'Kategori "$name" updated successfully',
          icon: Icons.check_circle,
        );

        // Refresh data setelah berhasil edit kategori
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage = 'Failed to edit category: ${response['message']}';
        });
        _showSnackBar(
          'Gagal mengubah kategori: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to edit category: $e';
      });
      _showSnackBar(
        'Gagal mengubah kategori: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _deleteCategory(int id) async {
    final category = _categories.firstWhere((cat) => cat.id == id);
    final confirmed = await _showConfirmationDialog(
      title: 'Konfirmasi Hapus',
      content:
          'Are you sure you want to delete the category? "${category.name}"? This action cannot be undone.',
      confirmText: 'Hapus',
      confirmColor: darkError,
      icon: Icons.delete_forever,
    );

    if (!confirmed) return;

    try {
      final response = await _categoryController.deleteCategory(id);
      if (response['success']) {
        Navigator.of(context).pop(); // Close category list dialog
        _showSnackBar(
          'Category "${category.name}" deleted successfully',
          backgroundColor: darkError,
          icon: Icons.delete,
        );

        // Refresh data setelah berhasil hapus kategori
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage = 'Failed to delete category: ${response['message']}';
        });
        _showSnackBar(
          'Failed to delete category: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to delete category: $e';
      });
      _showSnackBar(
        'Gagal menghapus kategori: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _assignCategoryToBlog(int blogId, int categoryId) async {
    try {
      final response = await _blogCategoryController.assignCategoryToBlog(
          blogId, categoryId);
      if (response['success']) {
        Navigator.of(context).pop();
        _showSnackBar(
          'Category successfully assigned to blog',
          icon: Icons.link,
        );

        // Reset selected blog dan refresh data
        setState(() {
          _selectedBlog = null;
        });
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage =
              'Failed to assign category to blog: ${response['message']}';
        });
        _showSnackBar(
          'Failed to set category: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to assign category to blog: $e';
      });
      _showSnackBar(
        'Failed to set category: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _addBlog(String title, String content, File image) async {
    try {
      final response = await _blogController.addBlog(
        title,
        content,
        image.path,
        [],
      );
      if (response['success']) {
        Navigator.of(context).pop();
        _showSnackBar(
          'Blog "$title" added successfully',
          icon: Icons.check_circle,
        );
        _blogTitleController.clear();
        _blogContentController.clear();
        setState(() {
          _blogImage = null;
        });

        // Refresh data setelah berhasil menambah blog
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage = 'Failed to add blog: ${response['message']}';
        });
        _showSnackBar(
          'Failed to add blog: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to add blog: $e';
      });
      _showSnackBar(
        'Failed to add blog: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _editBlog(
      int id, String title, String content, File? image) async {
    final confirmed = await _showConfirmationDialog(
      title: 'Confirm Edit',
      content: 'Are you sure you want to change your blog? "$title"?',
      confirmText: 'Edit',
      confirmColor: darkWarning,
      icon: Icons.edit,
    );

    if (!confirmed) return;

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
        Navigator.of(context).pop();
        _showSnackBar(
          'Blog "$title" updated successfully',
          icon: Icons.check_circle,
        );

        // Refresh data setelah berhasil edit blog
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage = 'Failed to edit blog: ${response['message']}';
        });
        _showSnackBar(
          'Failed to change blog: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to edit blog: $e';
      });
      _showSnackBar(
        'Failed to change blog: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _deleteBlog(int id) async {
    final blog = _blogs.firstWhere((blog) => blog.id == id);
    final confirmed = await _showConfirmationDialog(
      title: 'Konfirmasi Hapus',
      content:
          'Apakah Anda yakin ingin menghapus blog "${blog.title}"? This action cannot be undone.',
      confirmText: 'Hapus',
      confirmColor: darkError,
      icon: Icons.delete_forever,
    );

    if (!confirmed) return;

    try {
      final response = await _blogController.deleteBlog(id);
      if (response['success']) {
        _showSnackBar(
          'Blog "${blog.title}" deleted successfully',
          backgroundColor: darkError,
          icon: Icons.delete,
        );

        // Refresh data setelah berhasil hapus blog
        await _refreshAllData();
      } else {
        setState(() {
          _errorMessage = 'Failed to delete blog: ${response['message']}';
        });
        _showSnackBar(
          'Failed to delete blog: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to delete blog: $e';
      });
      _showSnackBar(
        'Failed to delete blog: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    setState(() {
      if (pickedFile != null) {
        _blogImage = File(pickedFile.path);
        _showSnackBar(
          'Image selected successfully',
          icon: Icons.image,
        );
      } else {
        _showSnackBar(
          'No images selected',
          backgroundColor: darkWarning,
          icon: Icons.warning,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Blog Management',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 22,
          ),
        ),
        backgroundColor:
            _userRole == 'Supervisor' ? Colors.deepOrange[400] : darkSecondary,
        elevation: 8,
        shadowColor: Colors.black26,
        // Hapus actions untuk memindahkan ke floating buttons
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(darkAccent),
              ),
            )
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Container(
                    margin: const EdgeInsets.all(20),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: darkSecondary,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: darkError),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.error, color: darkError, size: 48),
                        const SizedBox(height: 16),
                        Text(
                          _errorMessage,
                          style: const TextStyle(
                            color: darkText,
                            fontSize: 16,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                )
              : Stack(
                  children: [
                    Column(
                      children: [
                        _buildCategoryFilter(),
                        Expanded(
                          child: _blogs.isEmpty
                              ? Center(
                                  child: Container(
                                    padding: const EdgeInsets.all(32),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.article_outlined,
                                          size: 64,
                                          color: darkTextSecondary,
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          'Belum ada blog',
                                          style: TextStyle(
                                            fontSize: 18,
                                            color: darkTextSecondary,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Mulai dengan menambahkan blog pertama Anda',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: darkTextSecondary,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.all(8),
                                  itemCount: _blogs.length,
                                  itemBuilder: (context, index) {
                                    final blog = _blogs[index];
                                    return _buildBlogCard(blog);
                                  },
                                ),
                        ),
                      ],
                    ),
                    // Floating Action Buttons
                    _buildFloatingActionButtons(),
                  ],
                ),
    );
  }

  Widget _buildFloatingActionButtons() {
    // HILANGKAN SEMUA FAB JIKA SUPERVISOR
    if (_userRole == 'Supervisor') return const SizedBox.shrink();

    return Positioned(
      bottom: 20,
      right: 16,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_isFabExpanded) ...[
            // Tetapkan Kategori
            ScaleTransition(
              scale: _expandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Set Category',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "assign_category",
                      backgroundColor: Colors.purple,
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showAssignCategoryDialog();
                      },
                      child: const Icon(Icons.link, size: 20),
                    ),
                  ],
                ),
              ),
            ),
            // Daftar Kategori
            ScaleTransition(
              scale: _expandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Category List',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "list_category",
                      backgroundColor: darkWarning,
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showCategoryListDialog();
                      },
                      child: const Icon(Icons.list, size: 20),
                    ),
                  ],
                ),
              ),
            ),
            // Tambah Kategori
            ScaleTransition(
              scale: _expandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Add Category',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "add_category",
                      backgroundColor: darkInfo,
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showAddCategoryDialog();
                      },
                      child: const Icon(Icons.category, size: 20),
                    ),
                  ],
                ),
              ),
            ),
            // Tambah Blog
            ScaleTransition(
              scale: _expandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Add Blog',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "add_blog",
                      backgroundColor: darkAccent,
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showAddBlogDialog();
                      },
                      child: const Icon(Icons.add, size: 20),
                    ),
                  ],
                ),
              ),
            ),
          ],
          // Main FAB
          FloatingActionButton(
            heroTag: "main_fab",
            backgroundColor: _isFabExpanded ? Colors.grey[600] : darkSecondary,
            foregroundColor: Colors.white,
            elevation: 8,
            onPressed: _toggleFab,
            child: AnimatedRotation(
              duration: const Duration(milliseconds: 300),
              turns: _isFabExpanded ? 0.125 : 0.0, // 45 degree rotation
              child: Icon(
                _isFabExpanded ? Icons.close : Icons.menu,
                size: 28,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: darkSecondary,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: DropdownButtonFormField<String>(
        decoration: const InputDecoration(
          border: InputBorder.none,
          labelText: 'Filter by Category',
          labelStyle: TextStyle(color: darkTextSecondary),
          prefixIcon: Icon(Icons.filter_list, color: darkAccent),
        ),
        dropdownColor: darkSecondary,
        style: const TextStyle(color: darkText),
        value: _selectedCategoryId,
        items: [
          const DropdownMenuItem(
            value: null,
            child: Text(
              'All Categories',
              style: TextStyle(color: darkText),
            ),
          ),
          ..._categories.map((category) => DropdownMenuItem(
                value: category.id.toString(),
                child: Text(
                  category.name,
                  style: const TextStyle(color: darkText),
                ),
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

  void _navigateToBlogDetail(Blog blog) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BlogDetailView(
          userRole: _userRole,
          blog: blog,
          onBlogUpdated: () {
            // Refresh data when blog is updated
            _refreshAllData();
          },
        ),
      ),
    );
  }

  Widget _buildBlogCard(Blog blog) {
    return GestureDetector(
      onTap: () => _navigateToBlogDetail(blog),
      // HILANGKAN EDIT DARI LONG PRESS JIKA SUPERVISOR
      onLongPress:
          _userRole == 'Supervisor' ? null : () => _showEditBlogDialog(blog),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Card(
          color: darkSecondary,
          elevation: 8,
          shadowColor: Colors.black26,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Stack(
                    children: [
                      Image.network(
                        blog.photoUrl,
                        width: double.infinity,
                        height: 200,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 200,
                          decoration: BoxDecoration(
                            color: darkSurface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.broken_image,
                                  color: darkTextSecondary,
                                  size: 48,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Gagal memuat gambar',
                                  style: TextStyle(
                                    color: darkTextSecondary,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            DateFormat('dd MMM yyyy').format(blog.createdAt),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  blog.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: darkText,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _stripHtmlTags(blog.content),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    color: darkTextSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                // Categories section dengan tombol X
                if (blog.categories != null && blog.categories!.isNotEmpty)
                  Wrap(
                    spacing: 8.0,
                    runSpacing: 6.0,
                    children: blog.categories!.map((category) {
                      return Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              darkInfo.withOpacity(0.8),
                              darkInfo,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: darkInfo.withOpacity(0.3),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(
                                left: 12.0,
                                top: 6.0,
                                bottom: 6.0,
                                right: 4.0,
                              ),
                              child: Text(
                                category.name,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            // HILANGKAN TOMBOL X JIKA SUPERVISOR
                            if (_userRole != 'Supervisor')
                              InkWell(
                                onTap: () => _removeCategoryFromBlog(
                                  blog.id,
                                  category.id,
                                  category.name,
                                  blog.title,
                                ),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.all(4.0),
                                  margin: const EdgeInsets.only(right: 4.0),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.close,
                                    size: 14,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  )
                // ...existing code...
                else
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12.0,
                      vertical: 6.0,
                    ),
                    decoration: BoxDecoration(
                      color: darkSurface,
                      borderRadius: BorderRadius.circular(16),
                      border:
                          Border.all(color: darkTextSecondary.withOpacity(0.3)),
                    ),
                    child: Text(
                      'Tanpa Kategori',
                      style: TextStyle(
                        fontSize: 12,
                        color: darkTextSecondary,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.schedule,
                              size: 14,
                              color: darkTextSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Made: ${DateFormat('dd/MM/yyyy').format(blog.createdAt)}',
                              style: TextStyle(
                                fontSize: 11,
                                color: darkTextSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(
                              Icons.update,
                              size: 14,
                              color: darkTextSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Updated: ${DateFormat('dd/MM/yyyy').format(blog.updatedAt)}',
                              style: TextStyle(
                                fontSize: 11,
                                color: darkTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        // HILANGKAN TOMBOL EDIT DAN DELETE JIKA SUPERVISOR
                        if (_userRole != 'Supervisor') ...[
                          Container(
                            decoration: BoxDecoration(
                              color: darkWarning.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: IconButton(
                              icon: const Icon(
                                Icons.edit,
                                color: darkWarning,
                                size: 20,
                              ),
                              onPressed: () => _showEditBlogDialog(blog),
                              tooltip: 'Edit Blog',
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            decoration: BoxDecoration(
                              color: darkError.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: IconButton(
                              icon: const Icon(
                                Icons.delete,
                                color: darkError,
                                size: 20,
                              ),
                              onPressed: () => _deleteBlog(blog.id),
                              tooltip: 'Hapus Blog',
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAddBlogDialog() {
    if (_userRole == 'Supervisor') return;

    showDialog(
      context: context,
      builder: (context) {
        return Theme(
          data: _darkModalTheme,
          child: StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                backgroundColor: darkSecondary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: darkAccent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.add_circle,
                        color: darkAccent,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Add New Blog',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: darkText,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: _blogTitleController,
                        style: const TextStyle(color: darkText),
                        decoration: const InputDecoration(
                          labelText: 'Blog Title',
                          prefixIcon: Icon(Icons.title, color: darkAccent),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _blogContentController,
                        style: const TextStyle(color: darkText),
                        decoration: const InputDecoration(
                          labelText: 'Blog Content',
                          prefixIcon:
                              Icon(Icons.description, color: darkAccent),
                        ),
                        maxLines: 4,
                      ),
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: darkSurface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: darkAccent.withOpacity(0.3),
                          ),
                        ),
                        child: Column(
                          children: [
                            ElevatedButton.icon(
                              onPressed: () async {
                                await _pickImage();
                                setState(() {});
                              },
                              icon: const Icon(Icons.image),
                              label: const Text('Select Image'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: darkAccent,
                                foregroundColor: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _blogImage == null
                                ? Container(
                                    height: 120,
                                    decoration: BoxDecoration(
                                      color: darkSurface,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color:
                                            darkTextSecondary.withOpacity(0.3),
                                        style: BorderStyle.solid,
                                      ),
                                    ),
                                    child: Center(
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.image_not_supported,
                                            color: darkTextSecondary,
                                            size: 32,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'No images selected yet',
                                            style: TextStyle(
                                              color: darkTextSecondary,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                : ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.file(
                                      _blogImage!,
                                      height: 120,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      _blogTitleController.clear();
                      _blogContentController.clear();
                      setState(() {
                        _blogImage = null;
                      });
                    },
                    child: const Text('Close'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (_blogImage != null &&
                          _blogTitleController.text.isNotEmpty &&
                          _blogContentController.text.isNotEmpty) {
                        _addBlog(
                          _blogTitleController.text,
                          _blogContentController.text,
                          _blogImage!,
                        );
                      } else {
                        _showSnackBar(
                          'Please complete all fields and select an image.',
                          backgroundColor: darkWarning,
                          icon: Icons.warning,
                        );
                      }
                    },
                    child: const Text('Add'),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  void _showAddCategoryDialog() {
    if (_userRole == 'Supervisor') return;

    showDialog(
      context: context,
      builder: (context) {
        return Theme(
          data: _darkModalTheme,
          child: AlertDialog(
            backgroundColor: darkSecondary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: darkInfo.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.category,
                    color: darkInfo,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Add New Category',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: darkText,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _categoryNameController,
                  style: const TextStyle(color: darkText),
                  decoration: const InputDecoration(
                    labelText: 'Nama Kategori',
                    prefixIcon: Icon(Icons.label, color: darkInfo),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _categoryDescriptionController,
                  style: const TextStyle(color: darkText),
                  decoration: const InputDecoration(
                    labelText: 'Category Description',
                    prefixIcon: Icon(Icons.description, color: darkInfo),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  _categoryNameController.clear();
                  _categoryDescriptionController.clear();
                },
                child: const Text('Batal'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (_categoryNameController.text.isNotEmpty &&
                      _categoryDescriptionController.text.isNotEmpty) {
                    _addCategory(
                      _categoryNameController.text,
                      _categoryDescriptionController.text,
                    );
                  } else {
                    _showSnackBar(
                      'Please complete all fields',
                      backgroundColor: darkWarning,
                      icon: Icons.warning,
                    );
                  }
                },
                child: const Text('Tambah'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showCategoryListDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return Theme(
          data: _darkModalTheme,
          child: AlertDialog(
            backgroundColor: darkSecondary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: darkWarning.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.list,
                    color: darkWarning,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Category List',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: darkText,
                      fontSize: 18,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            content: SizedBox(
              width: double.maxFinite,
              height:
                  MediaQuery.of(context).size.height * 0.6, // Responsive height
              child: _categories.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.category_outlined,
                            size: 48,
                            color: darkTextSecondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'There are no categories yet',
                            style: TextStyle(
                              color: darkTextSecondary,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemCount: _categories.length,
                      itemBuilder: (context, index) {
                        final category = _categories[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: darkSurface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: darkAccent.withOpacity(0.2),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Header section dengan icon dan nama kategori
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: darkAccent.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(
                                        Icons.folder,
                                        color: darkAccent,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            category.name,
                                            style: const TextStyle(
                                              color: darkText,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 16,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'ID: ${category.id}',
                                            style: TextStyle(
                                              color: darkTextSecondary,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Description section
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: darkPrimary.withOpacity(0.3),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.description,
                                            color: darkTextSecondary,
                                            size: 16,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            'Description:',
                                            style: TextStyle(
                                              color: darkTextSecondary,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        category.description,
                                        style: TextStyle(
                                          color: darkText,
                                          fontSize: 14,
                                          height: 1.4,
                                        ),
                                        textAlign: TextAlign.justify,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),

                                // Action buttons section
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    // Edit button
                                    Container(
                                      decoration: BoxDecoration(
                                        color: darkWarning.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Material(
                                        color: Colors.transparent,
                                        child: InkWell(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          onTap: () =>
                                              _showEditCategoryDialog(category),
                                          child: Padding(
                                            padding: const EdgeInsets.all(8.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.edit,
                                                  color: darkWarning,
                                                  size: 18,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  'Edit',
                                                  style: TextStyle(
                                                    color: darkWarning,
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),

                                    // Delete button
                                    Container(
                                      decoration: BoxDecoration(
                                        color: darkError.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Material(
                                        color: Colors.transparent,
                                        child: InkWell(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          onTap: () =>
                                              _deleteCategory(category.id),
                                          child: Padding(
                                            padding: const EdgeInsets.all(8.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.delete,
                                                  color: darkError,
                                                  size: 18,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  'Delete',
                                                  style: TextStyle(
                                                    color: darkError,
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
            actions: [
              Container(
                width: double.infinity,
                child: Row(
                  children: [
                    // Info jumlah kategori
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: darkInfo.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.info_outline,
                              color: darkInfo,
                              size: 16,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Total: ${_categories.length} category',
                                style: TextStyle(
                                  color: darkInfo,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Close button
                    ElevatedButton.icon(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close, size: 18),
                      label: const Text('Tutup'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: darkAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showEditCategoryDialog(Category category) {
    final editNameController = TextEditingController(text: category.name);
    final editDescriptionController =
        TextEditingController(text: category.description);

    showDialog(
      context: context,
      builder: (context) {
        return Theme(
          data: _darkModalTheme,
          child: AlertDialog(
            backgroundColor: darkSecondary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: darkWarning.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.edit,
                    color: darkWarning,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Edit Kategori',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: darkText,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: editNameController,
                  style: const TextStyle(color: darkText),
                  decoration: const InputDecoration(
                    labelText: 'Nama Kategori',
                    prefixIcon: Icon(Icons.label, color: darkWarning),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: editDescriptionController,
                  style: const TextStyle(color: darkText),
                  decoration: const InputDecoration(
                    labelText: 'Category Description',
                    prefixIcon: Icon(Icons.description, color: darkWarning),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).pop(); // Close category list dialog too
                },
                child: const Text('Batal'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: darkWarning,
                ),
                onPressed: () {
                  if (editNameController.text.isNotEmpty &&
                      editDescriptionController.text.isNotEmpty) {
                    _editCategory(
                      category.id,
                      editNameController.text,
                      editDescriptionController.text,
                    );
                    Navigator.of(context).pop(); // Close edit dialog
                  } else {
                    _showSnackBar(
                      'Please complete all fields',
                      backgroundColor: darkWarning,
                      icon: Icons.warning,
                    );
                  }
                },
                child: const Text('Save'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAssignCategoryDialog() {
    Category? selectedCategory;

    showDialog(
      context: context,
      builder: (context) {
        return Theme(
          data: _darkModalTheme,
          child: StatefulBuilder(
            builder: (context, setState) {
              // Filter kategori yang belum dimiliki oleh blog yang dipilih
              List<Category> availableCategories =
                  _categories.where((category) {
                if (_selectedBlog == null) return true;

                // Jika blog tidak memiliki kategori, tampilkan semua kategori
                if (_selectedBlog!.categories == null ||
                    _selectedBlog!.categories!.isEmpty) {
                  return true;
                }

                // Periksa apakah kategori sudah ada di blog yang dipilih
                bool isAlreadyAssigned = _selectedBlog!.categories!
                    .any((blogCategory) => blogCategory.id == category.id);

                return !isAlreadyAssigned; // Hanya tampilkan yang belum assigned
              }).toList();

              return AlertDialog(
                backgroundColor: darkSecondary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.purple.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.link,
                        color: Colors.purple,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: const Text(
                        'Assign Category to Blog',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: darkText,
                          fontSize: 18,
                        ),
                      ),
                    ),
                  ],
                ),
                content: SizedBox(
                  width: double.maxFinite,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      DropdownButtonFormField<Blog>(
                        decoration: const InputDecoration(
                          labelText: 'Select Blogs',
                          prefixIcon: Icon(Icons.article, color: Colors.purple),
                        ),
                        dropdownColor: darkSurface,
                        style: const TextStyle(color: darkText),
                        value: _selectedBlog,
                        isExpanded: true,
                        items: _blogs.map((blog) {
                          return DropdownMenuItem<Blog>(
                            value: blog,
                            child: Container(
                              width: double.infinity,
                              child: Text(
                                blog.title,
                                style: const TextStyle(color: darkText),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 2,
                                softWrap: true,
                              ),
                            ),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedBlog = value;
                            selectedCategory =
                                null; // Reset kategori yang dipilih
                          });
                        },
                        selectedItemBuilder: (BuildContext context) {
                          return _blogs.map<Widget>((Blog blog) {
                            return Container(
                              width: double.infinity,
                              alignment: Alignment.centerLeft,
                              child: Text(
                                blog.title,
                                style: const TextStyle(color: darkText),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                              ),
                            );
                          }).toList();
                        },
                      ),
                      const SizedBox(height: 16),
                      // Tampilkan informasi kategori yang sudah dimiliki blog
                      if (_selectedBlog != null &&
                          _selectedBlog!.categories != null &&
                          _selectedBlog!.categories!.isNotEmpty) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: darkSurface.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: darkInfo.withOpacity(0.3),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.info_outline,
                                      color: darkInfo, size: 16),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Categories you already own:',
                                    style: TextStyle(
                                      color: darkInfo,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children:
                                    _selectedBlog!.categories!.map((category) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: darkInfo.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: darkInfo.withOpacity(0.5),
                                      ),
                                    ),
                                    child: Text(
                                      category.name,
                                      style: TextStyle(
                                        color: darkInfo,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      // Dropdown untuk kategori yang tersedia
                      DropdownButtonFormField<Category>(
                        decoration: const InputDecoration(
                          labelText: 'Select Category',
                          prefixIcon:
                              Icon(Icons.category, color: Colors.purple),
                        ),
                        dropdownColor: darkSurface,
                        style: const TextStyle(color: darkText),
                        value: selectedCategory,
                        isExpanded: true,
                        items: availableCategories.isEmpty
                            ? [
                                DropdownMenuItem<Category>(
                                  value: null,
                                  enabled: false,
                                  child: Container(
                                    width: double.infinity,
                                    child: Text(
                                      _selectedBlog == null
                                          ? 'Choose a blog first'
                                          : 'All categories have been defined',
                                      style: TextStyle(
                                        color: darkTextSecondary,
                                        fontStyle: FontStyle.italic,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  ),
                                ),
                              ]
                            : availableCategories.map((category) {
                                return DropdownMenuItem<Category>(
                                  value: category,
                                  child: Container(
                                    width: double.infinity,
                                    child: Text(
                                      category.name,
                                      style: const TextStyle(color: darkText),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  ),
                                );
                              }).toList(),
                        onChanged: availableCategories.isEmpty
                            ? null
                            : (value) {
                                setState(() {
                                  selectedCategory = value;
                                });
                              },
                        selectedItemBuilder: availableCategories.isEmpty
                            ? null
                            : (BuildContext context) {
                                return availableCategories
                                    .map<Widget>((Category category) {
                                  return Container(
                                    width: double.infinity,
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      category.name,
                                      style: const TextStyle(color: darkText),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  );
                                }).toList();
                              },
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      setState(() {
                        _selectedBlog = null;
                      });
                    },
                    child: const Text('Cancel'),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                    ),
                    onPressed: (_selectedBlog != null &&
                            selectedCategory != null &&
                            availableCategories.isNotEmpty)
                        ? () {
                            _assignCategoryToBlog(
                                _selectedBlog!.id, selectedCategory!.id);
                            setState(() {
                              _selectedBlog = null;
                            });
                          }
                        : null, // Disable button jika tidak ada kategori yang tersedia
                    child: const Text(
                      'Set',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  // ...existing code...

  void _showEditBlogDialog(Blog blog) {
    final editTitleController = TextEditingController(text: blog.title);
    // Strip HTML tags dari content sebelum ditampilkan di editor
    final editContentController =
        TextEditingController(text: _stripHtmlTags(blog.content));
    File? editBlogImage;

    showDialog(
      context: context,
      builder: (context) {
        return Theme(
          data: _darkModalTheme,
          child: StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                backgroundColor: darkSecondary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: darkWarning.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.edit,
                        color: darkWarning,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Edit Blog',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: darkText,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
                content: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.9,
                  height: MediaQuery.of(context).size.height * 0.7,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Title Field
                        TextField(
                          controller: editTitleController,
                          style: const TextStyle(color: darkText),
                          decoration: InputDecoration(
                            labelText: 'Blog Title',
                            labelStyle:
                                const TextStyle(color: darkTextSecondary),
                            prefixIcon:
                                const Icon(Icons.title, color: darkWarning),
                            filled: true,
                            fillColor: darkSurface,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: darkSurface),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: darkSurface),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                  color: darkWarning, width: 2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Content Field - Enhanced for long text
                        Container(
                          height: 300, // Fixed height for better scrolling
                          decoration: BoxDecoration(
                            color: darkSurface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: darkSurface),
                          ),
                          child: TextField(
                            controller: editContentController,
                            style: const TextStyle(
                              color: darkText,
                              fontSize: 14,
                              height: 1.5,
                            ),
                            decoration: InputDecoration(
                              labelText: 'Blog Content',
                              labelStyle:
                                  const TextStyle(color: darkTextSecondary),
                              prefixIcon: const Padding(
                                padding: EdgeInsets.only(bottom: 250),
                                child:
                                    Icon(Icons.description, color: darkWarning),
                              ),
                              filled: true,
                              fillColor: darkSurface,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    const BorderSide(color: darkSurface),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    const BorderSide(color: darkSurface),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                    color: darkWarning, width: 2),
                              ),
                              contentPadding: const EdgeInsets.all(16),
                              alignLabelWithHint: true,
                              hintText:
                                  'Write your Blog Content here...\n\nYou can write long texts with multiple paragraphs.',
                              hintStyle: const TextStyle(
                                color: darkTextSecondary,
                                fontSize: 13,
                                height: 1.4,
                              ),
                            ),
                            maxLines: null, // Unlimited lines
                            expands: true, // Fill available space
                            textAlignVertical: TextAlignVertical.top,
                            keyboardType: TextInputType.multiline,
                            textInputAction: TextInputAction.newline,
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Real-time character count indicator
                        StreamBuilder(
                          stream: Stream.periodic(
                              const Duration(milliseconds: 100)),
                          builder: (context, snapshot) {
                            return Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: darkSurface.withOpacity(0.5),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Character: ${editContentController.text.length}',
                                style: const TextStyle(
                                  color: darkTextSecondary,
                                  fontSize: 12,
                                ),
                                textAlign: TextAlign.right,
                              ),
                            );
                          },
                        ),

                        const SizedBox(height: 16),

                        // Image Section
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: darkSurface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: darkWarning.withOpacity(0.3),
                            ),
                          ),
                          child: Column(
                            children: [
                              ElevatedButton.icon(
                                onPressed: () async {
                                  final pickedFile = await ImagePicker()
                                      .pickImage(source: ImageSource.gallery);
                                  setState(() {
                                    if (pickedFile != null) {
                                      editBlogImage = File(pickedFile.path);
                                      _showSnackBar(
                                        'A new image is selected',
                                        icon: Icons.image,
                                      );
                                    }
                                  });
                                },
                                icon: const Icon(Icons.image),
                                label: const Text('Select New Image'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: darkWarning,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 12),
                              editBlogImage == null
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        blog.photoUrl,
                                        height: 120,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                Container(
                                          height: 120,
                                          decoration: BoxDecoration(
                                            color: darkSurface,
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: const Center(
                                            child: Text(
                                              'Image cannot be loaded',
                                              style: TextStyle(
                                                color: darkTextSecondary,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    )
                                  : ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.file(
                                        editBlogImage!,
                                        height: 120,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Close',
                        style: TextStyle(color: darkTextSecondary)),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: darkWarning,
                    ),
                    onPressed: () {
                      if (editTitleController.text.trim().isNotEmpty &&
                          editContentController.text.trim().isNotEmpty) {
                        Navigator.of(context).pop(); // Close dialog first
                        _editBlog(
                          blog.id,
                          editTitleController.text.trim(),
                          editContentController.text
                              .trim(), // Clean text without HTML
                          editBlogImage,
                        );
                      } else {
                        _showSnackBar(
                          'Please complete all fields',
                          backgroundColor: darkWarning,
                          icon: Icons.warning,
                        );
                      }
                    },
                    child: const Text('Save'),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  // Enhanced HTML stripping function - update jika belum ada
  String _stripHtmlTags(String htmlString) {
    if (htmlString.isEmpty) return htmlString;

    // Remove HTML tags
    RegExp exp = RegExp(r"<[^>]*>", multiLine: true, caseSensitive: true);
    String result = htmlString.replaceAll(exp, '');

    // Decode HTML entities
    result = result
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&apos;', "'");

    // Clean up extra whitespace while preserving paragraph breaks
    result = result
        .replaceAll(
            RegExp(r'\n\s*\n\s*\n'), '\n\n') // Multiple line breaks to double
        .replaceAll(
            RegExp(r'[ \t]+'), ' ') // Multiple spaces/tabs to single space
        .trim();

    return result;
  }

  // ...existing code...
}

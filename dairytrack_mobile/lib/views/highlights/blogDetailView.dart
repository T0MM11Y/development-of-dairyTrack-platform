import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL1/blogManagementController.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class BlogDetailView extends StatefulWidget {
  final Blog blog;
  final VoidCallback? onBlogUpdated;
  final String? userRole; // Tambahkan parameter userRole opsional

  const BlogDetailView({
    Key? key,
    required this.blog,
    this.onBlogUpdated,
    this.userRole, // Tambahkan ke konstruktor
  }) : super(key: key);

  @override
  _BlogDetailViewState createState() => _BlogDetailViewState();
}

class _BlogDetailViewState extends State<BlogDetailView> {
  final BlogManagementController _blogController = BlogManagementController();
  bool get _isSupervisor =>
      widget.userRole == 'Supervisor'; // Helper untuk pengecekan role

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
            return AlertDialog(
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
                  child: const Text('Canceled'),
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
            );
          },
        ) ??
        false;
  }

  Future<void> _editBlog(
      int id, String title, String content, File? image) async {
    final confirmed = await _showConfirmationDialog(
      title: 'updated successfully',
      content: 'Apakah Anda yakin ingin mengubah blog "$title"?',
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
        _showSnackBar(
          'Blog "$title" updated successfully',
          icon: Icons.check_circle,
        );

        // Callback untuk refresh data di halaman sebelumnya
        if (widget.onBlogUpdated != null) {
          widget.onBlogUpdated!();
        }

        // Kembali ke halaman sebelumnya
        Navigator.of(context).pop();
      } else {
        _showSnackBar(
          'Failed to change blog: ${response['message']}',
          backgroundColor: darkError,
          icon: Icons.error,
        );
      }
    } catch (e) {
      _showSnackBar(
        'Failed to change blog: $e',
        backgroundColor: darkError,
        icon: Icons.error,
      );
    }
  }

  // ...existing code...

  void _showEditBlogDialog() {
    final editTitleController = TextEditingController(text: widget.blog.title);
    // Strip HTML tags dari content sebelum ditampilkan di editor
    final editContentController =
        TextEditingController(text: _stripHtmlTags(widget.blog.content));
    File? editBlogImage;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
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
                          labelStyle: const TextStyle(color: darkTextSecondary),
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
                            borderSide:
                                const BorderSide(color: darkWarning, width: 2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Content Field - Enhanced for long text (FIXED)
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
                            contentPadding: const EdgeInsets.all(16),
                            alignLabelWithHint: true,
                            hintText:
                                'Tulis konten blog Anda di sini...\n\nYou can write long texts with multiple paragraphs.',
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
                          // REMOVED minLines because it conflicts with expands: true
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Real-time character count indicator
                      StreamBuilder(
                        stream:
                            Stream.periodic(const Duration(milliseconds: 100)),
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
                              'Karakter: ${editContentController.text.length}',
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
                                      'Gambar baru dipilih',
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
                                      widget.blog.photoUrl,
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
                  child: const Text('Cancel',
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
                        widget.blog.id,
                        editTitleController.text.trim(),
                        editContentController.text.trim(),
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
                  child:
                      const Text('Save', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // Enhanced HTML stripping function
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkPrimary,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          "Blog Details",
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 20,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: _isSupervisor
            ? Colors.deepOrange[400]
            : Color(0xFF2D2D2D), // Warna berbeda untuk supervisor
        elevation: 8,
        shadowColor: Colors.black26,
        actions: [
          // Sembunyikan tombol edit jika supervisor
          if (!_isSupervisor)
            IconButton(
              icon: const Icon(Icons.edit, color: darkWarning),
              onPressed: _showEditBlogDialog,
              tooltip: 'Edit Blog',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Blog Image dengan aspect ratio yang lebih baik
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  widget.blog.photoUrl,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    decoration: BoxDecoration(
                      color: darkSurface,
                      borderRadius: BorderRadius.circular(16),
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
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Blog Title
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: darkSecondary,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Text(
                widget.blog.title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: darkText,
                  height: 1.4,
                ),
                textAlign: TextAlign.justify,
              ),
            ),
            const SizedBox(height: 24),

            // Blog Metadata dengan design yang lebih clean
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: darkSurface.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: darkTextSecondary.withOpacity(0.2),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: darkInfo.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(
                          Icons.schedule,
                          size: 16,
                          color: darkInfo,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Made',
                              style: TextStyle(
                                fontSize: 12,
                                color: darkTextSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              DateFormat('EEEE, dd MMMM yyyy • HH:mm')
                                  .format(widget.blog.createdAt),
                              style: const TextStyle(
                                fontSize: 14,
                                color: darkText,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 1,
                    color: darkTextSecondary.withOpacity(0.2),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: darkWarning.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(
                          Icons.update,
                          size: 16,
                          color: darkWarning,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Last updated',
                              style: TextStyle(
                                fontSize: 12,
                                color: darkTextSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              DateFormat('EEEE, dd MMMM yyyy • HH:mm')
                                  .format(widget.blog.updatedAt),
                              style: const TextStyle(
                                fontSize: 14,
                                color: darkText,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Blog Content dengan typography yang lebih baik
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: darkAccent.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.article_outlined,
                          color: darkAccent,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Article Content',
                        style: TextStyle(
                          color: darkAccent,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  SelectableText(
                    _stripHtmlTags(widget.blog.content),
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.black87,
                      height: 1.8,
                      letterSpacing: 0.3,
                      fontWeight: FontWeight.w400,
                    ),
                    textAlign: TextAlign.justify,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Categories Section dengan design yang lebih menarik
            if (widget.blog.categories != null &&
                widget.blog.categories!.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      darkInfo.withOpacity(0.1),
                      darkInfo.withOpacity(0.05),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: darkInfo.withOpacity(0.2),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: darkInfo.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            Icons.local_offer,
                            color: darkInfo,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Article Category',
                          style: TextStyle(
                            color: darkInfo,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: darkInfo.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${widget.blog.categories!.length} category',
                            style: TextStyle(
                              color: darkInfo,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 12.0,
                      runSpacing: 12.0,
                      children: widget.blog.categories!.map((category) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                darkInfo,
                                darkInfo.withOpacity(0.8),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: darkInfo.withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.tag,
                                size: 14,
                                color: Colors.white,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                category.name,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ] else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: darkSurface.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: darkTextSecondary.withOpacity(0.2),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.label_off,
                      color: darkTextSecondary,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Artikel ini belum memiliki kategori',
                      style: TextStyle(
                        color: darkTextSecondary,
                        fontSize: 14,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),
      // Floating Action Button untuk Edit
      // Sembunyikan FAB jika supervisor
      floatingActionButton: !_isSupervisor
          ? FloatingActionButton.extended(
              onPressed: _showEditBlogDialog,
              backgroundColor: darkWarning,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.edit),
              label: const Text('Edit Blog'),
              elevation: 8,
            )
          : null,
    );
  }
}

import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/model/peternakan/blog.dart';
import 'package:dairy_track/config/api/peternakan/blog.dart';
import 'package:dairy_track/config/api/peternakan/topicBlog.dart';
import 'package:image_picker/image_picker.dart';

class EditBlog extends StatefulWidget {
  final Blog blog; // Parameter untuk menerima data blog yang akan diedit

  const EditBlog({Key? key, required this.blog}) : super(key: key);

  @override
  State<EditBlog> createState() => _EditBlogState();
}

class _EditBlogState extends State<EditBlog> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  File? _photoFile;
  int? _selectedTopicId;
  List<dynamic> _topics = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchTopics();
    _initializeForm(); // Inisialisasi form dengan data blog yang diterima
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _initializeForm() {
    _titleController.text = widget.blog.title;
    _descriptionController.text = widget.blog.description;
    _selectedTopicId = widget.blog.topicId;
  }

  Future<void> _fetchTopics() async {
    try {
      final topics = await getTopicBlogs();
      setState(() {
        _topics = topics;
      });
    } catch (e) {
      _showErrorDialog('Failed to fetch topics: ${e.toString()}');
    }
  }

  Future<void> _submitBlog() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Tampilkan indikator loading
    showDialog(
      context: context,
      barrierDismissible: false, // Mencegah dialog ditutup secara manual
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    try {
      final blog = Blog(
          id: widget.blog.id, // Pastikan ID blog disertakan
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          topicId: _selectedTopicId,
          updatedAt: DateTime.now(),
          createdAt: DateTime.now());

      // Panggil fungsi updateBlog untuk memperbarui data
      await updateBlog(
        widget.blog.id.toString(),
        blog,
        _photoFile,
      );

      // Tutup indikator loading setelah respons diterima
      Navigator.of(context).pop();

      // Tampilkan dialog sukses
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Berhasil'),
            ],
          ),
          content: const Text(
            'Blog berhasil diperbarui.',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Tutup dialog
                Navigator.pushReplacementNamed(context, '/all-blog');
              },
              child: const Text(
                'OK',
                style: TextStyle(color: Colors.green),
              ),
            ),
          ],
        ),
      );
    } catch (e) {
      // Tutup indikator loading jika terjadi error
      Navigator.of(context).pop();

      // Tampilkan dialog error
      _showErrorDialog('Failed to update blog: $e');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error, color: Colors.red),
            SizedBox(width: 8),
            Text('Error'),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 80,
      );

      if (pickedFile != null) {
        setState(() {
          _photoFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      _showErrorDialog('Failed to pick image: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Edit Blog',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: const Color(0xFF5D90E7),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFFE8F5E9), Colors.white],
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: ListView(
                    children: [
                      _buildTextFormField(
                        controller: _titleController,
                        label: 'Title',
                        hint: 'Enter blog title',
                        icon: Icons.title,
                        isRequired: true,
                      ),
                      const SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _descriptionController,
                        label: 'Description',
                        hint: 'Enter blog description',
                        icon: Icons.description,
                        isRequired: true,
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      _buildTopicDropdown(),
                      const SizedBox(height: 12),
                      _buildPhotoPicker(),
                      const SizedBox(height: 24),
                      _buildSubmitButton(),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool isRequired = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: const BorderSide(color: Color(0xFF5D90E7), width: 2.0),
        ),
        contentPadding:
            const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      maxLines: maxLines,
      validator: isRequired
          ? (value) =>
              value?.trim().isEmpty ?? true ? 'This field is required' : null
          : null,
    );
  }

  Widget _buildTopicDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Topic',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<int>(
          value: _selectedTopicId,
          items: _topics.map((topic) {
            return DropdownMenuItem<int>(
              value: topic.id,
              child: Text(topic.topic),
            );
          }).toList(),
          onChanged: (value) {
            setState(() {
              _selectedTopicId = value;
            });
          },
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            contentPadding:
                const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            filled: true,
            fillColor: Colors.grey.shade50,
          ),
          validator: (value) => value == null ? 'Please select a topic' : null,
        ),
      ],
    );
  }

  Widget _buildPhotoPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Photo',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _pickImage,
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8.0),
              color: Colors.grey.shade200,
            ),
            child: _photoFile == null
                ? (widget.blog.photo != null && widget.blog.photo!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8.0),
                        child: Image.network(
                          '$BASE_URL/${widget.blog.photo!}', // Akses gambar dari URL
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                            color: Colors.grey[200],
                            child: const Icon(Icons.broken_image,
                                color: Colors.grey),
                          ),
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.add_a_photo,
                            size: 50, color: Colors.grey)))
                : ClipRRect(
                    borderRadius: BorderRadius.circular(8.0),
                    child: Image.file(_photoFile!, fit: BoxFit.cover),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF5D90E7),
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),
      onPressed: _isLoading ? null : _submitBlog,
      child: const Text(
        'Update Blog',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}

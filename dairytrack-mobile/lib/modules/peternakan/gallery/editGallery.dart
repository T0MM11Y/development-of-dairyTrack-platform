import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dairy_track/model/peternakan/gallery.dart';
import 'package:dairy_track/config/api/peternakan/gallery.dart';

class EditGallery extends StatefulWidget {
  final Gallery gallery;

  const EditGallery({Key? key, required this.gallery}) : super(key: key);

  @override
  State<EditGallery> createState() => _EditGalleryState();
}

class _EditGalleryState extends State<EditGallery> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  File? _photoFile;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _titleController.text = widget.gallery.tittle;
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
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

  Future<void> _submitGallery() async {
    if (_formKey.currentState?.validate() != true) {
      _showErrorDialog('Please fill all fields.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final updatedGallery = Gallery(
        photo: widget
            .gallery.photo, // Use existing photo if no new photo is selected
        tittle: _titleController.text.trim(),
        createdAt: widget.gallery.createdAt,
        updatedAt: DateTime.now(),
      );

      await updateGallery(
          widget.gallery.id.toString(), updatedGallery, _photoFile);

      _showSuccessDialog();
    } catch (e) {
      _showErrorDialog('Failed to update gallery: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Success'),
          ],
        ),
        content: const Text('Gallery updated successfully.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.pop(context, true); // Return true to indicate success
            },
            child: const Text('OK', style: TextStyle(color: Colors.green)),
          ),
        ],
      ),
    );
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Edit Gallery',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: const Color(0xFF5D90E7),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: ListView(
                  children: [
                    TextFormField(
                      controller: _titleController,
                      decoration: InputDecoration(
                        labelText: 'Title',
                        hintText: 'Enter gallery title',
                        prefixIcon:
                            const Icon(Icons.title, color: Color(0xFF5D90E7)),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                          borderSide: const BorderSide(
                              color: Color(0xFF5D90E7), width: 2.0),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 12, horizontal: 16),
                        filled: true,
                        fillColor: Colors.grey.shade50,
                      ),
                      validator: (value) => value?.trim().isEmpty ?? true
                          ? 'This field is required'
                          : null,
                    ),
                    const SizedBox(height: 12),
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
                            ? widget.gallery.photo.isNotEmpty
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(8.0),
                                    child: Image.network(
                                      '$BASE_URL/${widget.gallery.photo}',
                                      fit: BoxFit.cover,
                                    ),
                                  )
                                : const Center(
                                    child: Icon(Icons.add_a_photo,
                                        size: 50, color: Colors.grey))
                            : ClipRRect(
                                borderRadius: BorderRadius.circular(8.0),
                                child:
                                    Image.file(_photoFile!, fit: BoxFit.cover),
                              ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5D90E7),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                      ),
                      onPressed: _isLoading ? null : _submitGallery,
                      child: const Text(
                        'Update Gallery',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

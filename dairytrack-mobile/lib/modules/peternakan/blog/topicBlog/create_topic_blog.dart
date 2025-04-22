import 'package:dairy_track/model/peternakan/topicblog.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/peternakan/topicBlog.dart';

class CreateTopicBlog extends StatefulWidget {
  const CreateTopicBlog({Key? key}) : super(key: key);

  @override
  State<CreateTopicBlog> createState() => _CreateTopicBlogState();
}

class _CreateTopicBlogState extends State<CreateTopicBlog> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  bool _isLoading = false;
  late Future<List<TopicBlog>> _topicBlogsFuture;

  @override
  void initState() {
    super.initState();
    _loadTopicBlogs();
  }

  void _loadTopicBlogs() {
    setState(() {
      _topicBlogsFuture = getTopicBlogs();
    });
  }

  Future<void> _deleteTopic(String id) async {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete Topic?', style: TextStyle(color: Colors.red[700])),
        content: const Text('Are you sure you want to delete this topic?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            onPressed: () async {
              Navigator.pop(context); // Close the dialog
              try {
                await deleteTopicBlog(id);
                _loadTopicBlogs(); // Reload the list after deletion
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Topic deleted successfully')),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Failed to delete topic: $e')),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _submitTopic() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final data = {
        'topic': _nameController.text
            .trim(), // Changed from 'name' to 'topic' to match API
      };

      await createTopicBlog(data);
      _nameController.clear();
      _loadTopicBlogs(); // Refresh the list after creation

      // Show success dialog
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
          content: const Text('Topic blog created successfully.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('OK', style: TextStyle(color: Colors.green)),
            ),
          ],
        ),
      );
    } catch (e) {
      // Show error dialog
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
          content: Text('Failed to create topic blog: $e'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Topic Blogs'),
        centerTitle: true,
        backgroundColor: const Color(0xFF5D90E7),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Form for creating new topic
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      _buildTextFormField(
                        controller: _nameController,
                        label: 'Topic Name',
                        hint: 'Enter topic name',
                        icon: Icons.topic,
                        isRequired: true,
                      ),
                      const SizedBox(height: 20),
                      _buildSubmitButton(),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            // List of existing topics
            FutureBuilder<List<TopicBlog>>(
              future: _topicBlogsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No topics available.'));
                }

                final topics = snapshot.data!;
                return Wrap(
                  spacing: 8.0,
                  runSpacing: 8.0,
                  children: topics.map((topic) {
                    return Chip(
                      label: Text(topic.topic),
                      backgroundColor: const Color(0xFFE8F5E9),
                      deleteIcon: const Icon(Icons.close, color: Colors.red),
                      onDeleted: () => _deleteTopic(topic.id.toString()),
                    );
                  }).toList(),
                );
              },
            ),
          ],
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

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF5D90E7),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
        onPressed: _isLoading ? null : _submitTopic,
        child: _isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : const Text(
                'Create Topic',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
      ),
    );
  }
}

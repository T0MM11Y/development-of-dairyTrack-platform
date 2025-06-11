import 'package:flutter/material.dart';
import '../model/feedType.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedTypeController.dart';

class AddFeedTypeForm extends StatefulWidget {
  final FeedTypeManagementController controller;
  final int userId;
  final Function(FeedType) onAdd;
  final Function(String) onError;

  const AddFeedTypeForm({
    Key? key,
    required this.controller,
    required this.userId,
    required this.onAdd,
    required this.onError,
  }) : super(key: key);

  @override
  _AddFeedTypeFormState createState() => _AddFeedTypeFormState();
}

class _AddFeedTypeFormState extends State<AddFeedTypeForm> {
  final _formKey = GlobalKey<FormState>();
  String name = '';
  bool _isLoading = false;

  Future<bool> _showConfirmationDialog({
    required String title,
    required String message,
  }) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              colors: [Colors.teal.shade50, Colors.white],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.info,
                color: Colors.teal,
                size: 50,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.black87),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      "Cancel",
                      style: TextStyle(color: Colors.black87),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      "Confirm",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ) ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Add New Feed Type",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Name',
                  hintText: 'Enter feed type name',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.text_fields, color: Colors.teal),
                  filled: true,
                  fillColor: Colors.teal.shade50,
                ),
                validator: (value) => value == null || value.isEmpty
                    ? 'Please enter the feed type name'
                    : null,
                onChanged: (value) => name = value,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _isLoading
                      ? null
                      : () async {
                          if (_formKey.currentState!.validate()) {
                            _formKey.currentState!.save();
                            final confirm = await _showConfirmationDialog(
                              title: "Add Confirmation",
                              message: "Apakah Anda yakin mau menambah jenis pakan $name?",
                            );
                            if (confirm) {
                              setState(() {
                                _isLoading = true;
                              });
                              try {
                                final response = await widget.controller
                                    .addFeedType(name, widget.userId);
                                if (response['success'] == true) {
                                  widget.onAdd(FeedType(
                                    id: response['data']?['id'] ?? 0,
                                    name: name,
                                    createdAt: DateTime.now().toIso8601String(),
                                    updatedAt: DateTime.now().toIso8601String(),
                                  ));
                                  Navigator.of(context).pop();
                                } else {
                                  widget.onError(response['message'] ??
                                      'Failed to add feed type');
                                }
                              } catch (e) {
                                widget.onError('Error adding feed type: $e');
                              } finally {
                                setState(() {
                                  _isLoading = false;
                                });
                              }
                            }
                          }
                        },
                  child: _isLoading
                      ? const CircularProgressIndicator(
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        )
                      : const Text(
                          "Add",
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
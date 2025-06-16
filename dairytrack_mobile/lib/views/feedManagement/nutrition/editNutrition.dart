import 'package:flutter/material.dart';
import '../model/nutrition.dart';
import 'package:dairytrack_mobile/controller/APIURL4/nutritionController.dart';

class EditNutrisiForm extends StatefulWidget {
  final Nutrisi nutrisi;
  final NutrisiManagementController controller;
  final int userId;
  final Function(Nutrisi) onUpdate;
  final Function(String) onError;

  const EditNutrisiForm({
    Key? key,
    required this.nutrisi,
    required this.controller,
    required this.userId,
    required this.onUpdate,
    required this.onError,
  }) : super(key: key);

  @override
  _EditNutrisiFormState createState() => _EditNutrisiFormState();
}

class _EditNutrisiFormState extends State<EditNutrisiForm> {
  final _formKey = GlobalKey<FormState>();
  String name = '';
  String unit = '';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    name = widget.nutrisi.name;
    unit = widget.nutrisi.unit;
  }

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
        ) ??
        false;
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
                    "Edit Nutrisi",
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
                initialValue: name,
                decoration: InputDecoration(
                  labelText: 'Name',
                  hintText: 'Enter nutrisi name',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.text_fields, color: Colors.teal),
                  filled: true,
                  fillColor: Colors.teal.shade50,
                ),
                validator: (value) => value == null || value.isEmpty
                    ? 'Please enter the nutrisi name'
                    : null,
                onChanged: (value) => name = value,
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: unit,
                decoration: InputDecoration(
                  labelText: 'Unit',
                  hintText: 'Enter unit (e.g., mg, g)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.scale, color: Colors.teal),
                  filled: true,
                  fillColor: Colors.teal.shade50,
                ),
                validator: (value) => value == null || value.isEmpty
                    ? 'Please enter the unit'
                    : null,
                onChanged: (value) => unit = value,
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
                              title: "Edit Confirmation",
                              message:
                                  "Apakah Anda yakin mau mengubah nutrisi dari ${widget.nutrisi.name} (${widget.nutrisi.unit}) menjadi $name ($unit)?",
                            );
                            if (confirm) {
                              setState(() {
                                _isLoading = true;
                              });
                              try {
                                final response = await widget.controller
                                    .updateNutrisi(
                                  widget.nutrisi.id,
                                  name,
                                  unit,
                                  widget.userId,
                                );
                                if (response['success'] == true) {
                                  widget.onUpdate(Nutrisi(
                                    id: widget.nutrisi.id,
                                    name: name,
                                    unit: unit,
                                    createdAt: widget.nutrisi.createdAt,
                                    updatedAt: DateTime.now().toIso8601String(),
                                  ));
                                  Navigator.of(context).pop();
                                } else {
                                  widget.onError(response['message'] ??
                                      'Failed to update nutrisi');
                                }
                              } catch (e) {
                                widget.onError('Error updating nutrisi: $e');
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
                          "Save",
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
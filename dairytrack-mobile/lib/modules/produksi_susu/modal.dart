import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/config/api/produktivitas/rawMilk.dart';

class Modal extends StatefulWidget {
  final String? modalType;
  final Map<String, dynamic> formData;
  final Function(Map<String, dynamic>) setFormData;
  final List<dynamic> cows;
  final VoidCallback handleSubmit;
  final VoidCallback handleDelete;
  final Function(String?) setModalType;
  final dynamic selectedRawMilk;
  final bool isProcessing;
  final Function(String) handleCowChange;

  const Modal({
    Key? key,
    required this.modalType,
    required this.formData,
    required this.setFormData,
    required this.cows,
    required this.handleSubmit,
    required this.handleDelete,
    required this.setModalType,
    required this.selectedRawMilk,
    required this.isProcessing,
    required this.handleCowChange,
  }) : super(key: key);

  @override
  _ModalState createState() => _ModalState();
}

class _ModalState extends State<Modal> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _productionTimeController;

  @override
  void initState() {
    super.initState();
    _productionTimeController = TextEditingController(
      text: widget.formData['production_time']?.isNotEmpty == true
          ? DateFormat('yyyy-MM-dd HH:mm')
              .format(DateTime.parse(widget.formData['production_time']))
          : '',
    );
  }

  @override
  void dispose() {
    _productionTimeController.dispose();
    super.dispose();
  }

  Future<void> _selectDateTime(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );

    if (pickedDate != null) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (pickedTime != null) {
        final DateTime fullDateTime = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );
        _productionTimeController.text =
            DateFormat('yyyy-MM-dd HH:mm').format(fullDateTime);
        widget.setFormData({
          ...widget.formData,
          'production_time': fullDateTime.toIso8601String(),
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.modalType == 'create'
                    ? 'Add Raw Milk'
                    : widget.modalType == 'edit'
                        ? 'Edit Raw Milk'
                        : 'Delete Confirmation',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              if (widget.isProcessing)
                Column(
                  children: const [
                    CircularProgressIndicator(),
                    SizedBox(height: 8),
                    Text('Processing...'),
                  ],
                )
              else if (widget.modalType == 'delete')
                Text(
                  'Are you sure you want to delete raw milk record "${widget.selectedRawMilk?['cow']['name'] ?? 'this'}"? This action cannot be undone.',
                )
              else
                Column(
                  children: [
                    DropdownButtonFormField<String>(
                      value: widget.formData['cow_id']?.isNotEmpty == true
                          ? widget.formData['cow_id']
                          : null,
                      decoration: const InputDecoration(labelText: 'Cow'),
                      items: widget.cows
                          .where((cow) => cow['gender'] == 'Female')
                          .map<DropdownMenuItem<String>>((cow) {
                        return DropdownMenuItem<String>(
                          value: cow['id'].toString(),
                          child: Text(cow['name']),
                        );
                      }).toList(),
                      onChanged:
                          widget.isProcessing || widget.modalType == 'edit'
                              ? null
                              : (value) {
                                  widget.handleCowChange(value!);
                                },
                      validator: (value) =>
                          value == null ? 'Please select a cow' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _productionTimeController,
                      decoration: const InputDecoration(
                        labelText: 'Production Time',
                        suffixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () => _selectDateTime(context),
                      validator: (value) => value?.isEmpty ?? true
                          ? 'Please select a time'
                          : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      decoration:
                          const InputDecoration(labelText: 'Volume (Liters)'),
                      initialValue:
                          widget.formData['volume_liters']?.toString() ?? '',
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        widget.setFormData({
                          ...widget.formData,
                          'volume_liters': double.tryParse(value) ?? 0,
                        });
                      },
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter volume';
                        }
                        if (double.tryParse(value!) == null) {
                          return 'Please enter a valid number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      decoration:
                          const InputDecoration(labelText: 'Previous Volume'),
                      initialValue:
                          widget.formData['previous_volume']?.toString() ?? '0',
                      readOnly: true,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: widget.formData['lactation_phase'] ?? 'Dry',
                      decoration:
                          const InputDecoration(labelText: 'Lactation Phase'),
                      items: widget.formData['lactation_status'] == true
                          ? const [
                              DropdownMenuItem(
                                value: 'Early',
                                child: Text('Early'),
                              ),
                              DropdownMenuItem(
                                value: 'Mid',
                                child: Text('Mid'),
                              ),
                              DropdownMenuItem(
                                value: 'Late',
                                child: Text('Late'),
                              ),
                            ]
                          : const [
                              DropdownMenuItem(
                                value: 'Dry',
                                child: Text('Dry'),
                              ),
                            ],
                      onChanged: widget.formData['lactation_status'] == true &&
                              !widget.isProcessing
                          ? (value) {
                              widget.setFormData({
                                ...widget.formData,
                                'lactation_phase': value,
                              });
                            }
                          : null,
                    ),
                    Row(
                      children: [
                        Checkbox(
                          value: widget.formData['lactation_status'] ?? false,
                          onChanged: widget.isProcessing
                              ? null
                              : (value) {
                                  widget.setFormData({
                                    ...widget.formData,
                                    'lactation_status': value,
                                    'lactation_phase': value! ? 'Early' : 'Dry',
                                  });
                                },
                        ),
                        const Text('Lactation Status'),
                      ],
                    ),
                  ],
                ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: widget.isProcessing
                        ? null
                        : () {
                            widget.setModalType(null);
                          },
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 8),
                  widget.modalType == 'delete'
                      ? ElevatedButton(
                          onPressed:
                              widget.isProcessing ? null : widget.handleDelete,
                          child: const Text('Delete'),
                        )
                      : ElevatedButton(
                          onPressed: widget.isProcessing
                              ? null
                              : () {
                                  if (_formKey.currentState?.validate() ??
                                      false) {
                                    widget.handleSubmit();
                                  }
                                },
                          child: const Text('Save'),
                        ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

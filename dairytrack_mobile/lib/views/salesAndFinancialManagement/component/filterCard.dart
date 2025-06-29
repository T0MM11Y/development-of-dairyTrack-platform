import 'package:flutter/material.dart';

class FilterCard extends StatelessWidget {
  final String title;
  final String searchHint;
  final String searchQuery;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback? onClearSearch;
  final String? selectedStatus;
  final List<Map<String, String>>
      statusOptions; // {value: 'key', display: 'text'}
  final ValueChanged<String?> onStatusChanged;

  const FilterCard({
    Key? key,
    required this.title,
    required this.searchHint,
    required this.searchQuery,
    required this.onSearchChanged,
    this.onClearSearch,
    this.selectedStatus,
    required this.statusOptions,
    required this.onStatusChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2C3E50),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                hintText: searchHint,
                prefixIcon: const Icon(Icons.search, color: Color(0xFF2C3E50)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF2C3E50)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF2C3E50)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide:
                      const BorderSide(color: Color(0xFF2C3E50), width: 2),
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding:
                    const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                suffixIcon: searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Color(0xFF2C3E50)),
                        onPressed: onClearSearch,
                      )
                    : null,
              ),
              onChanged: onSearchChanged,
            ),
            if (statusOptions.isNotEmpty) ...[
              const SizedBox(height: 12),
              DropdownButtonFormField<String?>(
                value: selectedStatus,
                decoration: InputDecoration(
                  labelText: 'Filter by Status',
                  labelStyle: const TextStyle(color: Color(0xFF2C3E50)),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF2C3E50)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF2C3E50)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide:
                        const BorderSide(color: Color(0xFF2C3E50), width: 2),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  prefixIcon:
                      const Icon(Icons.filter_list, color: Color(0xFF2C3E50)),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child:
                        Text('All', style: TextStyle(color: Color(0xFF2C3E50))),
                  ),
                  ...statusOptions.map((option) {
                    return DropdownMenuItem<String>(
                      value: option['value'],
                      child: Text(
                        option['display']!,
                        style: const TextStyle(color: Color(0xFF2C3E50)),
                      ),
                    );
                  }).toList(),
                ],
                onChanged: onStatusChanged,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

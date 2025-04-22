import 'package:dairy_track/config/api/peternakan/gallery.dart';
import 'package:dairy_track/modules/peternakan/gallery/editGallery.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/gallery.dart';
import 'package:intl/intl.dart';

class AllGallery extends StatefulWidget {
  @override
  _AllGalleryState createState() => _AllGalleryState();
}

class _AllGalleryState extends State<AllGallery> {
  final TextEditingController _searchController = TextEditingController();

  Future<List<Gallery>> fetchGalleries() async {
    try {
      final allGalleries = await getGalleries();
      debugPrint('API Response: $allGalleries');

      final searchText = _searchController.text.toLowerCase();

      final filteredGalleries = allGalleries.where((gallery) {
        if (searchText.isNotEmpty &&
            !gallery.tittle.toLowerCase().contains(searchText)) {
          return false;
        }
        return true;
      }).map((gallery) {
        try {
          // Parse created_at and updated_at fields
          if (gallery.createdAt is String) {
            gallery.createdAt = DateFormat('EEE, dd MMM yyyy HH:mm:ss zzz')
                .parse(gallery.createdAt as String, true)
                .toLocal();
          }
          if (gallery.updatedAt is String) {
            gallery.updatedAt = DateFormat('EEE, dd MMM yyyy HH:mm:ss zzz')
                .parse(gallery.updatedAt as String, true)
                .toLocal();
          }
        } catch (e) {
          debugPrint('Error parsing date for gallery ${gallery.id}: $e');
          // Fallback to current date if parsing fails
          gallery.createdAt ??= DateTime.now();
          gallery.updatedAt ??= DateTime.now();
        }
        return gallery;
      }).toList();

      return filteredGalleries;
    } catch (e) {
      debugPrint('Error fetching galleries: $e');
      rethrow;
    }
  }

  String formatDate(DateTime? date) {
    if (date == null) return 'Unknown';
    try {
      // Format the date to the desired format
      return DateFormat('dd MMM yyyy, HH:mm').format(date);
    } catch (e) {
      debugPrint('Error formatting date: $e');
      return 'Invalid date';
    }
  }

  void _addGallery(BuildContext context) {
    Navigator.pushNamed(context, '/add-gallery');
  }

  void _editGallery(BuildContext context, Gallery gallery) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditGallery(gallery: gallery),
      ),
    );

    // Refresh the page if the update was successful
    if (result == true) {
      setState(() {});
    }
  }

  void _deleteGallery(BuildContext context, int id) async {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title:
            Text('Delete Gallery?', style: TextStyle(color: Colors.red[700])),
        content: const Text('Are you sure you want to delete this gallery?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            onPressed: () async {
              try {
                await deleteGallery(id.toString());
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Gallery deleted successfully'),
                    backgroundColor: Colors.green,
                  ),
                );
                setState(() {}); // Refresh the UI after deletion
              } catch (e) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to delete gallery: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gallery Management',
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 20)),
        backgroundColor: const Color(0xFF4A6FA5),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() {
                _searchController.clear();
              });
            },
          ),
        ],
      ),
      body: Container(
        color: Colors.grey[200],
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(25),
                ),
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(color: Colors.black),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    hintText: 'Search galleries...',
                    hintStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.search, color: Colors.black),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 5),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
              ),
            ),
            Expanded(
              child: FutureBuilder<List<Gallery>>(
                future: fetchGalleries(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                        child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Color(0xFF4A6FA5)),
                    ));
                  } else if (snapshot.hasError) {
                    return Center(
                        child: Text('Error: ${snapshot.error}',
                            style: const TextStyle(color: Colors.red)));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.photo_album,
                              size: 60, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text('No galleries found',
                              style:
                                  TextStyle(fontSize: 18, color: Colors.grey)),
                          if (_searchController.text.isNotEmpty)
                            TextButton(
                              onPressed: () {
                                setState(() {
                                  _searchController.clear();
                                });
                              },
                              child: const Text('Clear search'),
                            ),
                        ],
                      ),
                    );
                  } else {
                    final galleries = snapshot.data!;
                    return ListView.separated(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      itemCount: galleries.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final gallery = galleries[index];
                        return InkWell(
                          borderRadius: BorderRadius.circular(15),
                          onTap: () {
                            // Add navigation to gallery detail if needed
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.2),
                                  spreadRadius: 2,
                                  blurRadius: 5,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      if (gallery.photo.isNotEmpty)
                                        ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                          child: Image.network(
                                            '$BASE_URL/${gallery.photo}',
                                            width: 80,
                                            height: 80,
                                            fit: BoxFit.cover,
                                            errorBuilder:
                                                (context, error, stackTrace) =>
                                                    Container(
                                              width: 80,
                                              height: 80,
                                              color: Colors.grey[200],
                                              child: const Icon(
                                                  Icons.broken_image,
                                                  color: Colors.grey),
                                            ),
                                          ),
                                        )
                                      else
                                        Container(
                                            width: 80,
                                            height: 80,
                                            decoration: BoxDecoration(
                                              color: Colors.grey[200],
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            child: const Icon(
                                                Icons.image_not_supported,
                                                color: Colors.grey)),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    gallery.tittle,
                                                    style: const TextStyle(
                                                      fontSize: 18,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Color(0xFF2C3E50),
                                                    ),
                                                    maxLines: 2,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      PopupMenuButton<String>(
                                        icon: const Icon(Icons.more_vert,
                                            color: Colors.grey),
                                        onSelected: (value) {
                                          if (value == 'edit') {
                                            _editGallery(context, gallery);
                                          } else if (value == 'delete') {
                                            _deleteGallery(
                                                context, gallery.id!);
                                          }
                                        },
                                        itemBuilder: (context) => [
                                          const PopupMenuItem(
                                            value: 'edit',
                                            child: Row(
                                              children: [
                                                Icon(Icons.edit,
                                                    color: Colors.blue),
                                                SizedBox(width: 8),
                                                Text('Edit'),
                                              ],
                                            ),
                                          ),
                                          const PopupMenuItem(
                                            value: 'delete',
                                            child: Row(
                                              children: [
                                                Icon(Icons.delete,
                                                    color: Colors.red),
                                                SizedBox(width: 8),
                                                Text('Delete'),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    formatDate(gallery.createdAt),
                                    style: TextStyle(
                                        fontSize: 12, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addGallery(context),
        backgroundColor: const Color(0xFF4A6FA5),
        child: const Icon(Icons.add, color: Colors.white),
        tooltip: 'Add Gallery',
      ),
    );
  }
}

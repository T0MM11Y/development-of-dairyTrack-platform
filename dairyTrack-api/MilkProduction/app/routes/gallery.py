import os
import uuid
from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename
from app.models.galleries import Gallery
from flask import send_from_directory
from app.database.database import db

gallery_bp = Blueprint('gallery', __name__)

def allowed_file(filename):
    """
    Memeriksa apakah file memiliki ekstensi yang diizinkan.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_file(file, upload_folder):
    """
    Menyimpan file ke folder upload dengan nama unik yang panjangnya maksimal 20 karakter,
    tetapi tetap mempertahankan ekstensi file.
    """
    filename = secure_filename(file.filename)
    # Ambil hanya nama file tanpa ekstensi
    name, ext = os.path.splitext(filename)
    # Potong nama file asli menjadi maksimal 8 karakter
    short_name = name[:8]
    # Gunakan hanya 8 karakter pertama dari UUID
    unique_id = uuid.uuid4().hex[:8]
    # Gabungkan nama pendek dan UUID
    combined_name = f"{short_name}_{unique_id}"
    # Pastikan panjang total nama file (termasuk ekstensi) tidak melebihi 20 karakter
    max_length = 20 - len(ext)  # Sisakan ruang untuk ekstensi
    truncated_name = combined_name[:max_length]
    unique_filename = f"{truncated_name}{ext}"
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    return unique_filename

@gallery_bp.route('/delete/<int:gallery_id>', methods=['DELETE'])
def delete_gallery(gallery_id):
    """
    Menghapus galeri berdasarkan ID.
    """
    try:
        # Cari galeri berdasarkan ID
        gallery = Gallery.query.get(gallery_id)
        if not gallery:
            return jsonify({"error": "Gallery not found"}), 404

        # Hapus file gambar dari folder upload
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/uploads/gallery')
        file_path = os.path.join(upload_folder, gallery.image_url)
        if os.path.exists(file_path):
            os.remove(file_path)

        # Hapus galeri dari database
        db.session.delete(gallery)
        db.session.commit()

        return jsonify({"message": "Gallery deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting gallery: {str(e)}")
        return jsonify({"error": "Failed to delete gallery"}), 500
    
@gallery_bp.route('/update/<int:gallery_id>', methods=['PUT'])
def update_gallery(gallery_id):
    """
    Memperbarui galeri berdasarkan ID.
    """
    try:
        # Cari galeri berdasarkan ID
        gallery = Gallery.query.get(gallery_id)
        if not gallery:
            return jsonify({"error": "Gallery not found"}), 404

        # Ambil data dari request
        title = request.form.get('title')
        file = request.files.get('image')

        # Perbarui judul jika diberikan
        if title:
            gallery.title = title

        # Jika ada file baru, hapus file lama dan simpan file baru
        if file:
            if not allowed_file(file.filename):
                return jsonify({"error": "File type not allowed"}), 400

            # Hapus file lama
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/uploads/gallery')
            old_file_path = os.path.join(upload_folder, gallery.image_url)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

            # Simpan file baru
            unique_filename = save_file(file, upload_folder)
            gallery.image_url = unique_filename

        # Simpan perubahan ke database
        db.session.commit()

        return jsonify({"message": "Gallery updated successfully", "gallery": {
            "id": gallery.id,
            "title": gallery.title,
            "image_url": url_for('gallery.serve_image', filename=gallery.image_url, _external=True),
            "created_at": gallery.created_at,
            "updated_at": gallery.updated_at
        }}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating gallery: {str(e)}")
        return jsonify({"error": "Failed to update gallery"}), 500

@gallery_bp.route('/list', methods=['GET'])
def get_all_galleries():
    """
    Mengambil semua galeri dari database.
    """
    try:
        galleries = Gallery.query.order_by(Gallery.created_at.desc()).all()
        result = [{
            "id": gallery.id,
            "title": gallery.title,
            "image_url": url_for('gallery.serve_image', filename=gallery.image_url, _external=True),  # Bangun URL dinamis
            "created_at": gallery.created_at,
            "updated_at": gallery.updated_at
        } for gallery in galleries]
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching galleries: {str(e)}")
        return jsonify({"error": "Failed to fetch galleries"}), 500
    
@gallery_bp.route('/add', methods=['POST'])
def add_gallery():
    """
    Menambahkan galeri baru ke database dengan upload gambar.
    """
    try:
        # Pastikan folder upload ada
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/uploads/gallery')
        os.makedirs(upload_folder, exist_ok=True)

        title = request.form.get('title')
        file = request.files.get('image')

        # Validasi input
        if not title or not file:
            return jsonify({"error": "Missing required fields: title or image"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # Simpan file ke folder uploads/gallery
        unique_filename = save_file(file, upload_folder)

        # Buat instance Gallery baru
        new_gallery = Gallery(
            title=title,
            image_url=unique_filename  # Simpan hanya nama file
        )

        # Simpan ke database
        db.session.add(new_gallery)
        db.session.commit()

        return jsonify({"message": "Gallery added successfully", "gallery": {
            "id": new_gallery.id,
            "title": new_gallery.title,
            "image_url": url_for('gallery.serve_image', filename=new_gallery.image_url, _external=True),  # Bangun URL dinamis
            "created_at": new_gallery.created_at,
            "updated_at": new_gallery.updated_at
        }}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding gallery: {str(e)}")
        return jsonify({"error": "Failed to add gallery"}), 500

@gallery_bp.route('/uploads/gallery/<filename>', methods=['GET'])
def serve_image(filename):
    """
    Melayani file gambar dari folder uploads/gallery.
    """
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'app/uploads/gallery')
    file_path = os.path.join(upload_folder, filename)
    current_app.logger.info(f"Requested file: {file_path}")
    
    if not os.path.exists(file_path):
        current_app.logger.error(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

    # Pastikan send_from_directory menggunakan path yang benar
    return send_from_directory(upload_folder, filename)
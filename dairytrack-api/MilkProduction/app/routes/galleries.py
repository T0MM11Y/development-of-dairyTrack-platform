import os
from flask import Blueprint, jsonify, request, current_app
from flask import send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import Gallery
import logging

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

galleries_bp = Blueprint('galleries', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads/gallery')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@galleries_bp.route('/galleries', methods=['GET'])
def get_galleries():
    galleries = Gallery.query.order_by(Gallery.created_at.desc()).all()
    return jsonify([gallery.to_dict() for gallery in galleries])

@galleries_bp.route('/galleries/<int:id>', methods=['GET'])
def get_gallery(id):
    gallery = Gallery.query.get_or_404(id)
    return jsonify(gallery.to_dict())

@galleries_bp.route('/galleries', methods=['POST'])
def create_gallery():
    try:
        tittle = request.form.get('tittle')
        file = request.files.get('photo')

        if not tittle:
            logger.error("No tittle provided in the request.")
            return jsonify({'error': 'No tittle provided'}), 400

        if not file:
            logger.error("No photo file provided in the request.")
            return jsonify({'error': 'No photo file provided'}), 400

        # Handle photo upload
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        photo_url = f'/uploads/gallery/{filename}'

        # Create the gallery object
        gallery = Gallery(tittle=tittle, photo=photo_url)
        db.session.add(gallery)
        db.session.commit()
        return jsonify({
        'message': 'Gallery created successfully!',
        'data': gallery.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Error occurred while creating a gallery: {str(e)}", exc_info=True)
        return jsonify({'error': 'An error occurred while creating the gallery. Please check the server logs for more details.'}), 500



@galleries_bp.route('/galleries/<int:id>', methods=['PUT'])
def update_gallery(id):
    try:
        gallery = Gallery.query.get_or_404(id)

        # Ambil data dari request
        tittle = request.form.get('tittle')
        file = request.files.get('photo')

        # Perbarui tittle jika disediakan
        if tittle:
            gallery.tittle = tittle

        # Perbarui foto jika disediakan
        if file:
            # Hapus file foto lama jika ada
            if gallery.photo:
                old_file_path = os.path.join(UPLOAD_FOLDER, os.path.basename(gallery.photo))
                delete_file(old_file_path)

            # Simpan file foto baru
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            gallery.photo = f'/uploads/gallery/{filename}'

        # Simpan perubahan ke database
        db.session.commit()
        return jsonify({
        'message': 'Gallery updated successfully!',
        'data': gallery.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error occurred while updating gallery with id {id}: {str(e)}", exc_info=True)
        return jsonify({'error': 'An error occurred while updating the gallery. Please check the server logs for more details.'}), 500  

@galleries_bp.route('/galleries/<int:id>', methods=['DELETE'])
def delete_gallery(id):
    gallery = Gallery.query.get_or_404(id)

    # Hapus file foto jika ada
    if gallery.photo:
        file_path = os.path.join(UPLOAD_FOLDER, os.path.basename(gallery.photo))
        delete_file(file_path)

    db.session.delete(gallery)
    db.session.commit()
    return jsonify({'message': f'Gallery with id "{id}" has been successfully deleted!','status': 200}), 200

@galleries_bp.route('/galleries/<int:id>/photo', methods=['GET'])
def get_gallery_photo(id):
    gallery = Gallery.query.get_or_404(id)
    if not gallery.photo:
        return jsonify({'error': 'Photo not found for this gallery'}), 404

    photo_url = request.host_url.rstrip('/') + '/api' + gallery.photo
    return jsonify({'photo_url': photo_url})

@galleries_bp.route('/uploads/gallery/<filename>', methods=['GET'])
def serve_gallery_photo(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@galleries_bp.after_request
def add_json_header(response):
    if response.is_json:
        response.headers['Content-Type'] = 'application/json'
    return response

def delete_file(file_path):
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File {file_path} has been deleted.")
    except Exception as e:
        logger.error(f"Error occurred while deleting file {file_path}: {str(e)}", exc_info=True)
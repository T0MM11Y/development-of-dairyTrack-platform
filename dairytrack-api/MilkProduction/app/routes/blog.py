import os
from flask import Blueprint, jsonify, request, current_app
from flask import send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import Blog
import logging

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# Define Blueprint
blogs_bp = Blueprint('blogs', __name__)

# Ensure the uploads folder exists
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@blogs_bp.route('/blogs', methods=['GET'])
def get_blogs():
    blogs = Blog.query.order_by(Blog.created_at.desc()).all()
    return jsonify([blog.to_dict() for blog in blogs])

@blogs_bp.route('/blogs/<int:id>', methods=['GET'])
def get_blog(id):
    blog = Blog.query.get_or_404(id)
    return jsonify(blog.to_dict())


@blogs_bp.route('/blogs', methods=['POST'])
def create_blog():
    try:
        data = request.form  # Use form data for text fields
        file = request.files.get('photo')  # Get the uploaded file

        if not data:
            logger.error("No input data provided in the request.")
            return jsonify({'error': 'No input data provided'}), 400

        # Save the uploaded file
        photo_url = None
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            photo_url = f'/uploads/{filename}'  # Save the relative URL to the database

        # Create a new blog entry
        blog = Blog(
            title=data.get('title'),
            description=data.get('description'),
            photo=photo_url,  # Save the URL in the database
            topic=data.get('topic')
        )

        db.session.add(blog)
        db.session.commit()
        return jsonify(blog.to_dict()), 201

    except Exception as e:
        # Log the specific error to the console
        logger.error(f"Error occurred while creating a blog: {str(e)}", exc_info=True)
        return jsonify({'error': 'An error occurred while creating the blog. Please check the server logs for more details.'}), 500

@blogs_bp.route('/blogs/<int:id>', methods=['PUT'])
def update_blog(id):
    blog = Blog.query.get_or_404(id)
    data = request.form  # Use form data for text fields
    file = request.files.get('photo')  # Get the uploaded file

    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Update the uploaded file if provided
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        blog.photo = f'/uploads/{filename}'  # Update the URL in the database

    blog.title = data.get('title', blog.title)
    blog.description = data.get('description', blog.description)
    blog.topic = data.get('topic', blog.topic)

    db.session.commit()
    return jsonify(blog.to_dict())

@blogs_bp.route('/blogs/<int:id>/photo', methods=['GET'])
def get_blog_photo(id):
    blog = Blog.query.get_or_404(id)
    if not blog.photo:
        return jsonify({'error': 'Photo not found for this blog'}), 404
    # Tambahkan '/api' sebelum path photo
    photo_url = request.host_url.rstrip('/') + '/api' + blog.photo
    return jsonify({'photo_url': photo_url})

@blogs_bp.route('/uploads/<filename>', methods=['GET'])
def serve_photo(filename):
    # Tentukan path folder uploads
    upload_folder = os.path.join(os.path.dirname(__file__), '../uploads')
    # Kirim file dari folder uploads
    return send_from_directory(upload_folder, filename)

@blogs_bp.route('/blogs/<int:id>', methods=['DELETE'])
def delete_blog(id):
    blog = Blog.query.get_or_404(id)
    blog_title = blog.title  # Retrieve the blog's title before deletion
    db.session.delete(blog)
    db.session.commit()
    return jsonify({'message': f'Blog with title "{blog_title}" and id "{id}" has been successfully deleted!'})


@blogs_bp.after_request
def add_json_header(response):
    if response.is_json:
        response.headers['Content-Type'] = 'application/json'
    return response
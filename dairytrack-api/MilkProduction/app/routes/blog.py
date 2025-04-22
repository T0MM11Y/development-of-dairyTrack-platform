import os
from flask import Blueprint, jsonify, request, current_app
from flask import send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import Blog
import logging


logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


blogs_bp = Blueprint('blogs', __name__)


UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads/blog')
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
        data = request.form  
        file = request.files.get('photo')  

        if not data:
            logger.error("No input data provided in the request.")
            return jsonify({'error': 'No input data provided'}), 400

        # Handle photo upload
        photo_url = None
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            photo_url = f'/uploads/blog/{filename}'  

        # Create the blog object with topic_id instead of topic
        blog = Blog(
            title=data.get('title'),
            description=data.get('description'),
            photo=photo_url,  
            topic_id=data.get('topic_id')  # Use topic_id here
        )

        db.session.add(blog)
        db.session.commit()
        return jsonify(blog.to_dict()), 201

    except Exception as e:
        logger.error(f"Error occurred while creating a blog: {str(e)}", exc_info=True)
        return jsonify({'error': 'An error occurred while creating the blog. Please check the server logs for more details.'}), 500

@blogs_bp.route('/blogs/<int:id>', methods=['PUT'])
def update_blog(id):
    blog = Blog.query.get_or_404(id)
    data = request.form  
    file = request.files.get('photo')  

    
    if file:
        
        if blog.photo:
            old_file_path = os.path.join(UPLOAD_FOLDER, os.path.basename(blog.photo))
            delete_file(old_file_path)

        
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        blog.photo = f'/uploads/blog/{filename}'  

    
    if 'title' in data:
        blog.title = data.get('title')
    if 'description' in data:
        blog.description = data.get('description')
    if 'topic_id' in data:
        blog.topic_id = data.get('topic_id')

    db.session.commit()
    return jsonify(blog.to_dict()), 200

@blogs_bp.route('/blogs/<int:id>/photo', methods=['GET'])
def get_blog_photo(id):
    blog = Blog.query.get_or_404(id)
    if not blog.photo:
        return jsonify({'error': 'Photo not found for this blog'}), 404
    
    photo_url = request.host_url.rstrip('/') + '/api' + blog.photo
    return jsonify({'photo_url': photo_url})

@blogs_bp.route('/uploads/blog/<filename>', methods=['GET'])
def serve_photo(filename):
    
    upload_folder = os.path.join(os.path.dirname(__file__), '../uploads/blog/')
    
    return send_from_directory(upload_folder, filename)

@blogs_bp.route('/blogs/<int:id>', methods=['DELETE'])
def delete_blog(id):
    blog = Blog.query.get_or_404(id)

    # Hapus file foto jika ada
    if blog.photo:
        file_path = os.path.join(UPLOAD_FOLDER, os.path.basename(blog.photo))
        delete_file(file_path)

    blog_title = blog.title  # Retrieve the blog's title before deletion
    db.session.delete(blog)
    db.session.commit()
    return jsonify({'message': f'Blog with title "{blog_title}" and id "{id}" has been successfully deleted!', 'status': 200}), 200

@blogs_bp.after_request
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


import os
import uuid
from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename
from app.models.blog import Blog
from app.models.category import Category
from app.models.blog_category import BlogCategory
from flask import send_from_directory
from app.database.database import db

blog_bp = Blueprint('blog', __name__)

def allowed_file(filename):
    """
    Memeriksa apakah file memiliki ekstensi yang diizinkan.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_file(file, upload_folder):
    """
    Menyimpan file ke folder upload dengan nama unik.
    """
    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    short_name = name[:8]
    unique_id = uuid.uuid4().hex[:8]
    combined_name = f"{short_name}_{unique_id}"
    max_length = 20 - len(ext)
    truncated_name = combined_name[:max_length]
    unique_filename = f"{truncated_name}{ext}"
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    return unique_filename

@blog_bp.route('/add', methods=['POST'])
def add_blog():
    """
    Menambahkan blog baru ke database dengan upload gambar dan kategori.
    """
    try:
        upload_folder = current_app.config.get('BLOG_UPLOAD_FOLDER', 'app/uploads/blog')
        os.makedirs(upload_folder, exist_ok=True)

        title = request.form.get('title')
        content = request.form.get('content')
        file = request.files.get('photo')
        category_ids = request.form.getlist('category_ids')

        if not title or not content or not file:
            return jsonify({"error": "Missing required fields: title, content, or photo"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        unique_filename = save_file(file, upload_folder)

        new_blog = Blog(
            title=title,
            content=content,
            photo_url=unique_filename
        )

        # Add categories to blog if provided
        if category_ids:
            for cat_id in category_ids:
                category = Category.query.get(cat_id)
                if category:
                    new_blog.categories.append(category)

        db.session.add(new_blog)
        db.session.commit()

        # Build response object with categories
        categories_data = [{
            "id": cat.id,
            "name": cat.name,
            "description": cat.description
        } for cat in new_blog.categories]

        return jsonify({"message": "Blog added successfully", "blog": {
            "id": new_blog.id,
            "title": new_blog.title,
            "content": new_blog.content,
            "photo_url": url_for('blog.serve_image', filename=new_blog.photo_url, _external=True),
            "created_at": new_blog.created_at,
            "updated_at": new_blog.updated_at,
            "categories": categories_data
        }}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding blog: {str(e)}")
        return jsonify({"error": f"Failed to add blog: {str(e)}"}), 500

@blog_bp.route('/uploads/blog/<filename>', methods=['GET'])
def serve_image(filename):
    """
    Melayani file gambar dari folder uploads/blog.
    """
    upload_folder = current_app.config.get('BLOG_UPLOAD_FOLDER', 'app/uploads/blog')
    file_path = os.path.join(upload_folder, filename)
    current_app.logger.info(f"Requested file: {file_path}")
    
    if not os.path.exists(file_path):
        current_app.logger.error(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(upload_folder, filename)

@blog_bp.route('/list', methods=['GET'])
def list_blogs():
    """
    Mendapatkan daftar semua blog dengan kategori.
    """
    try:
        category_id = request.args.get('category_id')
        
        if category_id:
            # Filter blogs by category if category_id is provided
            category = Category.query.get(category_id)
            if not category:
                return jsonify({"error": "Category not found"}), 404
            blogs = category.blogs
        else:
            blogs = Blog.query.all()
            
        blog_list = []
        for blog in blogs:
            categories_data = [{
                "id": cat.id,
                "name": cat.name,
                "description": cat.description
            } for cat in blog.categories]
            
            blog_list.append({
                "id": blog.id, 
                "title": blog.title, 
                "content": blog.content, 
                "photo_url": url_for('blog.serve_image', filename=blog.photo_url, _external=True), 
                "created_at": blog.created_at, 
                "updated_at": blog.updated_at,
                "categories": categories_data
            })

        return jsonify({"blogs": blog_list}), 200

    except Exception as e:
        current_app.logger.error(f"Error listing blogs: {str(e)}")
        return jsonify({"error": f"Failed to list blogs: {str(e)}"}), 500
    
@blog_bp.route('/<int:blog_id>', methods=['GET'])
def get_blog_by_id(blog_id):
    """
    Mendapatkan data blog berdasarkan ID dengan kategori.
    """
    try:
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        categories_data = [{
            "id": cat.id,
            "name": cat.name,
            "description": cat.description
        } for cat in blog.categories]

        return jsonify({"blog": {
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "photo_url": url_for('blog.serve_image', filename=blog.photo_url, _external=True),
            "created_at": blog.created_at,
            "updated_at": blog.updated_at,
            "categories": categories_data
        }}), 200

    except Exception as e:
        current_app.logger.error(f"Error getting blog by ID: {str(e)}")
        return jsonify({"error": f"Failed to get blog: {str(e)}"}), 500
    
@blog_bp.route('/update/<int:blog_id>', methods=['PUT'])
def update_blog(blog_id):
    """
    Memperbarui blog berdasarkan ID, termasuk kategori.
    """
    try:
        upload_folder = current_app.config.get('BLOG_UPLOAD_FOLDER', 'app/uploads/blog')
        os.makedirs(upload_folder, exist_ok=True)

        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        title = request.form.get('title')
        content = request.form.get('content')
        file = request.files.get('photo')
        category_ids = request.form.getlist('category_ids')

        if title:
            blog.title = title
        if content:
            blog.content = content
        if file:
            if not allowed_file(file.filename):
                return jsonify({"error": "File type not allowed"}), 400

            # Hapus file lama
            old_file_path = os.path.join(upload_folder, blog.photo_url)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

            unique_filename = save_file(file, upload_folder)
            blog.photo_url = unique_filename

        # Update categories if provided
        if category_ids:
            # Clear existing categories
            blog.categories = []
            
            # Add new categories
            for cat_id in category_ids:
                category = Category.query.get(cat_id)
                if category:
                    blog.categories.append(category)

        db.session.commit()

        # Build response with updated categories
        categories_data = [{
            "id": cat.id,
            "name": cat.name,
            "description": cat.description
        } for cat in blog.categories]

        return jsonify({"message": "Blog updated successfully", "blog": {
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "photo_url": url_for('blog.serve_image', filename=blog.photo_url, _external=True),
            "created_at": blog.created_at,
            "updated_at": blog.updated_at,
            "categories": categories_data
        }}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating blog: {str(e)}")
        return jsonify({"error": f"Failed to update blog: {str(e)}"}), 500
    
@blog_bp.route('/delete/<int:blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    """
    Menghapus blog berdasarkan ID.
    """
    try:
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        # Hapus file gambar
        upload_folder = current_app.config.get('BLOG_UPLOAD_FOLDER', 'app/uploads/blog')
        old_file_path = os.path.join(upload_folder, blog.photo_url)
        if os.path.exists(old_file_path):
            os.remove(old_file_path)

        # The relationships will be automatically deleted due to cascade
        db.session.delete(blog)
        db.session.commit()

        return jsonify({"message": "Blog deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting blog: {str(e)}")
        return jsonify({"error": f"Failed to delete blog: {str(e)}"}), 500

@blog_bp.route('/<int:blog_id>/categories', methods=['GET'])
def get_blog_categories(blog_id):
    """
    Mendapatkan semua kategori terkait dengan blog tertentu.
    """
    try:
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        categories = [{
            "id": cat.id,
            "name": cat.name,
            "description": cat.description
        } for cat in blog.categories]

        return jsonify({"categories": categories}), 200

    except Exception as e:
        current_app.logger.error(f"Error getting blog categories: {str(e)}")
        return jsonify({"error": f"Failed to get blog categories: {str(e)}"}), 500

@blog_bp.route('/<int:blog_id>/categories', methods=['POST'])
def add_category_to_blog(blog_id):
    """
    Menambahkan kategori ke blog tertentu.
    """
    try:
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        data = request.get_json()
        if not data or 'category_id' not in data:
            return jsonify({"error": "Missing category_id"}), 400

        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({"error": "Category not found"}), 404

        if category in blog.categories:
            return jsonify({"message": "Category already exists for this blog"}), 200

        blog.categories.append(category)
        db.session.commit()

        return jsonify({"message": "Category added to blog successfully"}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding category to blog: {str(e)}")
        return jsonify({"error": f"Failed to add category to blog: {str(e)}"}), 500

@blog_bp.route('/<int:blog_id>/categories/<int:category_id>', methods=['DELETE'])
def remove_category_from_blog(blog_id, category_id):
    """
    Menghapus kategori dari blog tertentu.
    """
    try:
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        category = Category.query.get(category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404

        if category not in blog.categories:
            return jsonify({"error": "Category not associated with this blog"}), 404

        blog.categories.remove(category)
        db.session.commit()

        return jsonify({"message": "Category removed from blog successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing category from blog: {str(e)}")
        return jsonify({"error": f"Failed to remove category from blog: {str(e)}"}), 500
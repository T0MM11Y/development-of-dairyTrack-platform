from flask import Blueprint, request, jsonify, current_app
from app.models.blog import Blog
from app.models.category import Category
from app.models.blog_category import BlogCategory
from app.database.database import db

blog_category_bp = Blueprint('blog_category', __name__)

@blog_category_bp.route('/assign', methods=['POST'])
def assign_category_to_blog():
    """
    Menetapkan kategori ke blog.
    """
    try:
        data = request.get_json()
        if not data or 'blog_id' not in data or 'category_id' not in data:
            return jsonify({"error": "Missing required fields: blog_id, category_id"}), 400

        blog_id = data['blog_id']
        category_id = data['category_id']

        # Verify blog and category exist
        blog = Blog.query.get(blog_id)
        category = Category.query.get(category_id)

        if not blog:
            return jsonify({"error": "Blog not found"}), 404
        if not category:
            return jsonify({"error": "Category not found"}), 404

        # Check if the relationship already exists
        if category in blog.categories:
            return jsonify({"message": "This blog is already assigned to the category"}), 400

        # Add relationship
        blog.categories.append(category)
        db.session.commit()

        return jsonify({
            "message": "Category assigned to blog successfully",
            "blog_id": blog_id,
            "category_id": category_id,
            "blog_title": blog.title,
            "category_name": category.name
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error assigning category to blog: {str(e)}")
        return jsonify({"error": f"Failed to assign category to blog: {str(e)}"}), 500

@blog_category_bp.route('/remove', methods=['DELETE'])
def remove_category_from_blog():
    """
    Menghapus kategori dari blog.
    """
    try:
        data = request.get_json()
        if not data or 'blog_id' not in data or 'category_id' not in data:
            return jsonify({"error": "Missing required fields: blog_id, category_id"}), 400

        blog_id = data['blog_id']
        category_id = data['category_id']

        # Verify blog and category exist
        blog = Blog.query.get(blog_id)
        category = Category.query.get(category_id)

        if not blog:
            return jsonify({"error": "Blog not found"}), 404
        if not category:
            return jsonify({"error": "Category not found"}), 404

        # Check if the relationship exists
        if category not in blog.categories:
            return jsonify({"error": "Blog is not assigned to this category"}), 404

        # Remove relationship
        blog.categories.remove(category)
        db.session.commit()

        return jsonify({
            "message": "Category removed from blog successfully",
            "blog_id": blog_id,
            "category_id": category_id
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing category from blog: {str(e)}")
        return jsonify({"error": f"Failed to remove category from blog: {str(e)}"}), 500

@blog_category_bp.route('/blog/<int:blog_id>/categories', methods=['GET'])
def get_blog_categories(blog_id):
    """
    Mendapatkan semua kategori yang terkait dengan blog tertentu.
    """
    try:
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        categories_data = []
        for category in blog.categories:
            categories_data.append({
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "created_at": category.created_at,
                "updated_at": category.updated_at
            })

        return jsonify({
            "blog_id": blog_id,
            "blog_title": blog.title,
            "categories": categories_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting blog categories: {str(e)}")
        return jsonify({"error": f"Failed to get blog categories: {str(e)}"}), 500

@blog_category_bp.route('/category/<int:category_id>/blogs', methods=['GET'])
def get_category_blogs(category_id):
    """
    Mendapatkan semua blog yang terkait dengan kategori tertentu.
    """
    try:
        category = Category.query.get(category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404

        blogs_data = []
        for blog in category.blogs:
            blogs_data.append({
                "id": blog.id,
                "title": blog.title,
                "photo_url": blog.photo_url,
                "content": blog.content,
                "created_at": blog.created_at,
                "updated_at": blog.updated_at
            })

        return jsonify({
            "category_id": category_id,
            "category_name": category.name,
            "blogs": blogs_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting category blogs: {str(e)}")
        return jsonify({"error": f"Failed to get category blogs: {str(e)}"}), 500

@blog_category_bp.route('/bulk-assign', methods=['POST'])
def bulk_assign_categories():
    """
    Menetapkan beberapa kategori ke blog sekaligus.
    """
    try:
        data = request.get_json()
        if not data or 'blog_id' not in data or 'category_ids' not in data:
            return jsonify({"error": "Missing required fields: blog_id, category_ids"}), 400

        blog_id = data['blog_id']
        category_ids = data['category_ids']

        # Verify blog exists
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        # Track assigned categories
        assigned_categories = []
        
        # Clear existing categories if replace=True
        if data.get('replace', False):
            blog.categories = []

        # Add categories
        for cat_id in category_ids:
            category = Category.query.get(cat_id)
            if category and category not in blog.categories:
                blog.categories.append(category)
                assigned_categories.append({
                    "id": category.id,
                    "name": category.name
                })
        
        db.session.commit()

        return jsonify({
            "message": "Categories assigned to blog successfully",
            "blog_id": blog_id,
            "blog_title": blog.title,
            "assigned_categories": assigned_categories
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error bulk assigning categories: {str(e)}")
        return jsonify({"error": f"Failed to assign categories: {str(e)}"}), 500

@blog_category_bp.route('/list', methods=['GET'])
def list_blog_categories():
    """
    Mendapatkan semua relasi blog-kategori.
    """
    try:
        relationships = []
        blogs = Blog.query.all()
        
        for blog in blogs:
            for category in blog.categories:
                relationships.append({
                    "blog_id": blog.id,
                    "blog_title": blog.title,
                    "category_id": category.id,
                    "category_name": category.name
                })
                
        return jsonify({"relationships": relationships}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error listing blog-category relationships: {str(e)}")
        return jsonify({"error": f"Failed to list relationships: {str(e)}"}), 500
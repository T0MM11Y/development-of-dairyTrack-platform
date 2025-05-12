from flask import Blueprint, request, jsonify, current_app
from app.models.category import Category
from app.models.blog import Blog
from app.database.database import db

category_bp = Blueprint('category', __name__)

@category_bp.route('/add', methods=['POST'])
def add_category():
    """
    Menambahkan kategori baru ke database.
    """
    try:
        data = request.get_json()

        if not data or 'name' not in data:
            return jsonify({"error": "Missing required field: name"}), 400

        # Check if category with the same name already exists
        existing_category = Category.query.filter_by(name=data['name']).first()
        if existing_category:
            return jsonify({"error": "Category with this name already exists"}), 400

        new_category = Category(
            name=data['name'],
            description=data.get('description', '')
        )

        db.session.add(new_category)
        db.session.commit()

        return jsonify({
            "message": "Category added successfully", 
            "category": {
                "id": new_category.id,
                "name": new_category.name,
                "description": new_category.description,
                "created_at": new_category.created_at,
                "updated_at": new_category.updated_at
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding category: {str(e)}")
        return jsonify({"error": f"Failed to add category: {str(e)}"}), 500

@category_bp.route('/list', methods=['GET'])
def list_categories():
    """
    Mendapatkan daftar semua kategori dengan jumlah blog terkait.
    """
    try:
        categories = Category.query.all()
        
        category_list = []
        for category in categories:
            category_list.append({
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "blog_count": len(category.blogs),
                "created_at": category.created_at,
                "updated_at": category.updated_at
            })

        return jsonify({"categories": category_list}), 200

    except Exception as e:
        current_app.logger.error(f"Error listing categories: {str(e)}")
        return jsonify({"error": f"Failed to list categories: {str(e)}"}), 500

@category_bp.route('/<int:category_id>', methods=['GET'])
def get_category_by_id(category_id):
    """
    Mendapatkan data kategori berdasarkan ID beserta daftar blog terkait.
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
                "created_at": blog.created_at
            })

        return jsonify({
            "category": {
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "created_at": category.created_at,
                "updated_at": category.updated_at,
                "blogs": blogs_data
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting category by ID: {str(e)}")
        return jsonify({"error": f"Failed to get category: {str(e)}"}), 500

@category_bp.route('/update/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """
    Memperbarui data kategori berdasarkan ID.
    """
    try:
        category = Category.query.get(category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Check name uniqueness if name is being updated
        if 'name' in data and data['name'] != category.name:
            existing_category = Category.query.filter_by(name=data['name']).first()
            if existing_category:
                return jsonify({"error": "Category with this name already exists"}), 400
            category.name = data['name']

        if 'description' in data:
            category.description = data['description']

        db.session.commit()

        return jsonify({
            "message": "Category updated successfully",
            "category": {
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "created_at": category.created_at,
                "updated_at": category.updated_at
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating category: {str(e)}")
        return jsonify({"error": f"Failed to update category: {str(e)}"}), 500

@category_bp.route('/delete/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """
    Menghapus kategori berdasarkan ID.
    """
    try:
        category = Category.query.get(category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404

        # The relationship with blogs will be automatically handled due to the secondary table
        db.session.delete(category)
        db.session.commit()

        return jsonify({"message": "Category deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting category: {str(e)}")
        return jsonify({"error": f"Failed to delete category: {str(e)}"}), 500

@category_bp.route('/<int:category_id>/blogs', methods=['GET'])
def get_category_blogs(category_id):
    """
    Mendapatkan daftar semua blog dalam kategori tertentu.
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
                "content": blog.content,
                "photo_url": blog.photo_url,
                "created_at": blog.created_at,
                "updated_at": blog.updated_at
            })

        return jsonify({
            "category": {
                "id": category.id,
                "name": category.name,
                "description": category.description
            },
            "blogs": blogs_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting category blogs: {str(e)}")
        return jsonify({"error": f"Failed to get category blogs: {str(e)}"}), 500
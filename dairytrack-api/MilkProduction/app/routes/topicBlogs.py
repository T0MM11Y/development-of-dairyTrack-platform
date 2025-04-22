from flask import Blueprint, jsonify, request
from app import db
from app.models import TopicBlog

# Blueprint untuk TopicBlog
topic_blogs_bp = Blueprint('topic_blogs', __name__)

@topic_blogs_bp.route('/topic_blogs', methods=['GET'])
def get_topic_blogs():
    topic_blogs = TopicBlog.query.order_by(TopicBlog.id).all()
    return jsonify({
        'message': 'Topic blogs retrieved successfully', 'status': '200',
        'data': [topic_blog.to_dict() for topic_blog in topic_blogs]
    }), 200

@topic_blogs_bp.route('/topic_blogs/<int:id>', methods=['GET'])
def get_topic_blog(id):
    topic_blog = TopicBlog.query.get_or_404(id)
    return jsonify(topic_blog.to_dict())

@topic_blogs_bp.route('/topic_blogs', methods=['POST'])
def create_topic_blog():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No JSON data provided', 'status': 400}), 400

    if 'topic' not in data:
        return jsonify({'message': 'Missing "topic" field in JSON data', 'status': 400}), 400

    new_topic_blog = TopicBlog(
        topic=data.get('topic')
    )

    db.session.add(new_topic_blog)
    db.session.commit()
    return jsonify({'message': 'TopicBlog created successfully', 'status': 200, 'data': new_topic_blog.to_dict()}), 201

@topic_blogs_bp.route('/topic_blogs/<int:id>', methods=['PUT'])
def update_topic_blog(id):
    topic_blog = TopicBlog.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    topic_blog.topic = data.get('topic', topic_blog.topic)

    db.session.commit()
    return jsonify(topic_blog.to_dict())

@topic_blogs_bp.route('/topic_blogs/<int:id>', methods=['DELETE'])
def delete_topic_blog(id):
    topic_blog = TopicBlog.query.get_or_404(id)
    db.session.delete(topic_blog)
    db.session.commit()
    return jsonify({'message': 'TopicBlog has been deleted!', 'status': 200}), 200
from flask import Blueprint, jsonify, request
from app.models.notification import Notification
from app.database.database import db
from pytz import timezone

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id', type=int)
    
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    # Query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    is_read = request.args.get('is_read', None)

    # Build query
    query = Notification.query.filter_by(user_id=user_id)

    if is_read is not None:
        is_read = is_read.lower() == 'true'
        query = query.filter_by(is_read=is_read)

    # Order by newest first
    query = query.order_by(Notification.created_at.desc())

    # Paginate results
    notifications = query.paginate(page=page, per_page=per_page)

    # Convert created_at ke Asia/Jakarta timezone
    jakarta = timezone("Asia/Jakarta")

    result = {
        'notifications': [
            {
                'id': n.id,
                'cow_id': n.cow_id,
                'message': n.message,
                'type': n.type,
                'is_read': n.is_read,
                'created_at': n.created_at.astimezone(jakarta).isoformat() if n.created_at else None
            } for n in notifications.items
        ],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': page
    }

    return jsonify(result)


@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
def mark_as_read(notification_id):
    user_id = request.json.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Missing user_id in request body"}), 400
    
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first_or_404()
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Notifikasi ditandai sudah dibaca'})


@notification_bp.route('/unread-count', methods=['GET'])
def get_unread_count():
    user_id = request.args.get('user_id', type=int)
    
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400
    
    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({'unread_count': count})


@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    user_id = request.json.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Missing user_id in request body"}), 400
    
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first_or_404()
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notifikasi dihapus'})

# ...existing code...

@notification_bp.route('/clear-all', methods=['DELETE'])
def clear_all_notifications():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id in request body"}), 400

    notifications = Notification.query.filter_by(user_id=user_id).all()
    for n in notifications:
        db.session.delete(n)
    db.session.commit()
    return jsonify({'message': 'Semua notifikasi dihapus'})

# ...existing code...
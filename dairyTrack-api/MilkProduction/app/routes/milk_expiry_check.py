from flask import Blueprint, jsonify, request
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from app.models.milk_batches import MilkBatch, MilkStatus
from app.models.milking_sessions import MilkingSession
from app.models.users import User
from app.models.cows import Cow
from app.database.database import db
from app.services.notification import check_milk_expiry_and_notify

milk_expiry_bp = Blueprint('milk_expiry', __name__)

def get_user_managed_batches(user_id):
    """Get batch IDs that are managed by the specific user"""
    try:
        # Get user
        user = User.query.get(user_id)
        if not user:
            return []
        
        # Jika user adalah admin, kembalikan semua batch
        if user.role == 'Admin':  # Pastikan atribut role sesuai dengan model User
            return [batch.id for batch in MilkBatch.query.all()]
        
        # Get cow IDs managed by this user
        managed_cow_ids = [cow.id for cow in user.managed_cows.all()]
        
        if not managed_cow_ids:
            return []
        
        # Get batch IDs from milking sessions where cow_id is in managed_cow_ids
        batch_ids = db.session.query(MilkingSession.milk_batch_id)\
            .filter(MilkingSession.cow_id.in_(managed_cow_ids))\
            .filter(MilkingSession.milk_batch_id.isnot(None))\
            .distinct().all()
        
        return [batch_id[0] for batch_id in batch_ids if batch_id[0] is not None]
    
    except Exception as e:
        print(f"Error getting user managed batches: {str(e)}")
        return []

def calculate_time_remaining(expiry_date, current_time):
    """Calculate time remaining until expiry"""
    if not expiry_date:
        return None
    
    # Calculate difference in minutes and hours
    time_diff = expiry_date - current_time
    total_minutes = int(time_diff.total_seconds() / 60)
    total_hours = round(time_diff.total_seconds() / 3600, 1)
    
    hours = abs(total_minutes) // 60
    minutes = abs(total_minutes) % 60
    
    return {
        'total_minutes': total_minutes,
        'total_hours': total_hours,
        'hours': hours,
        'minutes': minutes,
        'is_expired': total_minutes <= 0,
        'is_overdue': total_minutes < 0
    }

def auto_update_expired_batches(user_id=None, user_role=None):
    """Automatically update expired milk batches and send notifications"""
    try:
        current_time = datetime.utcnow()
        
        # Build query for expired batches
        query = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.expiry_date <= current_time
            )
        )
        
        # Filter by user if user_id is provided and user is not admin
        if user_id and user_role and user_role.lower() != 'admin':
            managed_batch_ids = get_user_managed_batches(user_id)
            if not managed_batch_ids:
                return 0, 0
            query = query.filter(MilkBatch.id.in_(managed_batch_ids))
        
        expired_batches = query.all()
        
        # Update expired batches
        for batch in expired_batches:
            batch.status = MilkStatus.EXPIRED
            batch.updated_at = current_time
        
        if expired_batches:
            db.session.commit()
            
        # Check expiry and send notifications
        notification_count = check_milk_expiry_and_notify()
        
        return len(expired_batches), notification_count
        
    except Exception as e:
        db.session.rollback()
        raise e

@milk_expiry_bp.route('/milk-batches/status', methods=['GET'])
def get_milk_batches_by_status():
    """Get milk batches grouped by status with automatic expiry check, filtered by user"""
    try:
        # Get user_id and user_role from request
        user_id = request.args.get('user_id')
        user_role = request.args.get('user_role')
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid user ID format'
            }), 400
        
        # Get managed batch IDs for this user
        # Jika user_role adalah Admin, dapatkan semua batch
        if user_role and user_role.lower() == 'admin':
            managed_batch_ids = [batch.id for batch in MilkBatch.query.all()]
        else:
            managed_batch_ids = get_user_managed_batches(user_id)
        
        if not managed_batch_ids:
            return jsonify({
                'success': True,
                'data': {
                    'fresh': [],
                    'expired': [],
                    'used': [],
                    'summary': {
                        'fresh_count': 0,
                        'expired_count': 0,
                        'used_count': 0,
                        'total_fresh_volume': 0,
                        'total_expired_volume': 0,
                        'total_used_volume': 0
                    },
                    'auto_update_info': {
                        'batches_auto_expired': 0,
                        'notifications_sent': 0
                    },
                    'user_info': {
                        'user_id': user_id,
                        'user_role': user_role,
                        'managed_batch_count': 0
                    }
                }
            }), 200
        
        # Automatically check and update expired batches for this user
        updated_count, notification_count = auto_update_expired_batches(user_id, user_role)
        
        current_time = datetime.utcnow()
        
        # Get all batches grouped by status, filtered by user's managed batches
        fresh_batches = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        expired_batches = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.EXPIRED,
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        used_batches = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.USED,
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        def serialize_batch(batch):
            time_remaining = calculate_time_remaining(batch.expiry_date, current_time)
            return {
                'id': batch.id,
                'batch_number': batch.batch_number,
                'total_volume': float(batch.total_volume) if batch.total_volume else 0,
                'status': batch.status.value if batch.status else 'unknown',
                'production_date': batch.production_date.isoformat() if batch.production_date else None,
                'expiry_date': batch.expiry_date.isoformat() if batch.expiry_date else None,
                'created_at': batch.created_at.isoformat() if batch.created_at else None,
                'updated_at': batch.updated_at.isoformat() if batch.updated_at else None,
                'time_remaining': time_remaining,
                'hours_until_expiry': time_remaining['total_hours'] if time_remaining else None
            }
        
        result = {
            'fresh': [serialize_batch(batch) for batch in fresh_batches],
            'expired': [serialize_batch(batch) for batch in expired_batches],
            'used': [serialize_batch(batch) for batch in used_batches],
            'summary': {
                'fresh_count': len(fresh_batches),
                'expired_count': len(expired_batches),
                'used_count': len(used_batches),
                'total_fresh_volume': sum(batch.total_volume for batch in fresh_batches),
                'total_expired_volume': sum(batch.total_volume for batch in expired_batches),
                'total_used_volume': sum(batch.total_volume for batch in used_batches)
            },
            'auto_update_info': {
                'batches_auto_expired': updated_count,
                'notifications_sent': notification_count
            },
            'user_info': {
                'user_id': user_id,
                'user_role': user_role,
                'managed_batch_count': len(managed_batch_ids)
            }
        }
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving milk batches: {str(e)}'
        }), 500

@milk_expiry_bp.route('/milk-batches/expiry-analysis', methods=['GET'])
def expiry_analysis():
    """Analyze milk batches expiry status and provide insights with automatic expiry check, filtered by user"""
    try:
        # Get user_id and user_role from request
        user_id = request.args.get('user_id')
        user_role = request.args.get('user_role')
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid user ID format'
            }), 400
        
        # Get managed batch IDs for this user
        # Jika user_role adalah Admin, dapatkan semua batch
        if user_role and user_role.lower() == 'admin':
            managed_batch_ids = [batch.id for batch in MilkBatch.query.all()]
        else:
            managed_batch_ids = get_user_managed_batches(user_id)
        
        if not managed_batch_ids:
            return jsonify({
                'success': True,
                'data': {
                    'current_time': datetime.utcnow().isoformat(),
                    'expiring_soon_2_hours': [],
                    'overdue_expired': [],
                    'expiring_1_hour': [],
                    'expiring_4_hours': [],
                    'summary': {
                        'total_batches': 0,
                        'volume_expiring_soon': 0,
                        'volume_overdue': 0,
                        'critical_alerts': 0
                    },
                    'auto_update_info': {
                        'batches_auto_expired': 0,
                        'notifications_sent': 0
                    },
                    'user_info': {
                        'user_id': user_id,
                        'user_role': user_role,
                        'managed_batch_count': 0
                    }
                }
            }), 200
        
        # Automatically check and update expired batches for this user
        updated_count, notification_count = auto_update_expired_batches(user_id, user_role)
        
        current_time = datetime.utcnow()
        
        # Get batches expiring soon (within next 2 hours), filtered by user's managed batches
        expiring_soon_2_hours = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.expiry_date > current_time,
                MilkBatch.expiry_date <= current_time + timedelta(hours=2),
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        # Get overdue batches (already expired but still marked as fresh)
        overdue_expired = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.expiry_date <= current_time,
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        # Get batches expiring within 1 hour
        expiring_1_hour = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.expiry_date > current_time,
                MilkBatch.expiry_date <= current_time + timedelta(hours=1),
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        # Get batches expiring within 4 hours
        expiring_4_hours = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.expiry_date > current_time,
                MilkBatch.expiry_date <= current_time + timedelta(hours=4),
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).all()
        
        def serialize_batch_with_urgency(batch):
            time_remaining = calculate_time_remaining(batch.expiry_date, current_time)
            return {
                'id': batch.id,
                'batch_number': batch.batch_number,
                'total_volume': float(batch.total_volume) if batch.total_volume else 0,
                'status': batch.status.value if batch.status else 'unknown',
                'production_date': batch.production_date.isoformat() if batch.production_date else None,
                'expiry_date': batch.expiry_date.isoformat() if batch.expiry_date else None,
                'time_remaining': time_remaining,
                'hours_until_expiry': time_remaining['total_hours'] if time_remaining else None
            }
        
        # Calculate summary statistics
        volume_expiring_soon = sum(batch.total_volume for batch in expiring_soon_2_hours)
        volume_overdue = sum(batch.total_volume for batch in overdue_expired)
        critical_alerts = len(overdue_expired) + len(expiring_1_hour)
        
        result = {
            'current_time': current_time.isoformat(),
            'expiring_soon_2_hours': [serialize_batch_with_urgency(batch) for batch in expiring_soon_2_hours],
            'overdue_expired': [serialize_batch_with_urgency(batch) for batch in overdue_expired],
            'expiring_1_hour': [serialize_batch_with_urgency(batch) for batch in expiring_1_hour],
            'expiring_4_hours': [serialize_batch_with_urgency(batch) for batch in expiring_4_hours],
            'summary': {
                'total_batches': len(managed_batch_ids),
                'volume_expiring_soon': float(volume_expiring_soon),
                'volume_overdue': float(volume_overdue),
                'critical_alerts': critical_alerts
            },
            'auto_update_info': {
                'batches_auto_expired': updated_count,
                'notifications_sent': notification_count
            },
            'user_info': {
                'user_id': user_id,
                'user_role': user_role,
                'managed_batch_count': len(managed_batch_ids)
            }
        }
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error analyzing milk expiry: {str(e)}'
        }), 500

@milk_expiry_bp.route('/milk-batches/status/<status>', methods=['GET'])
def get_milk_batches_by_specific_status(status):
    """Get milk batches by specific status with pagination and automatic expiry check, filtered by user"""
    try:
        # Get parameters
        user_id = request.args.get('user_id')
        user_role = request.args.get('user_role')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid user ID format'
            }), 400
        
        # Validate status
        valid_statuses = ['fresh', 'expired', 'used']
        if status.lower() not in valid_statuses:
            return jsonify({
                'success': False,
                'message': f'Invalid status: {status}. Valid statuses are: {", ".join(valid_statuses)}'
            }), 400
        
        # Get managed batch IDs for this user
        # Jika user_role adalah Admin, dapatkan semua batch
        if user_role and user_role.lower() == 'admin':
            managed_batch_ids = [batch.id for batch in MilkBatch.query.all()]
        else:
            managed_batch_ids = get_user_managed_batches(user_id)
        
        if not managed_batch_ids:
            return jsonify({
                'success': True,
                'data': {
                    'batches': [],
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': 0,
                        'total_pages': 0
                    },
                    'auto_update_info': {
                        'batches_auto_expired': 0,
                        'notifications_sent': 0
                    },
                    'user_info': {
                        'user_id': user_id,
                        'user_role': user_role,
                        'managed_batch_count': 0
                    }
                }
            }), 200
        
        # Automatically check and update expired batches for this user
        updated_count, notification_count = auto_update_expired_batches(user_id, user_role)
        
        # Map status to enum
        status_map = {
            'fresh': MilkStatus.FRESH,
            'expired': MilkStatus.EXPIRED,
            'used': MilkStatus.USED
        }
        
        status_enum = status_map[status.lower()]
        
        # Build query with pagination
        current_time = datetime.utcnow()
        query = MilkBatch.query.filter(
            and_(
                MilkBatch.status == status_enum,
                MilkBatch.id.in_(managed_batch_ids)
            )
        ).order_by(MilkBatch.created_at.desc())
        
        # Get total count
        total = query.count()
        total_pages = (total + per_page - 1) // per_page
        
        # Apply pagination
        batches = query.offset((page - 1) * per_page).limit(per_page).all()
        
        def serialize_batch(batch):
            time_remaining = calculate_time_remaining(batch.expiry_date, current_time)
            return {
                'id': batch.id,
                'batch_number': batch.batch_number,
                'total_volume': float(batch.total_volume) if batch.total_volume else 0,
                'status': batch.status.value if batch.status else 'unknown',
                'production_date': batch.production_date.isoformat() if batch.production_date else None,
                'expiry_date': batch.expiry_date.isoformat() if batch.expiry_date else None,
                'created_at': batch.created_at.isoformat() if batch.created_at else None,
                'updated_at': batch.updated_at.isoformat() if batch.updated_at else None,
                'time_remaining': time_remaining,
                'hours_until_expiry': time_remaining['total_hours'] if time_remaining else None
            }
        
        result = {
            'batches': [serialize_batch(batch) for batch in batches],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': total_pages
            },
            'auto_update_info': {
                'batches_auto_expired': updated_count,
                'notifications_sent': notification_count
            },
            'user_info': {
                'user_id': user_id,
                'user_role': user_role,
                'managed_batch_count': len(managed_batch_ids)
            }
        }
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving {status} milk batches: {str(e)}'
        }), 500

@milk_expiry_bp.route('/milk-batches/update-expired', methods=['POST'])
def update_expired_milk_batches():
    """Update expired milk batches from FRESH to EXPIRED status with notifications, filtered by user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_role = data.get('user_role')
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid user ID format'
            }), 400
        
        current_time = datetime.utcnow()
        
        # Build query for expired batches
        query = MilkBatch.query.filter(
            and_(
                MilkBatch.status == MilkStatus.FRESH,
                MilkBatch.expiry_date <= current_time
            )
        )
        
        # Filter by user if user is not admin
        if user_role and user_role.lower() != 'admin':
            managed_batch_ids = get_user_managed_batches(user_id)
            if not managed_batch_ids:
                return jsonify({
                    'success': True,
                    'data': {
                        'updated_batches': [],
                        'updated_count': 0,
                        'total_volume_updated': 0,
                        'notifications_sent': 0,
                        'user_info': {
                            'user_id': user_id,
                            'user_role': user_role,
                            'managed_batch_count': 0
                        }
                    }
                }), 200
            query = query.filter(MilkBatch.id.in_(managed_batch_ids))
        
        expired_batches = query.all()
        
        # Update expired batches
        updated_batches = []
        total_volume_updated = 0
        
        for batch in expired_batches:
            batch.status = MilkStatus.EXPIRED
            batch.updated_at = current_time
            total_volume_updated += batch.total_volume if batch.total_volume else 0
            
            updated_batches.append({
                'id': batch.id,
                'batch_number': batch.batch_number,
                'total_volume': float(batch.total_volume) if batch.total_volume else 0,
                'expiry_date': batch.expiry_date.isoformat() if batch.expiry_date else None
            })
        
        if expired_batches:
            db.session.commit()
        
        # Send notifications
        notification_count = 0
        try:
            notification_count = check_milk_expiry_and_notify()
        except Exception as e:
            print(f"Error sending notifications: {str(e)}")
        
        result = {
            'updated_batches': updated_batches,
            'updated_count': len(expired_batches),
            'total_volume_updated': float(total_volume_updated),
            'notifications_sent': notification_count,
            'user_info': {
                'user_id': user_id,
                'user_role': user_role,
                'managed_batch_count': len(get_user_managed_batches(user_id)) if user_role and user_role.lower() != 'admin' else 'all'
            }
        }
        
        return jsonify({
            'success': True,
            'data': result,
            'message': f'Successfully updated {len(expired_batches)} expired milk batches'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error updating expired milk batches: {str(e)}'
        }), 500
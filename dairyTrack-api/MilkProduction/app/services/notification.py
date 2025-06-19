"""
Professional Notification Service

This module handles all notification logic for the Dairy Track system,
including milk production alerts, expiry warnings, and real-time notifications.
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Set, Tuple
import logging
import time
import html
import json
from functools import wraps

import pytz
from flask import current_app
from sqlalchemy import and_, func

from app.models.notification import Notification
from app.models.daily_milk_summary import DailyMilkSummary
from app.models.cows import Cow
from app.models.milk_batches import MilkBatch, MilkStatus
from app.models.users import User
from app.models.roles import Role
from app.models.user_cow_association import user_cow_association
from app.database.database import db
from app.socket import emit_notification


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class NotificationConfig:
    """Centralized configuration for notification system"""
    BATCH_SIZE: int = 100
    RATE_LIMIT_PER_USER: int = 50
    RATE_LIMIT_WINDOW_MINUTES: int = 60
    CLEANUP_RETENTION_DAYS: int = 30
    MAX_RETRY_ATTEMPTS: int = 3
    SOCKET_TIMEOUT_SECONDS: int = 30
    EXPIRY_WARNING_HOURS: int = 4
    TIMEZONE: str = 'Asia/Jakarta'
    ADMIN_ROLE_NAMES: Tuple[str, ...] = ('admin', 'administrator', 'Admin', 'Administrator')
    SUPERVISOR_ROLE_NAMES: Tuple[str, ...] = ('supervisor', 'Supervisor', 'mandor', 'Mandor')
    
    # Production thresholds
    LOW_PRODUCTION_THRESHOLD: float = 10.0
    HIGH_PRODUCTION_THRESHOLD: float = 25.0
    # Production change thresholds (percentage)
    PRODUCTION_INCREASE_THRESHOLD: float = 15.0  # 15% increase
    PRODUCTION_DECREASE_THRESHOLD: float = 15.0  # 15% decrease
    # Minimum volume to consider for production change notifications
    MIN_VOLUME_FOR_CHANGE_NOTIFICATION: float = 5.0  # 5L minimum volume for change notifications


class NotificationTypes:
    """Enumeration of notification types"""
    LOW_PRODUCTION = "low_production"
    HIGH_PRODUCTION = "high_production"
    MILK_EXPIRY = "milk_expiry"
    MILK_WARNING = "milk_warning"
    MISSING_MILKING = "missing_milking"  # New notification type
    PRODUCTION_INCREASE = "production_increase"  # Tambahkan ini
    PRODUCTION_DECREASE = "production_decrease"  # Tambahkan ini


class NotificationMessages:
    """Professional notification message templates"""
    
    @staticmethod
    def missing_milking(farm_name: str = "your farm") -> str:
        return (f"No milking activity recorded today at {farm_name}. "
                f"Please ensure milk production is recorded promptly.")
                
    @staticmethod
    def missing_milking_for_cows(cow_ids: List[str]) -> str:
        cow_list = ", ".join(cow_ids[:5])
        extra = f" and {len(cow_ids) - 5} more" if len(cow_ids) > 5 else ""
        return (f"Missing milking data: No records for cows {cow_list}{extra} today. "
                f"Please record milk production.")
    
    @staticmethod
    def low_production(cow_id: str, cow_name: str, volume: float) -> str:
        return (f"Production Alert: Cow {cow_id} ({cow_name}) produced {volume}L today. "
                f"Below standard threshold of {NotificationConfig.LOW_PRODUCTION_THRESHOLD}L.")
    
    @staticmethod
    def high_production(cow_id: str, cow_name: str, volume: float) -> str:
        return (f"Exceptional Production: Cow {cow_id} ({cow_name}) produced {volume}L today. "
                f"Exceeds standard threshold of {NotificationConfig.HIGH_PRODUCTION_THRESHOLD}L.")
    
    @staticmethod
    def production_increase(cow_id: str, cow_name: str, current_volume: float, 
                          previous_volume: float, percentage_change: float) -> str:
        return (f"Production Increase: Cow {cow_id} ({cow_name}) showed significant improvement. "
                f"Production increased from {previous_volume}L to {current_volume}L "
                f"({percentage_change:.1f}% increase). Excellent performance!")
    
    @staticmethod
    def production_decrease(cow_id: str, cow_name: str, current_volume: float, 
                          previous_volume: float, percentage_change: float) -> str:
        return (f"Production Decline: Cow {cow_id} ({cow_name}) showed concerning decrease. "
                f"Production dropped from {previous_volume}L to {current_volume}L "
                f"({percentage_change:.1f}% decrease). Requires attention.")
    
    @staticmethod
    def batch_expired(batch_number: str, volume: float, cow_name: str, expiry_time: str) -> str:
        return (f"Batch Expired: Batch {batch_number} ({volume}L from {cow_name}) "
                f"expired at {expiry_time}. Immediate action required.")
    
    @staticmethod
    def batch_warning(batch_number: str, volume: float, cow_name: str, 
                     hours_remaining: float, expiry_time: str) -> str:
        return (f"Expiry Warning: Batch {batch_number} ({volume}L from {cow_name}) "
                f"expires in {hours_remaining:.1f} hours at {expiry_time}. "
                f"Please process or utilize promptly.")


class RateLimiter:
    """Rate limiting functionality for notifications"""
    
    def __init__(self):
        self._user_limits: Dict[int, Dict[str, any]] = {}
    
    def is_rate_limited(self, user_id: int, 
                       limit: Optional[int] = None, 
                       window_minutes: Optional[int] = None) -> bool:
        """Check if user has exceeded notification rate limit"""
        limit = limit or NotificationConfig.RATE_LIMIT_PER_USER
        window_minutes = window_minutes or NotificationConfig.RATE_LIMIT_WINDOW_MINUTES
        
        current_time = datetime.now()
        
        if user_id not in self._user_limits:
            self._user_limits[user_id] = {
                'count': 0,
                'reset_time': current_time + timedelta(minutes=window_minutes)
            }
        
        user_data = self._user_limits[user_id]
        
        # Reset counter if window expired
        if current_time > user_data['reset_time']:
            user_data['count'] = 0
            user_data['reset_time'] = current_time + timedelta(minutes=window_minutes)
        
        if user_data['count'] >= limit:
            return True
        
        user_data['count'] += 1
        return False
    
    def cleanup_expired_limits(self) -> int:
        """Remove expired rate limit entries and return count"""
        current_time = datetime.now()
        expired_users = [
            user_id for user_id, data in self._user_limits.items()
            if current_time > data['reset_time']
        ]
        
        for user_id in expired_users:
            del self._user_limits[user_id]
        
        return len(expired_users)


class NotificationService:
    """Main notification service class"""
    
    def __init__(self):
        self.rate_limiter = RateLimiter()
        self.config = NotificationConfig()
    
    def get_timezone_aware_time(self) -> datetime:
        """Get current time in configured timezone"""
        timezone = pytz.timezone(self.config.TIMEZONE)
        return datetime.utcnow().replace(tzinfo=pytz.UTC).astimezone(timezone).replace(tzinfo=None)
    
    def sanitize_message(self, message: str) -> str:
        """Sanitize notification message content"""
        return html.escape(str(message))
    
    def get_admin_users(self) -> List[User]:
        """Retrieve all admin users from database"""
        try:
            admin_roles = Role.query.filter(
                Role.name.in_(self.config.ADMIN_ROLE_NAMES)
            ).all()
            
            if not admin_roles:
                return []
            
            admin_role_ids = [role.id for role in admin_roles]
            return User.query.filter(User.role_id.in_(admin_role_ids)).all()
            
        except Exception as e:
            logger.error(f"Failed to retrieve admin users: {e}")
            return []
    
    def get_supervisor_users(self) -> List[User]:
        """Retrieve all supervisor users from database"""
        try:
            supervisor_roles = Role.query.filter(
                Role.name.in_(self.config.SUPERVISOR_ROLE_NAMES)
            ).all()
            
            if not supervisor_roles:
                return []
            
            supervisor_role_ids = [role.id for role in supervisor_roles]
            return User.query.filter(User.role_id.in_(supervisor_role_ids)).all()
            
        except Exception as e:
            logger.error(f"Failed to retrieve supervisor users: {e}")
            return []
    
    def emit_notification_safely(self, user_id: int, notification_data: Dict) -> bool:
        """Emit notification with retry mechanism"""
        for attempt in range(self.config.MAX_RETRY_ATTEMPTS):
            try:
                emit_notification(user_id, notification_data)
                return True
            except Exception as e:
                if attempt == self.config.MAX_RETRY_ATTEMPTS - 1:
                    logger.error(f"Failed to emit notification to user {user_id} after {self.config.MAX_RETRY_ATTEMPTS} attempts: {e}")
                    return False
                time.sleep(0.5 * (attempt + 1))  # Exponential backoff
        return False
    
    def create_notification_record(self, user_id: int, cow_id: Optional[int], 
                                 message: str, notification_type: str,
                                 additional_data: Optional[Dict] = None) -> Optional[Notification]:
        """Create notification record in database"""
        try:
            notification = Notification(
                user_id=user_id,
                cow_id=cow_id,
                message=self.sanitize_message(message),
                type=notification_type,
                is_read=False,
                created_at=datetime.utcnow()
            )
            
            if additional_data:
                notification.additional_data = json.dumps(additional_data)
            
            db.session.add(notification)
            return notification
            
        except Exception as e:
            logger.error(f"Failed to create notification record: {e}")
            return None
    
    def send_notification_to_user(self, user_id: int, cow_id: Optional[int], 
                                message: str, notification_type: str,
                                check_date: Optional[date] = None) -> bool:
        """Send notification to specific user"""
        try:
            if self.rate_limiter.is_rate_limited(user_id):
                logger.warning(f"Rate limit exceeded for user {user_id}")
                return False
            
            # Handle production notifications (avoid duplicates)
            if check_date and notification_type in [NotificationTypes.LOW_PRODUCTION, 
                                                  NotificationTypes.HIGH_PRODUCTION,
                                                  NotificationTypes.PRODUCTION_INCREASE,
                                                  NotificationTypes.PRODUCTION_DECREASE]:
                if self._update_or_create_production_notification(
                    user_id, cow_id, message, notification_type, check_date
                ):
                    return self._emit_real_time_notification(user_id, cow_id, message, notification_type)
            else:
                # Create new notification for other types
                notification = self.create_notification_record(
                    user_id, cow_id, message, notification_type
                )
                if notification:
                    return self._emit_real_time_notification(user_id, cow_id, message, notification_type)
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to send notification to user {user_id}: {e}")
            return False
    
    def _update_or_create_production_notification(self, user_id: int, cow_id: int, 
                                                message: str, notification_type: str,
                                                check_date: date) -> bool:
        """Update existing or create new production notification"""
        try:
            day_start = datetime.combine(check_date, datetime.min.time())
            
            existing_notification = Notification.query.filter_by(
                user_id=user_id,
                cow_id=cow_id,
                type=notification_type
            ).filter(Notification.created_at >= day_start).first()
            
            if existing_notification:
                existing_notification.message = self.sanitize_message(message)
                existing_notification.is_read = False
                existing_notification.created_at = datetime.utcnow()
            else:
                notification = self.create_notification_record(
                    user_id, cow_id, message, notification_type
                )
                if not notification:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update/create production notification: {e}")
            return False
    
    def _emit_real_time_notification(self, user_id: int, cow_id: Optional[int], 
                                   message: str, notification_type: str) -> bool:
        """Emit real-time notification via socket"""
        notification_data = {
            'cow_id': cow_id,
            'message': message,
            'type': notification_type,
            'is_read': False,
            'created_at': datetime.now().isoformat()
        }
        return self.emit_notification_safely(user_id, notification_data)
    
    def check_milk_production_and_notify(self) -> int:
        """Check milk production levels and send notifications"""
        if not current_app:
            logger.warning("No application context available")
            return 0
        
        with current_app.app_context():
            try:
                today = date.today()
                yesterday = today - timedelta(days=1)
                
                daily_summaries = DailyMilkSummary.query.filter_by(date=today).all()
                
                if not daily_summaries:
                    logger.info("No daily summaries found for today")
                    return 0
                
                notification_count = 0
                
                for summary in daily_summaries:
                    # Check standard production thresholds
                    message, notification_type = self._analyze_production_level(summary)
                    
                    if message and notification_type:
                        count = self._create_production_notifications(
                            summary.cow_id, message, notification_type, today
                        )
                        notification_count += count
                    
                    # Check production changes for supervisors
                    change_count = self._check_production_changes_and_notify(summary, yesterday, today)
                    notification_count += change_count
                
                logger.info(f"Sent {notification_count} production notifications")
                return notification_count
                
            except Exception as e:
                logger.error(f"Error in production check: {e}")
                db.session.rollback()
                return 0
    
    def _check_production_changes_and_notify(self, current_summary: DailyMilkSummary, 
                                           yesterday: date, today: date) -> int:
        """Check for significant production changes and notify supervisors"""
        try:
            # Get yesterday's summary for the same cow
            yesterday_summary = DailyMilkSummary.query.filter_by(
                cow_id=current_summary.cow_id,
                date=yesterday
            ).first()
            
            if not yesterday_summary:
                # No previous data to compare
                return 0
            
            current_volume = current_summary.total_volume or 0
            previous_volume = yesterday_summary.total_volume or 0
            
            # Skip if volumes are too low to be meaningful
            if (current_volume < self.config.MIN_VOLUME_FOR_CHANGE_NOTIFICATION and 
                previous_volume < self.config.MIN_VOLUME_FOR_CHANGE_NOTIFICATION):
                return 0
            
            # Calculate percentage change (avoid division by zero)
            if previous_volume == 0:
                if current_volume > self.config.MIN_VOLUME_FOR_CHANGE_NOTIFICATION:
                    # New production started
                    percentage_change = 100.0
                else:
                    return 0
            else:
                percentage_change = ((current_volume - previous_volume) / previous_volume) * 100
            
            notification_count = 0
            message = None
            notification_type = None
            
            # Check for significant increase
            if percentage_change >= self.config.PRODUCTION_INCREASE_THRESHOLD:
                message = NotificationMessages.production_increase(
                    current_summary.cow.id, current_summary.cow.name,
                    current_volume, previous_volume, percentage_change
                )
                notification_type = NotificationTypes.PRODUCTION_INCREASE
                
            # Check for significant decrease
            elif percentage_change <= -self.config.PRODUCTION_DECREASE_THRESHOLD:
                message = NotificationMessages.production_decrease(
                    current_summary.cow.id, current_summary.cow.name,
                    current_volume, previous_volume, abs(percentage_change)
                )
                notification_type = NotificationTypes.PRODUCTION_DECREASE
            
            if message and notification_type:
                # Notify supervisors about production changes
                notification_count = self._notify_supervisors_about_production_change(
                    current_summary.cow_id, message, notification_type, today
                )
            
            return notification_count
            
        except Exception as e:
            logger.error(f"Error checking production changes for cow {current_summary.cow_id}: {e}")
            return 0
    
    def _notify_supervisors_about_production_change(self, cow_id: int, message: str, 
                                                  notification_type: str, check_date: date) -> int:
        """Notify supervisors about significant production changes"""
        try:
            notification_count = 0
            
            # Get all supervisors
            supervisor_users = self.get_supervisor_users()
            
            # Send notifications to supervisors
            for supervisor in supervisor_users:
                supervisor_message = f"Supervisor Alert: {message}"
                if self.send_notification_to_user(
                    supervisor.id, cow_id, supervisor_message, notification_type, check_date
                ):
                    notification_count += 1
            
            # Also notify admins about significant changes
            admin_users = self.get_admin_users()
            for admin_user in admin_users:
                admin_message = f"Admin Alert: {message}"
                if self.send_notification_to_user(
                    admin_user.id, cow_id, admin_message, notification_type, check_date
                ):
                    notification_count += 1
            
            if notification_count > 0:
                db.session.commit()
                
            return notification_count
            
        except Exception as e:
            logger.error(f"Failed to notify supervisors about production change: {e}")
            db.session.rollback()
            return 0
    
    def _analyze_production_level(self, summary: DailyMilkSummary) -> Tuple[Optional[str], Optional[str]]:
        """Analyze production level and return appropriate message"""
        if summary.total_volume < self.config.LOW_PRODUCTION_THRESHOLD:
            message = NotificationMessages.low_production(
                summary.cow.id, summary.cow.name, summary.total_volume
            )
            return message, NotificationTypes.LOW_PRODUCTION
        elif summary.total_volume > self.config.HIGH_PRODUCTION_THRESHOLD:
            message = NotificationMessages.high_production(
                summary.cow.id, summary.cow.name, summary.total_volume
            )
            return message, NotificationTypes.HIGH_PRODUCTION
        
        return None, None
    
    def _create_production_notifications(self, cow_id: int, message: str, 
                                       notification_type: str, check_date: date) -> int:
        """Create production notifications for managers and admins"""
        try:
            notification_count = 0
            
            # Get cow managers
            cow_managers = db.session.query(user_cow_association).filter_by(cow_id=cow_id).all()
            manager_user_ids = {manager.user_id for manager in cow_managers}
            
            # Send to cow managers
            for manager_relation in cow_managers:
                if self.send_notification_to_user(
                    manager_relation.user_id, cow_id, message, notification_type, check_date
                ):
                    notification_count += 1
            
            # Send to admin users (excluding those who are already managers)
            admin_users = self.get_admin_users()
            for admin_user in admin_users:
                if admin_user.id not in manager_user_ids:
                    admin_message = f"Admin Alert: {message}"
                    if self.send_notification_to_user(
                        admin_user.id, cow_id, admin_message, notification_type, check_date
                    ):
                        notification_count += 1
            
            if notification_count > 0:
                db.session.commit()
            
            return notification_count
            
        except Exception as e:
            logger.error(f"Failed to create production notifications: {e}")
            db.session.rollback()
            return 0
    
    def check_missing_milking_and_notify(self) -> int:
        """Check for missing milking data today and send notifications"""
        if not current_app:
            logger.warning("No application context available")
            return 0
        
        with current_app.app_context():
            try:
                today = date.today()
                current_time = self.get_timezone_aware_time()
                
                # Only run this check in the afternoon (after 12 PM)
                if current_time.hour < 12:
                    logger.info("Too early to check for missing milking activity")
                    return 0
                    
                # Get all active cows
                all_cows = Cow.query.filter_by(is_active=True).all()
                if not all_cows:
                    logger.info("No active cows found in the system")
                    return 0
                
                # Get cows with recorded milking data today
                cows_with_data = DailyMilkSummary.query.filter_by(date=today).with_entities(
                    DailyMilkSummary.cow_id
                ).all()
                cows_with_data_ids = {cow.cow_id for cow in cows_with_data}
                
                # Find cows without milking data
                cows_without_data = [cow for cow in all_cows if cow.id not in cows_with_data_ids]
                
                if not cows_without_data:
                    logger.info("All cows have milking data recorded today")
                    return 0
                    
                notification_count = 0
                
                # If we have specific cows without data
                if cows_without_data:
                    cow_ids = [str(cow.id) for cow in cows_without_data]
                    message = NotificationMessages.missing_milking_for_cows(cow_ids)
                else:
                    # Generic message if we can't determine specific cows
                    message = NotificationMessages.missing_milking()
                    
                # Notify farm managers, supervisors, and admins
                user_notified = set()
                
                # Notify cow managers
                for cow in cows_without_data:
                    managers = self._get_cow_managers(cow)
                    for manager in managers:
                        if manager.id in user_notified or self.rate_limiter.is_rate_limited(manager.id):
                            continue
                            
                        if self.create_notification(
                            manager.id, message, NotificationTypes.MISSING_MILKING, cow.id
                        ):
                            notification_count += 1
                            user_notified.add(manager.id)
                
                # Notify supervisors not already notified
                supervisor_users = self.get_supervisor_users()
                for supervisor in supervisor_users:
                    if supervisor.id in user_notified or self.rate_limiter.is_rate_limited(supervisor.id):
                        continue
                        
                    supervisor_message = f"Supervisor Alert: {message}"
                    if self.create_notification(
                        supervisor.id, supervisor_message, NotificationTypes.MISSING_MILKING
                    ):
                        notification_count += 1
                        user_notified.add(supervisor.id)
                
                # Notify admins not already notified
                admin_users = self.get_admin_users()
                for admin in admin_users:
                    if admin.id in user_notified or self.rate_limiter.is_rate_limited(admin.id):
                        continue
                        
                    admin_message = f"Admin Alert: {message}"
                    if self.create_notification(
                        admin.id, admin_message, NotificationTypes.MISSING_MILKING
                    ):
                        notification_count += 1
                        user_notified.add(admin.id)
                
                if notification_count > 0:
                    logger.info(f"Sent {notification_count} missing milking notifications")
                    
                return notification_count
                
            except Exception as e:
                logger.error(f"Error checking missing milking data: {e}")
                db.session.rollback()
                return 0
    
    def check_milk_expiry_and_notify(self) -> int:
        """Check milk expiry and send notifications"""
        if not current_app:
            logger.warning("No application context available")
            return 0
        
        with current_app.app_context():
            try:
                current_time = self.get_timezone_aware_time()
                warning_time = current_time + timedelta(hours=self.config.EXPIRY_WARNING_HOURS)
                
                fresh_batches = MilkBatch.query.filter(MilkBatch.status == 'FRESH').all()
                
                if not fresh_batches:
                    return 0
                
                expired_batches = [b for b in fresh_batches if b.expiry_date < current_time]
                warning_batches = [
                    b for b in fresh_batches 
                    if current_time <= b.expiry_date <= warning_time
                ]
                
                notification_count = 0
                notification_count += self._process_batch_notifications(
                    expired_batches, current_time, "expired"
                )
                notification_count += self._process_batch_notifications(
                    warning_batches, current_time, "warning"
                )
                
                if notification_count > 0:
                    db.session.commit()
                
                logger.info(f"Sent {notification_count} expiry notifications")
                return notification_count
                
            except Exception as e:
                logger.error(f"Error in expiry check: {e}")
                db.session.rollback()
                return 0
    
    def _process_batch_notifications(self, batches: List[MilkBatch], 
                                   current_time: datetime, batch_type: str) -> int:
        """Process batch notifications for managers and admins"""
        if not batches:
            return 0
        
        notification_count = 0
        admin_users = self.get_admin_users()
        
        for batch in batches:
            try:
                if batch_type == "expired":
                    batch.status = 'EXPIRED'
                
                affected_cows = self._get_affected_cows_from_batch(batch)
                
                for cow in affected_cows:
                    message = self._create_batch_message(batch, cow, current_time, batch_type)
                    notification_type = (NotificationTypes.MILK_EXPIRY if batch_type == "expired" 
                                       else NotificationTypes.MILK_WARNING)
                    
                    notified_users = set()
                    
                    # Notify cow managers
                    managers = self._get_cow_managers(cow)
                    notification_count += self._notify_managers(
                        managers, cow.id, message, notification_type, 
                        batch_type, batch.batch_number, notified_users
                    )
                    
                    # Notify admin users
                    notification_count += self._notify_admins(
                        admin_users, cow.id, message, notification_type,
                        batch_type, batch.batch_number, notified_users
                    )
                    
            except Exception as e:
                logger.error(f"Error processing batch {batch.id}: {e}")
                continue
        
        return notification_count
    
    def _get_affected_cows_from_batch(self, batch: MilkBatch) -> List[Cow]:
        """Get cows affected by batch expiry"""
        try:
            sessions = batch.milking_sessions
            if not sessions:
                return []
            
            cow_ids = set(session.cow_id for session in sessions)
            return [Cow.query.get(cow_id) for cow_id in cow_ids if Cow.query.get(cow_id)]
        except Exception as e:
            logger.error(f"Error getting affected cows: {e}")
            return []
    
    def _get_cow_managers(self, cow: Cow) -> List[User]:
        """Get managers for specific cow"""
        try:
            return cow.managers.all()
        except Exception as e:
            logger.error(f"Error getting cow managers: {e}")
            return []
    
    def _create_batch_message(self, batch: MilkBatch, cow: Cow, 
                            current_time: datetime, batch_type: str) -> str:
        """Create appropriate message for batch notification"""
        expiry_time = batch.expiry_date.strftime("%H:%M on %d/%m/%Y")
        
        if batch_type == "expired":
            return NotificationMessages.batch_expired(
                batch.batch_number, batch.total_volume, cow.name, expiry_time
            )
        else:
            time_remaining = batch.expiry_date - current_time
            hours_remaining = time_remaining.total_seconds() / 3600
            return NotificationMessages.batch_warning(
                batch.batch_number, batch.total_volume, cow.name, 
                hours_remaining, expiry_time
            )
    
    def _notify_managers(self, managers: List[User], cow_id: int, message: str,
                        notification_type: str, batch_type: str, batch_number: str,
                        notified_users: Set[int]) -> int:
        """Send notifications to cow managers"""
        count = 0
        for manager in managers:
            if (self.rate_limiter.is_rate_limited(manager.id) or
                (batch_type == "warning" and self._has_recent_warning(
                    manager.id, cow_id, batch_number))):
                continue
            
            notification = self.create_notification_record(
                manager.id, cow_id, message, notification_type
            )
            if notification and self._emit_real_time_notification(
                manager.id, cow_id, message, notification_type
            ):
                notified_users.add(manager.id)
                count += 1
        
        return count
    
    def _notify_admins(self, admin_users: List[User], cow_id: int, message: str,
                      notification_type: str, batch_type: str, batch_number: str,
                      notified_users: Set[int]) -> int:
        """Send notifications to admin users"""
        count = 0
        for admin_user in admin_users:
            if (admin_user.id in notified_users or
                self.rate_limiter.is_rate_limited(admin_user.id) or
                (batch_type == "warning" and self._has_recent_warning(
                    admin_user.id, cow_id, batch_number))):
                continue
            
            admin_message = f"Admin Alert: {message}"
            notification = self.create_notification_record(
                admin_user.id, cow_id, admin_message, notification_type
            )
            if notification and self._emit_real_time_notification(
                admin_user.id, cow_id, admin_message, notification_type
            ):
                count += 1
        
        return count
    
    def _has_recent_warning(self, user_id: int, cow_id: int, batch_number: str) -> bool:
        """Check if user already received warning for this batch today"""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        return Notification.query.filter_by(
            user_id=user_id,
            cow_id=cow_id,
            type=NotificationTypes.MILK_WARNING
        ).filter(
            Notification.message.contains(f"Batch {batch_number}"),
            Notification.created_at >= today_start
        ).first() is not None
    
    def create_notification(self, user_id: int, message: str, notification_type: str,
                          cow_id: Optional[int] = None, 
                          additional_data: Optional[Dict] = None) -> Optional[Notification]:
        """Create and send notification"""
        try:
            notification = self.create_notification_record(
                user_id, cow_id, message, notification_type, additional_data
            )
            
            if not notification:
                return None
            
            db.session.commit()
            
            notification_data = {
                'id': notification.id,
                'user_id': notification.user_id,
                'cow_id': notification.cow_id,
                'message': notification.message,
                'type': notification.type,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'additional_data': additional_data
            }
            
            self.emit_notification_safely(user_id, notification_data)
            return notification
            
        except Exception as e:
            logger.error(f"Failed to create notification: {e}")
            db.session.rollback()
            return None
    
    def create_admin_notification(self, message: str, notification_type: str,
                                cow_id: Optional[int] = None, 
                                additional_data: Optional[Dict] = None) -> int:
        """Create notification for all admin users"""
        try:
            admin_users = self.get_admin_users()
            notifications_created = 0
            
            for admin_user in admin_users:
                if self.rate_limiter.is_rate_limited(admin_user.id):
                    continue
                
                admin_message = f"System Alert: {message}"
                notification = self.create_notification(
                    admin_user.id, admin_message, notification_type, cow_id, additional_data
                )
                
                if notification:
                    notifications_created += 1
            
            return notifications_created
            
        except Exception as e:
            logger.error(f"Failed to create admin notifications: {e}")
            return 0
    
    def create_supervisor_notification(self, message: str, notification_type: str,
                                     cow_id: Optional[int] = None, 
                                     additional_data: Optional[Dict] = None) -> int:
        """Create notification for all supervisor users"""
        try:
            supervisor_users = self.get_supervisor_users()
            notifications_created = 0
            
            for supervisor in supervisor_users:
                if self.rate_limiter.is_rate_limited(supervisor.id):
                    continue
                
                supervisor_message = f"Supervisor Alert: {message}"
                notification = self.create_notification(
                    supervisor.id, supervisor_message, notification_type, cow_id, additional_data
                )
                
                if notification:
                    notifications_created += 1
            
            return notifications_created
            
        except Exception as e:
            logger.error(f"Failed to create supervisor notifications: {e}")
            return 0
    
    def cleanup_old_notifications(self) -> int:
        """Clean up old notifications and rate limits"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=self.config.CLEANUP_RETENTION_DAYS)
            
            deleted_count = Notification.query.filter(
                Notification.created_at < cutoff_date
            ).delete()
            
            db.session.commit()
            
            # Clean up rate limiter
            expired_limits = self.rate_limiter.cleanup_expired_limits()
            
            logger.info(f"Cleaned up {deleted_count} old notifications and {expired_limits} expired rate limits")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup notifications: {e}")
            db.session.rollback()
            return 0


# Global service instance
notification_service = NotificationService()

# Public API functions for backward compatibility
def check_missing_milking_and_notify() -> int:
    """Check for missing milking data and send notifications"""
    return notification_service.check_missing_milking_and_notify()

def check_milk_production_and_notify() -> int:
    """Check milk production and send notifications"""
    return notification_service.check_milk_production_and_notify()

def check_milk_expiry_and_notify() -> int:
    """Check milk expiry and send notifications"""
    return notification_service.check_milk_expiry_and_notify()

def create_notification(user_id: int, message: str, notification_type: str,
                       cow_id: Optional[int] = None, 
                       additional_data: Optional[Dict] = None) -> Optional[Notification]:
    """Create notification"""
    return notification_service.create_notification(
        user_id, message, notification_type, cow_id, additional_data
    )

def create_notification_for_admins(message: str, notification_type: str,
                                 cow_id: Optional[int] = None, 
                                 additional_data: Optional[Dict] = None) -> int:
    """Create notification for admins"""
    return notification_service.create_admin_notification(
        message, notification_type, cow_id, additional_data
    )

def create_notification_for_supervisors(message: str, notification_type: str,
                                      cow_id: Optional[int] = None, 
                                      additional_data: Optional[Dict] = None) -> int:
    """Create notification for supervisors"""
    return notification_service.create_supervisor_notification(
        message, notification_type, cow_id, additional_data
    )

def cleanup_old_notifications() -> int:
    """Clean up old notifications"""
    return notification_service.cleanup_old_notifications()

def emit_notification_to_user(user_id: int, notification: Notification):
    """Legacy function for backward compatibility"""
    notification_data = {
        'id': notification.id,
        'user_id': notification.user_id,
        'cow_id': notification.cow_id,
        'message': notification.message,
        'type': notification.type,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat() if notification.created_at else None
    }
    
    notification_service.emit_notification_safely(user_id, notification_data)
# FILE: topicBlog.py
from app import db

class TopicBlog(db.Model):
    __tablename__ = 'topic_blogs'

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relasi ke Blog
    blogs = db.relationship('Blog', backref='topic_blog', lazy=True, cascade="all, delete")

    def to_dict(self):
        return {
            'id': self.id,
            'topic': self.topic,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }

    def __repr__(self):
        return f"TopicBlog('{self.topic}', '{self.created_at}')"
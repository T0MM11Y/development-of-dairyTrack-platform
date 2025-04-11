# FILE: blog.py
from app import db

class Blog(db.Model):
    __tablename__ = 'blogs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    photo = db.Column(db.String(255), nullable=True)  # URL or file path to the photo
    topic_id = db.Column(db.Integer, db.ForeignKey('topic_blogs.id'), nullable=False)  # Foreign key to TopicBlog
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relasi ke TopicBlog
    topic = db.relationship('TopicBlog', backref='topic_relation', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'photo': self.photo,
            'topic_id': self.topic_id,
            'topic_name': self.topic.topic if self.topic else None,  # Tambahkan nama topic
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }

    def __repr__(self):
        return f"Blog('{self.title}', '{self.topic_id}')"
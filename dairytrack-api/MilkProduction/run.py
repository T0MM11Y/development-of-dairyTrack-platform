from app import app, db

if __name__ == '__main__':
    # Create tables if they do not exist
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)

    
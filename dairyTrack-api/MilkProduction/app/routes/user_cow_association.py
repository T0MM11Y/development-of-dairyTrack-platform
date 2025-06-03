from flask import Blueprint, request, jsonify
from app.models.users import User
from app.models.cows import Cow
from app.database.database import db

user_cow_bp = Blueprint('user_cow', __name__)

@user_cow_bp.route('/assign', methods=['POST'])
def assign_cow_to_user():
    """
    Menambahkan relasi antara User dan Cow.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        cow_id = data.get('cow_id')

        # Validasi input
        if not user_id or not cow_id:
            return jsonify({"error": "Missing required fields: user_id or cow_id"}), 400

        # Cari User dan Cow
        user = User.query.get(user_id)
        cow = Cow.query.get(cow_id)

        if not user:
            return jsonify({"error": "User not found"}), 404
        if not cow:
            return jsonify({"error": "Cow not found"}), 404

        # Tambahkan relasi
        user.managed_cows.append(cow)
        db.session.commit()

        return jsonify({"message": "Cow assigned to user successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500      


@user_cow_bp.route('/unassign', methods=['POST'])
def unassign_cow_from_user():
    """
    Menghapus relasi antara User dan Cow.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        cow_id = data.get('cow_id')

        # Validasi input
        if not user_id or not cow_id:
            return jsonify({"error": "Missing required fields: user_id or cow_id"}), 400

        # Cari User dan Cow
        user = User.query.get(user_id)
        cow = Cow.query.get(cow_id)

        if not user:
            return jsonify({"error": "User not found"}), 404
        if not cow:
            return jsonify({"error": "Cow not found"}), 404

        # Hapus relasi
        user.managed_cows.remove(cow)
        db.session.commit()

        return jsonify({"message": "Cow unassigned from user successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@user_cow_bp.route('/list/<int:user_id>', methods=['GET'])
def list_cows_by_user(user_id):
    """
    Mendapatkan daftar sapi yang dikelola oleh User tertentu.
    """
    try:
        # Cari User
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Ambil daftar sapi
        cows = user.managed_cows.all()
        cows_list = [{
            "id": cow.id,
            "name": cow.name,
            "birth": cow.birth,
            "breed": cow.breed,
            "lactation_phase": cow.lactation_phase,
            "weight": cow.weight,
            "gender": cow.gender
        } for cow in cows]

        return jsonify({"user_id": user_id, "cows": cows_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@user_cow_bp.route('/farmers-with-cows', methods=['GET'])
def get_farmers_with_cows():
    """
    Mendapatkan semua pengguna dengan role farmer beserta daftar sapi yang mereka kelola.
    """
    try:
        # Ambil semua pengguna dengan role farmer dari database
        farmers = User.query.filter_by(role_id=3).all()  # Ganti 3 dengan role_id untuk farmer jika berbeda

        # Format data pengguna dan sapi yang mereka kelola
        farmers_cows_list = []
        for farmer in farmers:
            cows = farmer.managed_cows.all()  # Ambil semua sapi yang dikelola oleh farmer
            cows_list = [{
                "id": cow.id,
                "name": cow.name,
                "birth": cow.birth,
                "breed": cow.breed,
                "lactation_phase": cow.lactation_phase,
                "weight": cow.weight,
                "gender": cow.gender,
                "farmerName": farmer.name if hasattr(farmer, 'name') and farmer.name else farmer.username  # Tambahkan farmerName
            } for cow in cows]

            farmers_cows_list.append({
                "user": {
                    "id": farmer.id,
                    "username": farmer.username,
                    "name": farmer.name if hasattr(farmer, 'name') else None,  # Tambahkan name juga
                    "email": farmer.email,
                    "contact": farmer.contact,
                    "religion": farmer.religion,
                    "role_id": farmer.role_id,
                    "token": farmer.token
                },
                "cows": cows_list
            })

        return jsonify({"farmers_with_cows": farmers_cows_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_cow_bp.route('/all-users-and-all-cows', methods=['GET'])
def get_all_users_and_all_cows():
    """
    Mendapatkan semua pengguna dan semua sapi dari database.
    """
    try:
        # Ambil semua pengguna dari database
        users = User.query.all()
        # Ambil semua sapi dari database
        cows = Cow.query.all()

        # Format data pengguna
        users_list = [{
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "contact": user.contact,
            "religion": user.religion,
            "role_id": user.role_id,
            "token": user.token
        } for user in users]

        # Format data sapi
        cows_list = [{
            "id": cow.id,
            "name": cow.name,
            "birth": cow.birth,
            "breed": cow.breed,
            "lactation_phase": cow.lactation_phase,
            "weight": cow.weight,
            "gender": cow.gender
        } for cow in cows]

        return jsonify({"users": users_list, "cows": cows_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@user_cow_bp.route('/cow-managers/<int:cow_id>', methods=['GET'])
def get_cow_managers(cow_id):
    """
    Mendapatkan daftar user yang mengelola sapi tertentu.
    """
    try:
        # Cari sapi
        cow = Cow.query.get(cow_id)
        if not cow:
            return jsonify({"error": "Cow not found"}), 404

        # Ambil daftar user yang mengelola sapi
        users = cow.managers.all()
        users_list = [{
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "contact": user.contact,
            "religion": user.religion,
            "role_id": user.role_id,
            "token": user.token
        } for user in users]

        return jsonify({"cow_id": cow_id, "managers": users_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

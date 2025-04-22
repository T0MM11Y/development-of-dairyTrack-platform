from flask import Blueprint, jsonify, request
from app import db
from app.models import Cow, Farmer  # Import Farmer modelfrom reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter  # Tambahkan impor ini
from reportlab.lib import colors
import pandas as pd
import io
from flask import Response

# Define Blueprint
cows_bp = Blueprint('cows', __name__)

@cows_bp.route('/cows', methods=['GET'])
def get_cows():
    cows = Cow.query.order_by(Cow.created_at.desc()).all()  # Mengurutkan berdasarkan created_at secara descending
    return jsonify([cow.to_dict() for cow in cows])

@cows_bp.route('/cows/<int:id>', methods=['GET'])
def get_cow(id):
    cow = Cow.query.get_or_404(id)
    return jsonify(cow.to_dict())

@cows_bp.route('/cows', methods=['POST'])
def create_cow():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Ambil farmer_id dari data
    farmer_id = data.get('farmer_id')
    if not farmer_id:
        return jsonify({'error': 'Farmer ID is required'}), 400

    # Cari Farmer berdasarkan farmer_id
    farmer = Farmer.query.get(farmer_id)
    if not farmer:
        return jsonify({'error': f'Farmer with ID {farmer_id} not found'}), 404

    # Buat objek Cow baru
    cow = Cow(
        farmer_id=farmer_id,
        name=data.get('name'),
        breed=data.get('breed'),
        birth_date=data.get('birth_date'),
        lactation_status=data.get('lactation_status', False),
        lactation_phase=data.get('lactation_phase'),
        weight_kg=data.get('weight_kg'),
        reproductive_status=data.get('reproductive_status'),
        gender=data.get('gender'),
        entry_date=data.get('entry_date')
    )

    # Tambahkan sapi ke database
    db.session.add(cow)

    # Perbarui total_cattle pada Farmer
    farmer.total_cattle = (farmer.total_cattle or 0) + 1

    # Simpan perubahan ke database
    db.session.commit()

    return jsonify(cow.to_dict()), 201

@cows_bp.route('/cows/<int:id>', methods=['PUT'])
def update_cow(id):
    cow = Cow.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    cow.farmer_id = data.get('farmer_id', cow.farmer_id)
    cow.name = data.get('name', cow.name)
    cow.breed = data.get('breed', cow.breed)
    cow.birth_date = data.get('birth_date', cow.birth_date)
    cow.lactation_status = data.get('lactation_status', cow.lactation_status)
    cow.lactation_phase = data.get('lactation_phase', cow.lactation_phase)
    cow.weight_kg = data.get('weight_kg', cow.weight_kg)
    cow.reproductive_status = data.get('reproductive_status', cow.reproductive_status)
    cow.gender = data.get('gender', cow.gender)
    cow.entry_date = data.get('entry_date', cow.entry_date)

    db.session.commit()
    return jsonify(cow.to_dict())

@cows_bp.route('/cows/<int:id>', methods=['DELETE'])
def delete_cow(id):
    cow = Cow.query.get_or_404(id)
    cow_name = cow.name  # Retrieve the cow's name before deletion  
    farmer_id = cow.farmer_id  # Get the farmer_id associated with the cow      

    # Cari Farmer berdasarkan farmer_id
    farmer = Farmer.query.get(farmer_id)
    if farmer and farmer.total_cattle > 0:
        farmer.total_cattle -= 1  # Kurangi total_cattle petani

    # Hapus sapi dari database
    db.session.delete(cow)
    db.session.commit()

    return jsonify({'message': f'Cow with name "{cow_name}" and id "{id}" has been successfully deleted!'})


@cows_bp.route('/cows/female', methods=['GET'])
def get_male_cows():
    # Query untuk mendapatkan semua sapi jantan
    male_cows = Cow.query.filter_by(gender='female').order_by(Cow.id).all()
    return jsonify([cow.to_dict() for cow in male_cows])


@cows_bp.route('/cows/biekenpedeedf', methods=['GET'])
def export_cows_pdf():
    cows = Cow.query.order_by(Cow.id).all()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(colors.HexColor("#2E86C1"))  # Blue color for header
    pdf.drawString(100, 750, "Cows Data Export")
    
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(colors.black)  # Black color for normal text
    pdf.drawString(100, 730, "ID")
    pdf.drawString(150, 730, "Name")
    pdf.drawString(300, 730, "Breed")
    pdf.drawString(400, 730, "Gender")
    
    pdf.setStrokeColor(colors.HexColor("#2E86C1"))  # Blue color for line
    pdf.line(100, 725, 500, 725)  # Line under header
    
    y = 710
    for idx, cow in enumerate(cows, start=1):  # Start ID from 1
        pdf.drawString(100, y, str(idx))
        pdf.drawString(150, y, cow.name or "N/A")
        pdf.drawString(300, y, cow.breed or "N/A")
        pdf.drawString(400, y, cow.gender or "N/A")
        y -= 20
        if y < 50:  # Create a new page if content exceeds
            pdf.showPage()
            pdf.setFont("Helvetica", 10)
            y = 750
    pdf.save()
    buffer.seek(0)
    return Response(
        buffer,
        mimetype='application/pdf',
        headers={
            "Content-Disposition": "attachment; filename=cows.pdf",
            "Content-Type": "application/pdf"
        }
    )

@cows_bp.route('/cows/exc', methods=['GET'])
def export_cows_excel():
    cows = Cow.query.order_by(Cow.id).all()
    data = []
    for idx, cow in enumerate(cows, start=1):  # Start ID from 1
        cow_dict = cow.to_dict()
        cow_dict['id'] = idx  # Override ID with new sequential ID
        
        # Gabungkan first_name dan last_name untuk mendapatkan nama lengkap
        farmer_name = f"{cow.farmer.first_name} {cow.farmer.last_name}" if cow.farmer else "Unknown"
        
        # Filter hanya kolom yang diperlukan
        filtered_cow_dict = {
            'id': cow_dict.get('id'),
            'farmer_name': farmer_name,  # Ganti farmer_id dengan farmer_name
            'name': cow_dict.get('name'),
            'breed': cow_dict.get('breed'),
            'birth_date': cow_dict.get('birth_date'),
            'lactation_status': cow_dict.get('lactation_status'),
            'lactation_phase': cow_dict.get('lactation_phase'),
            'weight_kg': cow_dict.get('weight_kg'),
            'reproductive_status': cow_dict.get('reproductive_status'),
            'gender': cow_dict.get('gender'),
            'entry_date': cow_dict.get('entry_date')
        }
        data.append(filtered_cow_dict)
        
        # Pastikan semua nilai dalam filtered_cow_dict adalah tipe data yang didukung
        for key, value in filtered_cow_dict.items():
            if isinstance(value, list):  # Ubah list menjadi string
                filtered_cow_dict[key] = ', '.join(map(str, value))
        
        data.append(filtered_cow_dict)
    
    df = pd.DataFrame(data)
    
    # Rename columns for better readability
    df.rename(columns={
        'id': 'ID',
        'farmer_name': 'Farmer Name',  # Ubah header kolom
        'name': 'Name',
        'breed': 'Breed',
        'birth_date': 'Birth Date',
        'lactation_status': 'Lactation Status',
        'lactation_phase': 'Lactation Phase',
        'weight_kg': 'Weight (kg)',
        'reproductive_status': 'Reproductive Status',
        'gender': 'Gender',
        'entry_date': 'Entry Date'
    }, inplace=True)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Cows')
        
        # Autofit columns and add formatting
        workbook = writer.book
        worksheet = writer.sheets['Cows']
        
        # Define header format
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'center',
            'fg_color': '#2E86C1',  # Blue background
            'font_color': 'white',
            'border': 1
        })
        
        # Apply header format
        for col_num, value in enumerate(df.columns):
            worksheet.write(0, col_num, value, header_format)
        
        # Autofit columns
        for idx, col in enumerate(df.columns):
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.set_column(idx, idx, max_len)
        
        # Add border to data cells
        cell_format = workbook.add_format({'border': 1})
        for row_num in range(1, len(df) + 1):
            for col_num in range(len(df.columns)):
                worksheet.write(row_num, col_num, df.iloc[row_num - 1, col_num], cell_format)
    
    output.seek(0)
    return Response(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            "Content-Disposition": "attachment; filename=cows.xlsx",
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    )
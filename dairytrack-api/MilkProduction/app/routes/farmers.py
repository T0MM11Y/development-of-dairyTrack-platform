from flask import Blueprint, jsonify, request, Response
import pandas as pd
import io
from app import db
from app.models import Farmer
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Blueprint untuk Farmer
farmers_bp = Blueprint('farmers', __name__)

# Endpoint untuk mendapatkan semua data petani
@farmers_bp.route('/farmers', methods=['GET'])
def get_farmers():
    farmers = Farmer.query.order_by(Farmer.id).all()
    return jsonify([farmer.to_dict() for farmer in farmers])

# Endpoint untuk mendapatkan data petani berdasarkan ID
@farmers_bp.route('/farmers/<int:id>', methods=['GET'])
def get_farmer(id):
    farmer = Farmer.query.get_or_404(id)
    return jsonify(farmer.to_dict())

# Endpoint untuk membuat data petani baru
@farmers_bp.route('/farmers', methods=['POST'])
def create_farmer():
    data = request.get_json()

    new_farmer = Farmer(
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        birth_date=data.get('birth_date'),
        contact=data.get('contact'),
        religion=data.get('religion'),
        address=data.get('address'),
        gender=data.get('gender'),
        total_cattle=data.get('total_cattle', 0),
        join_date=data.get('join_date'),
        status=data.get('status')
    )
    # Hash the password using the set_password method
    new_farmer.set_password(data.get('password'))

    db.session.add(new_farmer)
    db.session.commit()
    return jsonify({ 'message': 'Farmer created successfully', 'data': new_farmer.to_dict(), 'status': 201}), 201

# Endpoint untuk memperbarui data petani berdasarkan ID
@farmers_bp.route('/farmers/<int:id>', methods=['PUT'])
def update_farmer(id):
    farmer = Farmer.query.get_or_404(id)
    data = request.get_json()

    farmer.email = data.get('email', farmer.email)
    farmer.first_name = data.get('first_name', farmer.first_name)
    farmer.last_name = data.get('last_name', farmer.last_name)
    farmer.birth_date = data.get('birth_date', farmer.birth_date)
    farmer.contact = data.get('contact', farmer.contact)
    farmer.religion = data.get('religion', farmer.religion)
    farmer.address = data.get('address', farmer.address)
    farmer.gender = data.get('gender', farmer.gender)
    farmer.total_cattle = data.get('total_cattle', farmer.total_cattle)
    farmer.join_date = data.get('join_date', farmer.join_date)
    farmer.status = data.get('status', farmer.status)

    db.session.commit()
    return jsonify({ 'message': 'Farmer updated successfully', 'data': farmer.to_dict(), 'status': 200}), 200

# Endpoint untuk menghapus data petani berdasarkan ID
@farmers_bp.route('/farmers/<int:id>', methods=['DELETE'])
def delete_farmer(id):
    farmer = Farmer.query.get_or_404(id)
    db.session.delete(farmer)
    db.session.commit()
    return jsonify({'message': 'Farmer has been deleted!', 'status': 200}), 200
    
@farmers_bp.route('/farmers/biekenpedeedf', methods=['GET'])
def export_farmers_pdf():
    farmers = Farmer.query.order_by(Farmer.id).all()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(colors.HexColor("#2E86C1"))  # Warna biru untuk header
    pdf.drawString(100, 750, "Farmers Data Export")
    
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(colors.black)  # Warna hitam untuk teks biasa
    pdf.drawString(100, 730, "ID")
    pdf.drawString(150, 730, "Name")
    pdf.drawString(300, 730, "Email")
    
    pdf.setStrokeColor(colors.HexColor("#2E86C1"))  # Warna biru untuk garis
    pdf.line(100, 725, 500, 725)  # Line under header
    
    y = 710
    for idx, farmer in enumerate(farmers, start=1):  # Start ID from 1
        pdf.drawString(100, y, str(idx))
        pdf.drawString(150, y, f"{farmer.first_name} {farmer.last_name}")
        pdf.drawString(300, y, farmer.email)
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
            "Content-Disposition": "attachment; filename=farmers.pdf",
            "Content-Type": "application/pdf"
        }
    )
@farmers_bp.route('/farmers/export/exc', methods=['GET'])
def export_farmers_excel():
    farmers = Farmer.query.order_by(Farmer.id).all()
    data = []
    for idx, farmer in enumerate(farmers, start=1):  # Start ID from 1
        farmer_dict = farmer.to_dict()
        farmer_dict['id'] = idx  # Override ID with new sequential ID
        data.append(farmer_dict)
    
    df = pd.DataFrame(data)
    
    # Rename columns for better readability
    df.rename(columns={
        'id': 'ID',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'email': 'Email'
    }, inplace=True)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Farmers')
        
        # Autofit columns and add formatting
        workbook = writer.book
        worksheet = writer.sheets['Farmers']
        
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
            "Content-Disposition": "attachment; filename=farmers.xlsx",
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    )
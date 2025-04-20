from flask import Blueprint, jsonify, request, Response
from app import db
from app.models import Supervisor, Farmer, Admin
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
import pandas as pd

# Blueprint untuk Supervisor
supervisors_bp = Blueprint('supervisors', __name__)

@supervisors_bp.route('/supervisors', methods=['POST'])
def create_supervisor():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400  

    new_supervisor = Supervisor(
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        contact=data.get('contact'),
        password=data.get('password'),
        gender=data.get('gender')  # Tambahkan gender
    )
    # Hash the password using the set_password method
    new_supervisor.set_password(data.get('password'))

    db.session.add(new_supervisor)
    db.session.commit()
    return jsonify({'message': 'Supervisor created successfully', 'data': new_supervisor.to_dict() , 'status': 201}), 201

@supervisors_bp.route('/supervisors/<int:id>', methods=['PUT'])
def update_supervisor(id):
    supervisor = Supervisor.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    supervisor.email = data.get('email', supervisor.email)
    supervisor.first_name = data.get('first_name', supervisor.first_name)
    supervisor.last_name = data.get('last_name', supervisor.last_name)
    supervisor.contact = data.get('contact', supervisor.contact)
    supervisor.gender = data.get('gender', supervisor.gender)  # Tambahkan gender

    db.session.commit()
    return jsonify({'message': 'Supervisor updated successfully', 'data': supervisor.to_dict(), 'status': 200}), 200

@supervisors_bp.route('/supervisors', methods=['GET'])
def get_supervisors():
    supervisors = Supervisor.query.order_by(Supervisor.updated_at.desc()).all()
    return jsonify([supervisor.to_dict() for supervisor in supervisors])

@supervisors_bp.route('/supervisors/<int:id>', methods=['GET'])
def get_supervisor(id):
    supervisor = Supervisor.query.get_or_404(id)
    return jsonify(supervisor.to_dict())

@supervisors_bp.route('/supervisors/<int:id>', methods=['DELETE'])
def delete_supervisor(id):
    supervisor = Supervisor.query.get_or_404(id)
    db.session.delete(supervisor)
    db.session.commit()
    return jsonify({'message': 'Supervisor has been deleted!', 'status': 200}), 200


@supervisors_bp.route('/supervisors/biekenpedeedf', methods=['GET'])
def export_supervisors_pdf():
    supervisors = Supervisor.query.order_by(Supervisor.id).all()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(colors.HexColor("#2E86C1"))  # Blue color for header
    pdf.drawString(100, 750, "Supervisors Data Export")
    
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(colors.black)  # Black color for normal text
    pdf.drawString(100, 730, "ID")
    pdf.drawString(150, 730, "First Name")
    pdf.drawString(300, 730, "Last Name")
    pdf.drawString(400, 730, "Email")
    
    pdf.setStrokeColor(colors.HexColor("#2E86C1"))  # Blue color for line
    pdf.line(100, 725, 500, 725)  # Line under header
    
    y = 710
    for idx, supervisor in enumerate(supervisors, start=1):
        pdf.drawString(100, y, str(idx))
        pdf.drawString(150, y, supervisor.first_name or "N/A")
        pdf.drawString(300, y, supervisor.last_name or "N/A")
        pdf.drawString(400, y, supervisor.email or "N/A")
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
            "Content-Disposition": "attachment; filename=supervisors.pdf",
            "Content-Type": "application/pdf"
        }
    )

@supervisors_bp.route('/supervisors/exc', methods=['GET'])
def export_supervisors_excel():
    supervisors = Supervisor.query.order_by(Supervisor.id).all()
    data = []
    for idx, supervisor in enumerate(supervisors, start=1):
        data.append({
            'ID': idx,
            'First Name': supervisor.first_name,
            'Last Name': supervisor.last_name,
            'Email': supervisor.email,
            'Gender': supervisor.gender,
            'Contact': supervisor.contact
        })
    
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Supervisors')
        
        # Autofit columns and add formatting
        workbook = writer.book
        worksheet = writer.sheets['Supervisors']
        
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
            "Content-Disposition": "attachment; filename=supervisors.xlsx",
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    )
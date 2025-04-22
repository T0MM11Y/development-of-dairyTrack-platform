from flask import Blueprint, jsonify, request, Response
from app import db
from app.models import RawMilk
from datetime import datetime, timedelta
import pytz
from app.models import Notification
import io
import pandas as pd
from app.models import RawMilk, Cow  # Tambahkan Cow di sini
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# Timezone lokal (misalnya, Asia/Jakarta)
local_tz = pytz.timezone('Asia/Jakarta')

# Define Blueprint
raw_milks_bp = Blueprint('raw_milks', __name__)


@raw_milks_bp.route('/raw_milks', methods=['GET'])
def get_raw_milks():
    raw_milks = RawMilk.query.order_by(RawMilk.id).all()
    result = []
    for raw_milk in raw_milks:
        raw_milk_dict = raw_milk.to_dict()
        
        # Filter data dengan nilai null
        if None in raw_milk_dict.values():
            continue  # Lewati data dengan nilai null
        
        result.append(raw_milk_dict)
    return jsonify(result)
    


@raw_milks_bp.route('/raw_milks/<int:id>', methods=['GET'])
def get_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    return jsonify(raw_milk.to_dict())


@raw_milks_bp.route('/raw_milks', methods=['POST'])
def create_raw_milk():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        production_time = datetime.fromisoformat(data.get('production_time'))
        if production_time.tzinfo is None:
            production_time = local_tz.localize(production_time)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid or missing production_time'}), 400

    # Set expiration time to 8 hours from production time
    expiration_time = production_time + timedelta(hours=8)
    current_time = datetime.now(local_tz)

    # Ambil entri terakhir berdasarkan cow_id dan urutkan berdasarkan waktu produksi
    last_raw_milk = RawMilk.query.filter_by(cow_id=data.get('cow_id')).order_by(RawMilk.production_time.desc()).first()

    # Default previous_volume adalah 0
    previous_volume = 0.0

    # Jika ada entri sebelumnya, periksa apakah masih di hari yang sama
    if last_raw_milk:
        last_production_date = last_raw_milk.production_time.astimezone(local_tz).date()
        current_production_date = production_time.astimezone(local_tz).date()

        if last_production_date == current_production_date:
            previous_volume = last_raw_milk.volume_liters

    # Hitung waktu tersisa
    time_left = max((expiration_time - current_time).total_seconds(), 0)

    raw_milk = RawMilk(
        cow_id=data.get('cow_id'),
        production_time=production_time,
        volume_liters=data.get('volume_liters'),
        previous_volume=previous_volume,  # Gunakan previous_volume yang dihitung
        status=data.get('status', 'fresh'),
        session=data.get('session'),
        daily_total_id=data.get('daily_total_id'),
        available_stocks=data.get('available_stocks', data.get('volume_liters')),
        expiration_time=expiration_time
    )

    db.session.add(raw_milk)
    db.session.commit()
    response_data = raw_milk.to_dict()
    response_data['time_left'] = time_left
    return jsonify(response_data), 201

@raw_milks_bp.route('/raw_milks/<int:id>', methods=['PUT'])
def update_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    raw_milk.cow_id = data.get('cow_id', raw_milk.cow_id)
    raw_milk.production_time = data.get('production_time', raw_milk.production_time)
    raw_milk.volume_liters = data.get('volume_liters', raw_milk.volume_liters)
    raw_milk.previous_volume = float(data.get('previous_volume', raw_milk.previous_volume))
    raw_milk.status = data.get('status', raw_milk.status)
    raw_milk.session = data.get('session', raw_milk.session)
    raw_milk.available_stocks = data.get('available_stocks', raw_milk.available_stocks)

    db.session.commit()
    return jsonify(raw_milk.to_dict())
    
@raw_milks_bp.route('/raw_milks/cow/<int:cow_id>', methods=['GET'])
def get_raw_milks_by_cow_id(cow_id):
    raw_milks = RawMilk.query.filter_by(cow_id=cow_id).order_by(RawMilk.id).all()
    if not raw_milks:
        return jsonify({'message': f'No raw milk records found for cow_id {cow_id}'}), 404

    result = [raw_milk.to_dict() for raw_milk in raw_milks]
    return jsonify(result)    

@raw_milks_bp.route('/raw_milks/expired_status', methods=['GET'])
def get_all_raw_milks_with_expired_status():
    # Ambil waktu saat ini dengan timezone lokal
    current_time = datetime.now(local_tz)  # Offset-aware datetime

    # Ambil semua data RawMilk
    raw_milks = RawMilk.query.order_by(RawMilk.id).all()

    # Buat daftar hasil dengan status expired
    result = []
    for raw_milk in raw_milks:
        # Pastikan expiration_time juga offset-aware
        expiration_time = raw_milk.expiration_time
        if expiration_time.tzinfo is None:
            expiration_time = expiration_time.replace(tzinfo=local_tz)

        # Periksa apakah sudah expired
        is_expired = expiration_time < current_time

        # Ambil nama sapi dari relasi
        cow_name = raw_milk.cow.name if raw_milk.cow else None

        result.append({
            'id': raw_milk.id,
            'cow_id': raw_milk.cow_id,
            'cow_name': cow_name,  # Tambahkan nama sapi
            'production_time': raw_milk.production_time.isoformat(),
            'expiration_time': expiration_time.isoformat(),
            'session': raw_milk.session,
            'is_expired': is_expired,
            'status': raw_milk.status,
            'volume_liters': raw_milk.volume_liters,
            'available_stocks': raw_milk.available_stocks
        })

    return jsonify(result), 200

@raw_milks_bp.route('/raw_milks/today_last_session/<int:cow_id>', methods=['GET'])
def get_today_last_session_by_cow_id(cow_id):
    # Get today's date in YYYY-MM-DD format
    today = datetime.utcnow().date()

    # Query RawMilk entries for today and the given cow_id, and get the maximum session
    last_session = db.session.query(db.func.max(RawMilk.session)).filter(
        RawMilk.cow_id == cow_id,
        db.func.date(RawMilk.production_time) == today
    ).scalar()

    # If no sessions are found, return 0 as default
    if last_session is None:
        last_session = 0

    # Return the last session as a JSON response
    return jsonify({'cow_id': cow_id, 'date': str(today), 'session': last_session}), 200

@raw_milks_bp.route('/raw_milks/<int:id>/is_expired', methods=['GET'])
def check_raw_milk_expired(id):
    # Perbarui semua entri yang sudah kedaluwarsa di database menggunakan bulk update
    current_time = datetime.now(local_tz)  # Offset-aware datetime
    RawMilk.query.filter(
        RawMilk.expiration_time < current_time,
        RawMilk.is_expired == False
    ).update(
        {"is_expired": True, "status": "expired"},
        synchronize_session=False
    )
    db.session.commit()

    # Ambil entri raw milk berdasarkan ID
    raw_milk = RawMilk.query.get_or_404(id)

    # Hitung waktu tersisa atau tandai sebagai expired
    expiration_time = raw_milk.expiration_time
    if expiration_time.tzinfo is None:
        expiration_time = local_tz.localize(expiration_time)

    time_remaining = None if raw_milk.is_expired else expiration_time - current_time

    return jsonify({
        'id': raw_milk.id,
        'cow_id': raw_milk.cow_id,
        'expiration_time': raw_milk.expiration_time.isoformat(),
        'is_expired': raw_milk.is_expired,
        'status': raw_milk.status,
        'time_remaining': str(time_remaining) if time_remaining else "Expired"
    }), 200

@raw_milks_bp.route('/raw_milks/<int:id>', methods=['DELETE'])
def delete_raw_milk(id):
    raw_milk = RawMilk.query.get_or_404(id)
    db.session.delete(raw_milk)
    db.session.commit()
    return jsonify({'message': 'Raw milk production has been deleted!'})

@raw_milks_bp.route('/raw_milks/freshness_notifications', methods=['GET'])
def get_freshness_notifications():
    current_time = datetime.now(local_tz)  # Current time with timezone
    raw_milks = RawMilk.query.all()
    
    FRESHNESS_THRESHOLD = timedelta(hours=4)  # 4 hours before expiration
    notifications = []

    for raw_milk in raw_milks:
        expiration_time = raw_milk.expiration_time
        if expiration_time.tzinfo is None:
            expiration_time = local_tz.localize(expiration_time)
        
        time_remaining = expiration_time - current_time

        # Check if the milk is nearing expiration (within 4 hours) and not expired
        if timedelta(0) < time_remaining <= FRESHNESS_THRESHOLD and not raw_milk.is_expired:
            # Convert time_remaining to a human-readable format
            hours, remainder = divmod(time_remaining.seconds, 3600)
            minutes = remainder // 60
            human_readable_time = f"{hours} hours {minutes} minutes"

            message = f"Milk nearing expiration: {human_readable_time} remaining until expiration."

            # Check if a notification already exists for this raw milk
            existing_notification = Notification.query.filter_by(
                cow_id=raw_milk.cow_id,
                date=current_time.date(),
                message=message
            ).first()

            if existing_notification:
                existing_notification.message = message
            else:
                notification = Notification(
                    cow_id=raw_milk.cow_id,
                    date=current_time.date(),
                    message=message
                )
                db.session.add(notification)

            # Ensure raw_milk.created_at is timezone-aware
            created_at = raw_milk.created_at
            if created_at.tzinfo is None:
                created_at = local_tz.localize(created_at)

            # Calculate how long ago the milk record was created
            time_since_creation = current_time - created_at
            hours_ago, remainder = divmod(time_since_creation.total_seconds(), 3600)
            minutes_ago = remainder // 60
            human_readable_creation_time = f"{int(hours_ago)} hours {int(minutes_ago)} minutes ago"

            notifications.append({
                'cow_id': raw_milk.cow_id,
                'id': raw_milk.id,
                'expiration_time': expiration_time.isoformat(),
                'time_remaining': human_readable_time,
                'message': message,
                'date': human_readable_creation_time,
                'name': raw_milk.cow.name if raw_milk.cow else None,
            })

    db.session.commit()

    if not notifications:
        return jsonify({'message': 'No milk nearing expiration.'}), 200

    return jsonify({'notifications': notifications}), 200

@raw_milks_bp.route('/raw_milks/biekenpedeedf', methods=['GET'])
def export_raw_milks_pdf():
    raw_milks = RawMilk.query.order_by(RawMilk.id).all()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    # Header
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(colors.HexColor("#2E86C1"))  # Blue color for header
    pdf.drawString(100, 750, "Raw Milk Data Export")

    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(colors.white)  # White color for text
    pdf.drawString(100, 730, "ID")
    pdf.drawString(150, 730, "Nama Sapi")
    pdf.drawString(250, 730, "Volume (Liters)")
    pdf.drawString(350, 730, "Production Time")
    pdf.drawString(500, 730, "Status")

    pdf.setStrokeColor(colors.HexColor("#2E86C1"))  # Blue color for line
    pdf.line(100, 725, 550, 725)  # Line under header

    y = 710
    for idx, raw_milk in enumerate(raw_milks, start=1):
        # Alternate row colors
        if idx % 2 == 0:
            pdf.setFillColor(colors.HexColor("#F2F3F4"))  # Light gray for even rows
        else:
            pdf.setFillColor(colors.white)  # White for odd rows

        pdf.rect(100, y - 10, 450, 20, fill=1, stroke=0)  # Background for row

        pdf.setFillColor(colors.black)  # Black color for text
        pdf.drawString(100, y, str(idx))
        pdf.drawString(150, y, raw_milk.cow.name)  # Replace cow_id with cow.name
        pdf.drawString(250, y, f"{raw_milk.volume_liters:.2f}")
        pdf.drawString(350, y, raw_milk.production_time.strftime('%Y-%m-%d %H:%M:%S'))
        pdf.drawString(500, y, raw_milk.status)
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
            "Content-Disposition": "attachment; filename=raw_milks.pdf",
            "Content-Type": "application/pdf"
        }
    )

@raw_milks_bp.route('/raw_milks/exc', methods=['GET'])
def export_raw_milks_excel():
    raw_milks = RawMilk.query.order_by(RawMilk.id).all()
    data = []
    for idx, raw_milk in enumerate(raw_milks, start=1):
        data.append({
            'ID': idx,
            'Nama Sapi': raw_milk.cow.name,  # Replace cow_id with cow.name
            'Volume (Liters)': raw_milk.volume_liters,
            'Production Time': raw_milk.production_time.strftime('%Y-%m-%d %H:%M:%S'),
            'Status': raw_milk.status
        })

    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='RawMilks')

        # Autofit columns and add formatting
        workbook = writer.book
        worksheet = writer.sheets['RawMilks']

        # Define header format
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'center',
            'fg_color': '#2E86C1',  # Blue background
            'font_color': 'white',
            'border': 1
        })

        # Define row formats
        even_row_format = workbook.add_format({'bg_color': '#F2F3F4', 'border': 1})  # Light gray for even rows
        odd_row_format = workbook.add_format({'bg_color': '#FFFFFF', 'border': 1})  # White for odd rows

        # Apply header format
        for col_num, value in enumerate(df.columns):
            worksheet.write(0, col_num, value, header_format)

        # Autofit columns
        for idx, col in enumerate(df.columns):
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.set_column(idx, idx, max_len)

        # Add striped rows
        for row_num in range(1, len(df) + 1):
            row_format = even_row_format if row_num % 2 == 0 else odd_row_format
            for col_num in range(len(df.columns)):
                worksheet.write(row_num, col_num, df.iloc[row_num - 1, col_num], row_format)

    output.seek(0)
    return Response(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            "Content-Disposition": "attachment; filename=raw_milks.xlsx",
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    )

@raw_milks_bp.route('/raw_milks/raw_milk_data', methods=['GET'])
def get_cow_raw_milk_data():
    # Query data RawMilk dengan join ke tabel Cow
    raw_milks = RawMilk.query.join(Cow).order_by(RawMilk.production_time.desc()).all()

    # Format data untuk response
    result = []
    for raw_milk in raw_milks:
        cow = raw_milk.cow  # Relasi ke tabel Cow
        result.append({
            'name': cow.name if cow else "Unknown",
            'production_time': raw_milk.production_time.strftime('%Y-%m-%d %H:%M:%S'),
            'volume_liters': raw_milk.volume_liters,
            'lactation_phase': cow.lactation_phase if cow else "Unknown",
            'lactation_status': cow.lactation_status if cow else False,
            'session': raw_milk.session,
        })

    return jsonify(result), 200
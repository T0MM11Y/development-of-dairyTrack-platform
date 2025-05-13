from flask import Blueprint, request, jsonify
from app.models.milking_sessions import MilkingSession
from app.models.milk_batches import MilkBatch, MilkStatus
from app.models.daily_milk_summary import DailyMilkSummary
from app.database.database import db
from datetime import datetime, date, timedelta
from sqlalchemy import func
from fpdf import FPDF
from flask import send_file
from io import BytesIO
import pandas as pd

milk_production_bp = Blueprint('milk_production', __name__)

# MilkingSession routes
@milk_production_bp.route('/milking-sessions', methods=['POST'])
def add_milking_session():
    data = request.json
    
    try:
        # Create a new milk batch automatically
        new_batch = MilkBatch(
            batch_number=f"BATCH-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            total_volume=data['volume'],
            status=MilkStatus.FRESH,
            production_date=datetime.fromisoformat(data.get('milking_time', datetime.utcnow().isoformat())),
            expiry_date=datetime.fromisoformat(data.get('milking_time', datetime.utcnow().isoformat())) + timedelta(hours=8),
            notes=f"Auto-generated batch from milking session. {data.get('notes', '')}"
        )
        
        db.session.add(new_batch)
        db.session.flush()  # This assigns an ID to new_batch without committing
        
        # Now create the milking session with the new batch ID
        new_session = MilkingSession(
            cow_id=data['cow_id'],
            milker_id=data['milker_id'],
            milk_batch_id=new_batch.id,  # Link to the new batch
            volume=data['volume'],
            milking_time=datetime.fromisoformat(data.get('milking_time', datetime.utcnow().isoformat())),
            notes=data.get('notes')
        )
        
        db.session.add(new_session)
        
        # Update the daily milk summary
        session_date = new_session.milking_time.date()
        summary = DailyMilkSummary.query.filter_by(
            cow_id=new_session.cow_id,
            date=session_date
        ).first()
        
        if not summary:
            # Initialize with zero values when creating a new summary
            summary = DailyMilkSummary(
                cow_id=new_session.cow_id,
                date=session_date,
                morning_volume=0,    # Initialize with zero instead of None
                afternoon_volume=0,  # Initialize with zero instead of None
                evening_volume=0,    # Initialize with zero instead of None
                total_volume=0       # Initialize with zero instead of None
            )
            db.session.add(summary)
        
        # Ensure values are initialized if they are None
        if summary.morning_volume is None:
            summary.morning_volume = 0
        if summary.afternoon_volume is None:
            summary.afternoon_volume = 0
        if summary.evening_volume is None:
            summary.evening_volume = 0
        
        # Determine time of day and update corresponding volume
        hour = new_session.milking_time.hour
        if hour < 12:
            summary.morning_volume += float(new_session.volume)
        elif hour < 18:
            summary.afternoon_volume += float(new_session.volume)
        else:
            summary.evening_volume += float(new_session.volume)
            
        # Ensure total_volume is not None
        if summary.total_volume is None:
            summary.total_volume = 0
        summary.total_volume = summary.morning_volume + summary.afternoon_volume + summary.evening_volume
        
        db.session.commit()
        return jsonify({
            "success": True, 
            "message": "Milking session added successfully with new batch", 
            "id": new_session.id,
            "batch_id": new_batch.id
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400

@milk_production_bp.route('/milking-sessions', methods=['GET'])
def get_milking_sessions():
    sessions = MilkingSession.query.all()
    result = []
    
    for session in sessions:
        result.append({
            "id": session.id,
            "cow_id": session.cow_id,
            "cow_name": session.cow.name if session.cow else None,
            "milker_id": session.milker_id,
            "milker_name": session.milker.name if session.milker else None,
            "milk_batch_id": session.milk_batch_id,
            "volume": session.volume,
            "milking_time": session.milking_time.isoformat(),
            "notes": session.notes
        })
    
    return jsonify(result), 200


@milk_production_bp.route('/milk-batches', methods=['GET'])
def get_milk_batches():
    batches = MilkBatch.query.all()
    result = []
    
    for batch in batches:
        result.append({
            "id": batch.id,
            "batch_number": batch.batch_number,
            "total_volume": batch.total_volume,
            "status": batch.status.value,
            "production_date": batch.production_date.isoformat(),
            "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
            "notes": batch.notes
        })
    
    return jsonify(result), 200

# DailyMilkSummary routes
@milk_production_bp.route('/daily-summaries', methods=['GET'])
def get_daily_summaries():
    cow_id = request.args.get('cow_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = DailyMilkSummary.query
    
    if cow_id:
        query = query.filter_by(cow_id=cow_id)
    
    if start_date:
        query = query.filter(DailyMilkSummary.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(DailyMilkSummary.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    summaries = query.all()
    result = []
    
    for summary in summaries:
        result.append({
            "id": summary.id,
            "cow_id": summary.cow_id,
            "cow_name": summary.cow.name if summary.cow else None,
            "date": summary.date.isoformat(),
            "morning_volume": summary.morning_volume,
            "afternoon_volume": summary.afternoon_volume,
            "evening_volume": summary.evening_volume,
            "total_volume": summary.total_volume,
            "average_fat_content": summary.average_fat_content,
            "average_protein_content": summary.average_protein_content
        })
    
    return jsonify(result), 200


@milk_production_bp.route('/export/pdf', methods=['GET'])
def export_milking_sessions_pdf():
    try:
        sessions = MilkingSession.query.all()

        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        pdf.set_font("Arial", style="B", size=16)
        pdf.cell(200, 10, txt="Laporan Data Milking Sessions", ln=True, align='C')
        pdf.ln(5)
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, txt="Daftar sesi pemerahan sapi.", ln=True, align='C')
        pdf.ln(10)

        pdf.set_fill_color(173, 216, 230)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", style="B", size=10)
        pdf.cell(10, 10, "NO", border=1, align='C', fill=True)
        pdf.cell(40, 10, "Cow", border=1, align='C', fill=True)
        pdf.cell(40, 10, "Milker", border=1, align='C', fill=True)
        pdf.cell(25, 10, "Session", border=1, align='C', fill=True)
        pdf.cell(25, 10, "Volume", border=1, align='C', fill=True)
        pdf.cell(45, 10, "Milking Time", border=1, align='C', fill=True)
        pdf.ln()

        pdf.set_font("Arial", size=10)
        for idx, session in enumerate(sessions, start=1):
            cow_info = f"{session.cow_id} - {session.cow.name}" if session.cow else str(session.cow_id)
            milker_info = f"{session.milker_id} - {session.milker.name}" if session.milker else str(session.milker_id)
            # Tentukan sesi berdasarkan jam
            hour = session.milking_time.hour
            if hour < 12:
                sesi = "Pagi"
            elif hour < 18:
                sesi = "Siang"
            else:
                sesi = "Sore"
            pdf.cell(10, 10, str(idx), border=1, align='C')
            pdf.cell(40, 10, cow_info, border=1)
            pdf.cell(40, 10, milker_info, border=1)
            pdf.cell(25, 10, sesi, border=1, align='C')
            pdf.cell(25, 10, str(session.volume), border=1)
            pdf.cell(45, 10, session.milking_time.strftime('%Y-%m-%d %H:%M'), border=1)
            pdf.ln()

        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name="milking_sessions.pdf", mimetype='application/pdf')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@milk_production_bp.route('/export/excel', methods=['GET'])
def export_milking_sessions_excel():
    try:
        sessions = MilkingSession.query.all()
        sessions_list = []
        for idx, session in enumerate(sessions, start=1):
            hour = session.milking_time.hour
            if hour < 12:
                sesi = "Pagi"
            elif hour < 18:
                sesi = "Siang"
            else:
                sesi = "Sore"
            sessions_list.append({
                "NO": idx,
                "Cow": f"{session.cow_id} - {session.cow.name}" if session.cow else str(session.cow_id),
                "Milker": f"{session.milker_id} - {session.milker.name}" if session.milker else str(session.milker_id),
                "Session": sesi,
                "Volume": session.volume,
                "Milking Time": session.milking_time.strftime('%Y-%m-%d %H:%M')
            })

        df = pd.DataFrame(sessions_list)
        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='MilkingSessions')
            workbook = writer.book
            worksheet = writer.sheets['MilkingSessions']
            from openpyxl.styles import Font, PatternFill
            header_fill = PatternFill(start_color="ADD8E6", end_color="ADD8E6", fill_type="solid")
            header_font = Font(bold=True)
            for cell in worksheet[1]:
                cell.fill = header_fill
                cell.font = header_font
            for column_cells in worksheet.columns:
                max_length = max(len(str(cell.value)) for cell in column_cells if cell.value)
                adjusted_width = max_length + 2
                worksheet.column_dimensions[column_cells[0].column_letter].width = adjusted_width
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name="milking_sessions.xlsx", mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

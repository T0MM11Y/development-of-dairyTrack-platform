from flask import Blueprint, jsonify, request
from app.database.database import db
from app.services.notification import check_milk_expiry_and_notify
from datetime import datetime, timedelta
from sqlalchemy import text
import logging
from app.models.milk_batches import MilkStatus  # Import the MilkStatus enum

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

milk_freshness_bp = Blueprint('milk_freshness', __name__)

@milk_freshness_bp.route('/analysis', methods=['GET'])
def analyze_milk_freshness():
    """
    Analyze all fresh milk batches and their freshness status
    """
    try:
        result = db.session.execute(text("""
            SELECT 
                mb.id, 
                mb.batch_number, 
                mb.total_volume, 
                mb.status, 
                mb.production_date, 
                mb.expiry_date,
                ms.cow_id,
                c.name as cow_name,
                ms.milker_id,
                u.name as milker_name
            FROM milk_batches mb
            LEFT JOIN milking_sessions ms ON ms.milk_batch_id = mb.id
            LEFT JOIN cows c ON ms.cow_id = c.id
            LEFT JOIN users u ON ms.milker_id = u.id
            WHERE mb.status = 'fresh'
            ORDER BY mb.expiry_date ASC
        """))
        
        batches = []
        for row in result:
            # Calculate freshness metrics
            now = datetime.utcnow()
            expiry = row.expiry_date
            production_date = row.production_date
            status = row.status
            
            # Calculate hours left based on status and expiry date
            if status == str(MilkStatus.EXPIRED.value):
                # If already marked as expired in database
                hours_left = 0
                freshness_percentage = 0
            elif status == str(MilkStatus.USED.value):
                # If already used
                hours_left = None
                freshness_percentage = None
            elif expiry:
                # For fresh milk with expiry date
                remaining_time = expiry - now
                hours_left = remaining_time.total_seconds() / 3600
                
                # Ensure non-negative values for display
                if hours_left < 0:
                    hours_left = 0
                    freshness_percentage = 0
                else:
                    # Calculate freshness percentage based on 8-hour shelf life
                    freshness_percentage = max(0, min(100, (hours_left / 8) * 100))
            elif production_date:
                # If no expiry date but we have production date, estimate based on 8-hour shelf life
                hours_since_production = (now - production_date).total_seconds() / 3600
                hours_left = max(0, 8 - hours_since_production)  # 8-hour shelf life
                freshness_percentage = max(0, min(100, (hours_left / 8) * 100))
            else:
                # No expiry date and no production date
                hours_left = None
                freshness_percentage = None
                
            batches.append({
                "id": row.id,
                "batch_number": row.batch_number,
                "total_volume": float(row.total_volume) if row.total_volume else 0,
                "status": row.status,
                "production_date": row.production_date.isoformat() if row.production_date else None,
                "expiry_date": row.expiry_date.isoformat() if row.expiry_date else None,
                "cow_id": row.cow_id,
                "cow_name": row.cow_name,
                "milker_id": row.milker_id,
                "milker_name": row.milker_name,
                "hours_left": round(hours_left, 1) if hours_left is not None else None,
                "freshness_percentage": round(freshness_percentage, 1) if freshness_percentage is not None else None,
                "freshness_status": get_freshness_status(hours_left) if hours_left is not None else "unknown"
            })
            
        return jsonify({"success": True, "data": batches}), 200
        
    except Exception as e:
        logging.error(f"Error analyzing milk freshness: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@milk_freshness_bp.route('/stats', methods=['GET'])
def milk_freshness_stats():
    """
    Get statistics about milk batch freshness status
    """
    try:
        result = db.session.execute(text("""
            SELECT 
                status, 
                COUNT(*) as count,
                SUM(total_volume) as total_volume
            FROM milk_batches
            GROUP BY status
        """))
        
        stats = {}
        total_batches = 0
        total_volume = 0
        
        for row in result:
            status = row.status
            count = row.count
            volume = float(row.total_volume) if row.total_volume else 0
            
            stats[status] = {
                "batch_count": count,
                "total_volume": volume
            }
            
            total_batches += count
            total_volume += volume
        
        # Get critical batches (expiring in less than 2 hours)
        critical_result = db.session.execute(text("""
            SELECT COUNT(*) as count, SUM(total_volume) as total_volume
            FROM milk_batches
            WHERE status = 'fresh' AND expiry_date < :critical_time
        """), {"critical_time": datetime.utcnow() + timedelta(hours=2)})
        
        critical_row = critical_result.fetchone()
        stats["critical"] = {
            "batch_count": critical_row.count if critical_row else 0,
            "total_volume": float(critical_row.total_volume) if critical_row and critical_row.total_volume else 0
        }
        
        # Add summary
        stats["summary"] = {
            "total_batches": total_batches,
            "total_volume": total_volume
        }
        
        return jsonify({"success": True, "stats": stats}), 200
        
    except Exception as e:
        logging.error(f"Error getting milk freshness stats: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@milk_freshness_bp.route('/critical', methods=['GET'])
def critical_milk_batches():
    """
    Get milk batches that are close to expiration
    """
    try:
        hours = request.args.get('hours', default=2, type=int)
        
        result = db.session.execute(text("""
            SELECT 
                mb.id, 
                mb.batch_number, 
                mb.total_volume, 
                mb.status,
                mb.production_date, 
                mb.expiry_date,
                ms.cow_id,
                c.name as cow_name
            FROM milk_batches mb
            LEFT JOIN milking_sessions ms ON ms.milk_batch_id = mb.id
            LEFT JOIN cows c ON ms.cow_id = c.id
            WHERE mb.status = 'fresh' AND 
                  (mb.expiry_date < :critical_time OR
                   (mb.expiry_date IS NULL AND mb.production_date < :production_critical_time))
            ORDER BY COALESCE(mb.expiry_date, DATE_ADD(mb.production_date, INTERVAL 8 HOUR)) ASC
        """), {
            "critical_time": datetime.utcnow() + timedelta(hours=hours),
            "production_critical_time": datetime.utcnow() - timedelta(hours=(8 - hours))
        })
        
        batches = []
        for row in result:
            now = datetime.utcnow()
            expiry = row.expiry_date
            production_date = row.production_date
            status = row.status
            
            # Calculate hours left based on status and dates
            if status == str(MilkStatus.EXPIRED.value):
                hours_left = 0
            elif expiry:
                remaining_time = expiry - now
                hours_left = max(0, remaining_time.total_seconds() / 3600)
            elif production_date:
                # Estimate expiry based on production date + 8 hours
                hours_since_production = (now - production_date).total_seconds() / 3600
                hours_left = max(0, 8 - hours_since_production)
            else:
                hours_left = None
                
            batches.append({
                "id": row.id,
                "batch_number": row.batch_number,
                "total_volume": float(row.total_volume) if row.total_volume else 0,
                "status": row.status,
                "production_date": row.production_date.isoformat() if row.production_date else None,
                "expiry_date": row.expiry_date.isoformat() if row.expiry_date else None,
                "estimated_expiry": (production_date + timedelta(hours=8)).isoformat() if production_date and not expiry else None,
                "cow_id": row.cow_id,
                "cow_name": row.cow_name,
                "hours_left": round(hours_left, 1) if hours_left is not None else None,
            })
            
        return jsonify({
            "success": True, 
            "message": f"Batches expiring within {hours} hours", 
            "count": len(batches),
            "data": batches
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting critical milk batches: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@milk_freshness_bp.route('/check-and-notify', methods=['POST'])
def run_freshness_check():
    """Manually trigger the milk expiry check and notification process"""
    try:
        notification_count = check_milk_expiry_and_notify()
        return jsonify({
            "success": True,
            "message": f"Freshness check completed successfully",
            "notifications_created": notification_count
        }), 200
    except Exception as e:
        logging.error(f"Error running freshness check: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@milk_freshness_bp.route('/export/pdf', methods=['GET'])
def export_freshness_report_pdf():
    """
    Export milk freshness analysis as PDF report
    """
    try:
        from fpdf import FPDF
        from io import BytesIO
        from flask import send_file
        
        # Get fresh milk batches
        result = db.session.execute(text("""
            SELECT 
                mb.id, 
                mb.batch_number, 
                mb.total_volume,
                mb.status,
                mb.production_date, 
                mb.expiry_date,
                c.name as cow_name
            FROM milk_batches mb
            LEFT JOIN milking_sessions ms ON ms.milk_batch_id = mb.id
            LEFT JOIN cows c ON ms.cow_id = c.id
            WHERE mb.status = 'fresh'
            ORDER BY mb.expiry_date ASC
        """))
        
        # Create PDF report
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        pdf.set_font("Arial", style="B", size=16)
        pdf.cell(200, 10, txt="Laporan Kesegaran Susu", ln=True, align='C')
        pdf.ln(5)
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, txt=f"Tanggal Laporan: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align='C')
        pdf.ln(10)
        
        # Add table header
        pdf.set_fill_color(173, 216, 230)  # Light blue
        pdf.set_font("Arial", style="B", size=10)
        pdf.cell(15, 10, "NO", border=1, align='C', fill=True)
        pdf.cell(30, 10, "Batch", border=1, align='C', fill=True)
        pdf.cell(35, 10, "Sapi", border=1, align='C', fill=True)
        pdf.cell(30, 10, "Volume (L)", border=1, align='C', fill=True)
        pdf.cell(40, 10, "Tanggal Produksi", border=1, align='C', fill=True)
        pdf.cell(40, 10, "Kedaluarsa", border=1, align='C', fill=True)
        pdf.ln()
        
        # Add data rows
        pdf.set_font("Arial", size=10)
        for idx, row in enumerate(result, 1):
            now = datetime.utcnow()
            expiry = row.expiry_date
            production_date = row.production_date
            status = row.status
            
            # Calculate hours_left and determine fill color
            if status == str(MilkStatus.EXPIRED.value):
                hours_left = 0
                fill_color = (255, 150, 150)  # Light red for expired
            elif expiry:
                remaining_time = expiry - now
                hours_left = remaining_time.total_seconds() / 3600
                if hours_left < 0:
                    hours_left = 0
                    fill_color = (255, 150, 150)  # Light red for expired
                elif hours_left < 2:
                    fill_color = (255, 200, 200)  # Light red for critical
                elif hours_left < 4:
                    fill_color = (255, 255, 200)  # Light yellow for warning
                else:
                    fill_color = (255, 255, 255)  # White for fresh
            elif production_date:
                hours_since_production = (now - production_date).total_seconds() / 3600
                hours_left = max(0, 8 - hours_since_production)
                
                if hours_left < 2:
                    fill_color = (255, 200, 200)  # Light red for critical
                elif hours_left < 4:
                    fill_color = (255, 255, 200)  # Light yellow for warning
                else:
                    fill_color = (255, 255, 255)  # White for fresh
            else:
                hours_left = None
                fill_color = (220, 220, 220)  # Gray for unknown
            
            # Display estimated expiry if no expiry date
            display_expiry = row.expiry_date
            if not display_expiry and row.production_date:
                display_expiry = row.production_date + timedelta(hours=8)
            
            pdf.set_fill_color(*fill_color)
            pdf.cell(15, 10, str(idx), border=1, align='C', fill=True)
            pdf.cell(30, 10, row.batch_number, border=1, fill=True)
            pdf.cell(35, 10, row.cow_name or "Unknown", border=1, fill=True)
            pdf.cell(30, 10, f"{row.total_volume:.1f}", border=1, align='R', fill=True)
            pdf.cell(40, 10, row.production_date.strftime('%Y-%m-%d %H:%M') if row.production_date else "-", border=1, fill=True)
            
            if display_expiry:
                pdf.cell(40, 10, display_expiry.strftime('%Y-%m-%d %H:%M'), border=1, fill=True)
            else:
                pdf.cell(40, 10, "Tidak diketahui", border=1, fill=True)
                
            pdf.ln()
        
        # Save to buffer and return
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        return send_file(buffer, as_attachment=True, download_name="milk_freshness_report.pdf", mimetype='application/pdf')
        
    except Exception as e:
        logging.error(f"Error exporting freshness report: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

def get_freshness_status(hours_left):
    """Determine freshness status based on hours left"""
    if hours_left is None:
        return "unknown"
    elif hours_left <= 0:
        return "expired"
    elif hours_left < 2:  # Kritis (25% dari shelf life 8 jam)
        return "critical"
    elif hours_left < 4:  # Peringatan (50% dari shelf life 8 jam)
        return "warning"
    else:
        return "fresh"
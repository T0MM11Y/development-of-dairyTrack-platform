import React from "react";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerStyles = {
    footer: {
      // Retro gradient background yang lebih compact
      background:
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #533483 100%)",
      color: "#F7F7F7",
      padding: "12px 0", // Reduced padding
      borderTop: "2px solid #FF6B35", // Thinner border
      boxShadow:
        "0 -2px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
      position: "relative",
      zIndex: 1,
      width: "100%",
      flexShrink: 0,
      marginTop: "auto",
      overflow: "hidden",
    },
    // Simplified overlay
    footerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 30% 70%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 70% 30%, rgba(107, 115, 255, 0.08) 0%, transparent 50%)
      `,
      pointerEvents: "none",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px", // Reduced padding
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px", // Reduced gap
      position: "relative",
      zIndex: 2,
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px", // Reduced gap
      flex: "1",
      minWidth: "150px", // Smaller min width
    },
    logo: {
      width: "28px", // Smaller logo
      height: "28px",
      borderRadius: "50%",
      background: "linear-gradient(145deg, #FF6B35, #E55A2B)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px", // Smaller font
      fontWeight: "bold",
      color: "#F7F7F7",
      border: "2px solid #FF8C42",
      boxShadow:
        "0 2px 8px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
      fontFamily: '"Orbitron", sans-serif',
    },
    companyInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "2px", // Reduced gap
    },
    companyName: {
      fontSize: "14px", // Smaller font
      fontWeight: "700",
      textShadow: "0 1px 3px rgba(0,0,0,0.5)",
      margin: 0,
      color: "#F7F7F7",
      fontFamily: '"Orbitron", sans-serif',
      letterSpacing: "0.5px",
    },
    copyright: {
      fontSize: "11px", // Smaller font
      color: "#B8B8B8",
      margin: 0,
      fontFamily: '"Orbitron", sans-serif',
      letterSpacing: "0.3px",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "15px", // Reduced gap
      flex: "1",
      justifyContent: "flex-end",
      minWidth: "150px",
    },
    compactInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "11px",
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: "500",
      letterSpacing: "0.3px",
    },
    version: {
      color: "#F7F7F7",
      background: "rgba(255,255,255,0.1)",
      padding: "3px 8px", // Smaller padding
      borderRadius: "10px",
      border: "1px solid #FF6B35",
      boxShadow: "0 1px 5px rgba(255, 107, 53, 0.3)",
      backdropFilter: "blur(5px)",
    },
    divider: {
      width: "1px",
      height: "15px", // Shorter divider
      background: "rgba(255, 107, 53, 0.5)",
    },
    status: {
      display: "flex",
      alignItems: "center",
      gap: "4px", // Smaller gap
      color: "#4ECDC4",
    },
    statusDot: {
      width: "6px", // Smaller dot
      height: "6px",
      borderRadius: "50%",
      background: "#4ECDC4",
      boxShadow: "0 0 8px rgba(78, 205, 196, 0.6)",
      animation: "pulse 2s infinite",
    },
    // Minimal decorative bar
    decorativeBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "1px", // Thinner bar
      background: "linear-gradient(90deg, transparent, #FF6B35, transparent)",
      opacity: 0.6,
    },
  };

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        .admin-footer {
          transition: all 0.3s ease;
        }
        
        .admin-footer-logo:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 12px rgba(255, 107, 53, 0.5), inset 0 1px 0 rgba(255,255,255,0.3) !important;
        }
        
        .admin-footer-version:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: #FF8C42 !important;
          transform: translateY(-1px);
        }
        
        /* Responsive - stack vertically on small screens */
        @media (max-width: 768px) {
          .admin-footer-container {
            flex-direction: column;
            text-align: center;
            gap: 10px;
            padding: 0 15px;
          }
          
          .admin-footer-left,
          .admin-footer-right {
            justify-content: center;
            min-width: auto;
            flex: none;
          }
          
          .admin-footer-compact-info {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .admin-footer-divider {
            display: none;
          }
          
          .admin-footer-compact-info {
            flex-direction: column;
            gap: 8px;
          }
        }
        `}
      </style>

      <footer style={footerStyles.footer} className="admin-footer">
        {/* Minimal overlay */}
        <div style={footerStyles.footerOverlay}></div>

        {/* Minimal decorative bar */}
        <div style={footerStyles.decorativeBar}></div>

        <div style={footerStyles.container} className="admin-footer-container">
          {/* Left: Logo and Company */}
          <div style={footerStyles.leftSection} className="admin-footer-left">
            <div
              style={footerStyles.logo}
              className="admin-footer-logo"
              title="DairyTrack System"
            >
              DT
            </div>
            <div style={footerStyles.companyInfo}>
              <h6 style={footerStyles.companyName}>DairyTrack</h6>
              <p style={footerStyles.copyright}>© {currentYear} Future Tech</p>
            </div>
          </div>

          {/* Right: Compact info */}
          <div style={footerStyles.rightSection} className="admin-footer-right">
            <div
              style={footerStyles.compactInfo}
              className="admin-footer-compact-info"
            >
              <div
                style={footerStyles.version}
                className="admin-footer-version"
                title="System Version"
              >
                v1.0.0
              </div>

              <div
                style={footerStyles.divider}
                className="admin-footer-divider"
              ></div>

              <div style={footerStyles.status} title="System Status">
                <div style={footerStyles.statusDot}></div>
                Online
              </div>

              <div
                style={footerStyles.divider}
                className="admin-footer-divider"
              ></div>

              <span style={{ color: "#B8B8B8" }} title="Current User">
                DairyTrack
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default AdminFooter;

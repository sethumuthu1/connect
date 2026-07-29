import React from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaLock,
  FaUserSecret,
  FaDatabase,
} from "react-icons/fa";

export default function Privacy() {
  return (
    <div style={{ background: "#f8fbff", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg,#2196F3,#4FC3F7)",
          color: "#fff",
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        <FaShieldAlt style={{ fontSize: 60, marginBottom: 20 }} />

        <h1 style={{ fontSize: 46, marginBottom: 15 }}>
          Privacy Policy
        </h1>

        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          Your privacy is important to us. This Privacy Policy explains how
          Zingle collects, uses, stores, and protects your information while
          using our services.
        </p>
      </section>

      {/* Content */}
      <section
        style={{
          maxWidth: 1100,
          margin: "60px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 40,
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2>Information We Collect</h2>

          <p style={textStyle}>
            We may collect limited information necessary to operate our
            platform, including:
          </p>

          <ul style={listStyle}>
            <li>Browser and device information</li>
            <li>IP address (for security purposes)</li>
            <li>Camera and microphone permissions (only when granted)</li>
            <li>Usage statistics and analytics</li>
            <li>Support requests you send us</li>
          </ul>

          <hr style={divider} />

          <h2>How We Use Your Information</h2>

          <p style={textStyle}>
            Your information helps us:
          </p>

          <ul style={listStyle}>
            <li>Provide random video and text chat services.</li>
            <li>Improve website performance.</li>
            <li>Prevent fraud, abuse, and spam.</li>
            <li>Respond to support requests.</li>
            <li>Maintain platform security.</li>
          </ul>

          <hr style={divider} />

          <h2>
            <FaLock color="#2196F3" /> Data Security
          </h2>

          <p style={textStyle}>
            We implement reasonable technical and organizational measures to
            protect your information against unauthorized access, disclosure,
            alteration, or destruction.
          </p>

          <hr style={divider} />

          <h2>
            <FaDatabase color="#2196F3" /> Data Storage
          </h2>

          <p style={textStyle}>
            Information is retained only as long as necessary for legal,
            security, and operational purposes. We do not store unnecessary
            personal information.
          </p>

          <hr style={divider} />

          <h2>
            <FaUserSecret color="#2196F3" /> Sharing Information
          </h2>

          <p style={textStyle}>
            Zingle does not sell your personal information. We may share
            information only when required by law or to protect our platform,
            users, or legal rights.
          </p>

          <hr style={divider} />

          <h2>Cookies & Analytics</h2>

          <p style={textStyle}>
            We may use cookies and analytics tools to improve your browsing
            experience and understand website usage. You can manage cookies
            through your browser settings.
          </p>

          <hr style={divider} />

          <h2>Your Rights</h2>

          <ul style={listStyle}>
            <li>Request access to your personal information.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion where legally applicable.</li>
            <li>Withdraw consent where applicable.</li>
          </ul>

          <hr style={divider} />

          <h2>Children's Privacy</h2>

          <p style={textStyle}>
            Zingle is intended for users aged 18 years or older. We do not
            knowingly collect personal information from children.
          </p>

          <hr style={divider} />

          <h2>Changes to this Privacy Policy</h2>

          <p style={textStyle}>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with the updated effective date.
          </p>

          <hr style={divider} />

          <h2>Contact Us</h2>

          <p style={textStyle}>
            If you have questions about this Privacy Policy or your personal
            information, please contact our support team.
          </p>

          <div
            style={{
              textAlign: "center",
              marginTop: 35,
            }}
          >
            <Link
              to="/contact"
              style={{
                background: "#2196F3",
                color: "#fff",
                padding: "14px 30px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const textStyle = {
  color: "#555",
  fontSize: 17,
  lineHeight: 1.9,
};

const listStyle = {
  color: "#555",
  fontSize: 17,
  lineHeight: 2,
  paddingLeft: 25,
};

const divider = {
  margin: "30px 0",
};
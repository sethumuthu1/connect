import React from "react";
import { Link } from "react-router-dom";
import {
  FaCookieBite,
  FaShieldAlt,
  FaChartLine,
  FaCog,
} from "react-icons/fa";

export default function Cookies() {
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
        <FaCookieBite style={{ fontSize: 60, marginBottom: 20 }} />

        <h1 style={{ fontSize: "46px", marginBottom: 15 }}>
          Cookie Policy
        </h1>

        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          This Cookie Policy explains how Zingle uses cookies and similar
          technologies to improve your browsing experience and provide better
          services.
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
          <h2>What Are Cookies?</h2>

          <p style={textStyle}>
            Cookies are small text files stored on your device when you visit a
            website. They help websites remember your preferences, improve
            performance, and provide a better browsing experience.
          </p>

          <hr style={divider} />

          <h2>Why We Use Cookies</h2>

          <div style={card}>
            <FaShieldAlt style={iconStyle} />

            <div>
              <h3>Essential Cookies</h3>
              <p style={textStyle}>
                Required for core website functionality including navigation,
                security, and maintaining your session.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaChartLine style={iconStyle} />

            <div>
              <h3>Analytics Cookies</h3>
              <p style={textStyle}>
                Help us understand how visitors use Zingle so we can improve
                performance and user experience.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaCog style={iconStyle} />

            <div>
              <h3>Functional Cookies</h3>
              <p style={textStyle}>
                Remember your language, preferences, and settings to provide a
                smoother experience.
              </p>
            </div>
          </div>

          <hr style={divider} />

          <h2>Third-Party Services</h2>

          <p style={textStyle}>
            Zingle may use trusted third-party services such as analytics,
            security providers, and cloud infrastructure. These services may
            place cookies to help deliver their functionality.
          </p>

          <hr style={divider} />

          <h2>Managing Cookies</h2>

          <p style={textStyle}>
            You can control or delete cookies through your browser settings.
            Most browsers allow you to block or remove cookies at any time.
            Please note that disabling essential cookies may affect website
            functionality.
          </p>

          <hr style={divider} />

          <h2>Your Consent</h2>

          <p style={textStyle}>
            By continuing to use Zingle, you consent to the use of cookies as
            described in this Cookie Policy. You may update your preferences at
            any time through the cookie consent settings.
          </p>

          <hr style={divider} />

          <h2>Changes to This Policy</h2>

          <p style={textStyle}>
            We may update this Cookie Policy occasionally to reflect changes in
            technology, legal requirements, or our services. Updates will be
            posted on this page with the revised effective date.
          </p>

          <hr style={divider} />

          <h2>Contact Us</h2>

          <p style={textStyle}>
            If you have questions about this Cookie Policy, please contact us
            through our Contact page.
          </p>

          <div
            style={{
              marginTop: 30,
              textAlign: "center",
            }}
          >
            <Link
              to="/contact"
              style={{
                display: "inline-block",
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
  lineHeight: 1.9,
  fontSize: 17,
};

const divider = {
  margin: "30px 0",
};

const iconStyle = {
  fontSize: 40,
  color: "#2196F3",
  marginRight: 20,
  minWidth: 40,
};

const card = {
  display: "flex",
  alignItems: "flex-start",
  marginTop: 25,
  marginBottom: 25,
};
import React from "react";
import {
  FaEnvelope,
  FaGlobe,
  FaQuestionCircle,
  FaPaperPlane,
} from "react-icons/fa";

export default function Contact() {
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
        <h1 style={{ fontSize: "48px", marginBottom: 15 }}>
          Contact Us
        </h1>

        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          We'd love to hear from you. Whether you have questions, feedback, or
          need support, the Zingle team is here to help.
        </p>
      </section>

      {/* Contact Section */}
      <section
        style={{
          maxWidth: 1200,
          margin: "60px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
          gap: 40,
        }}
      >
        {/* Contact Info */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 35,
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2 style={{ marginBottom: 25 }}>Get In Touch</h2>

          <div style={{ marginBottom: 25 }}>
            <FaEnvelope
              style={{ color: "#2196F3", fontSize: 24, marginRight: 10 }}
            />
            <strong>Email</strong>

            <p style={{ color: "#666", marginTop: 8 }}>
              support@zingle.online
            </p>
          </div>

          <div style={{ marginBottom: 25 }}>
            <FaGlobe
              style={{ color: "#2196F3", fontSize: 24, marginRight: 10 }}
            />
            <strong>Website</strong>

            <p style={{ color: "#666", marginTop: 8 }}>
              https://www.zingle.online
            </p>
          </div>

          <div>
            <FaQuestionCircle
              style={{ color: "#2196F3", fontSize: 24, marginRight: 10 }}
            />
            <strong>Support Hours</strong>

            <p style={{ color: "#666", marginTop: 8 }}>
              Monday - Sunday
              <br />
              24/7 Online Support
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 35,
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2 style={{ marginBottom: 25 }}>Send a Message</h2>

          <form>
            <input
              type="text"
              placeholder="Your Name"
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Your Email"
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Subject"
              style={inputStyle}
            />

            <textarea
              rows="6"
              placeholder="Your Message"
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            ></textarea>

            <button
              type="submit"
              style={{
                width: "100%",
                background: "#2196F3",
                color: "#fff",
                border: "none",
                padding: "15px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <FaPaperPlane />
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          maxWidth: 1000,
          margin: "70px auto",
          padding: "0 20px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 35 }}>
          Frequently Asked Questions
        </h2>

        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 35,
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h3>How long does it take to receive a reply?</h3>

          <p style={{ color: "#666", lineHeight: 1.8 }}>
            We usually respond within 24 to 48 hours.
          </p>

          <hr style={{ margin: "25px 0" }} />

          <h3>Can I report abusive users?</h3>

          <p style={{ color: "#666", lineHeight: 1.8 }}>
            Yes. If you encounter inappropriate behaviour, please contact us
            immediately or use the report feature inside the platform.
          </p>

          <hr style={{ margin: "25px 0" }} />

          <h3>Is Zingle free?</h3>

          <p style={{ color: "#666", lineHeight: 1.8 }}>
            Yes. Zingle provides free random video chat and anonymous text chat
            for everyone.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "#2196F3",
          color: "#fff",
          textAlign: "center",
          padding: "70px 20px",
        }}
      >
        <h2 style={{ fontSize: 36 }}>
          Thank You for Visiting Zingle
        </h2>

        <p
          style={{
            maxWidth: 700,
            margin: "20px auto",
            lineHeight: 1.8,
            fontSize: 18,
          }}
        >
          Your feedback helps us improve and build a safer, better chat
          experience for everyone.
        </p>
      </section>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginBottom: "18px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};
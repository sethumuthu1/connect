import React from "react";
import { Link } from "react-router-dom";
import {
  FaFileContract,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

export default function Terms() {
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
        <FaFileContract style={{ fontSize: 60, marginBottom: 20 }} />

        <h1 style={{ fontSize: 48, marginBottom: 15 }}>
          Terms of Service
        </h1>

        <p
          style={{
            maxWidth: 850,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          By using Zingle, you agree to these Terms of Service. Please read
          them carefully before using our platform.
        </p>
      </section>

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
          <h2>Eligibility</h2>

          <p style={text}>
            You must be at least 18 years old or meet the minimum legal age in
            your country to use Zingle.
          </p>

          <hr style={divider} />

          <h2>Acceptable Use</h2>

          <div style={card}>
            <FaCheckCircle style={{ color: "#28a745", fontSize: 24 }} />
            <p style={text}>
              Use Zingle respectfully and follow all community rules.
            </p>
          </div>

          <div style={card}>
            <FaBan style={{ color: "#dc3545", fontSize: 24 }} />
            <p style={text}>
              Do not engage in harassment, hate speech, illegal activities,
              scams, spam, or explicit content.
            </p>
          </div>

          <hr style={divider} />

          <h2>Accounts</h2>

          <p style={text}>
            Some features may require registration. You are responsible for
            maintaining the security of your account and any information you
            provide.
          </p>

          <hr style={divider} />

          <h2>Intellectual Property</h2>

          <p style={text}>
            All website content, logos, trademarks, graphics, and software are
            owned by Zingle or licensed to us and are protected by applicable
            intellectual property laws.
          </p>

          <hr style={divider} />

          <h2>Termination</h2>

          <p style={text}>
            We reserve the right to suspend or permanently terminate accounts
            that violate these Terms or Community Rules.
          </p>

          <hr style={divider} />

          <h2>Disclaimer</h2>

          <p style={text}>
            Zingle provides its services on an "as is" and "as available"
            basis. We do not guarantee uninterrupted availability or that every
            interaction with other users will be safe or appropriate.
          </p>

          <hr style={divider} />

          <h2>Limitation of Liability</h2>

          <p style={text}>
            To the maximum extent permitted by law, Zingle shall not be liable
            for any indirect, incidental, or consequential damages arising from
            the use of the platform.
          </p>

          <hr style={divider} />

          <h2>Changes to These Terms</h2>

          <p style={text}>
            We may update these Terms from time to time. Continued use of the
            platform after changes become effective constitutes acceptance of
            the updated Terms.
          </p>

          <hr style={divider} />

          <h2>Contact Us</h2>

          <p style={text}>
            If you have questions regarding these Terms of Service, please
            contact us.
          </p>

          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link
              to="/contact"
              style={{
                background: "#2196F3",
                color: "#fff",
                textDecoration: "none",
                padding: "14px 30px",
                borderRadius: 10,
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

const text = {
  color: "#555",
  lineHeight: 1.9,
  fontSize: 17,
};

const divider = {
  margin: "30px 0",
};

const card = {
  display: "flex",
  gap: 15,
  alignItems: "center",
  marginTop: 15,
};
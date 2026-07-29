import React from "react";
import { Link } from "react-router-dom";
import { FaCookieBite, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

export default function Consent() {
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
          Manage Your Consent
        </h1>

        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          You control how Zingle uses cookies and similar technologies.
          Manage your privacy preferences anytime.
        </p>
      </section>

      {/* Content */}
      <section
        style={{
          maxWidth: 1000,
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
          <h2>Why We Ask for Consent</h2>

          <p style={{ color: "#555", lineHeight: 1.9 }}>
            Zingle uses cookies and similar technologies to improve your
            browsing experience, remember your preferences, analyze website
            traffic, and provide essential functionality. We only use your data
            according to our Privacy Policy.
          </p>

          <hr style={{ margin: "30px 0" }} />

          <h2>Types of Cookies</h2>

          <div style={{ marginTop: 20 }}>
            <h3>
              <FaCheckCircle color="#2196F3" /> Essential Cookies
            </h3>
            <p style={{ color: "#555", lineHeight: 1.8 }}>
              Required for the website to function correctly. These cannot be
              disabled.
            </p>

            <h3>
              <FaCheckCircle color="#2196F3" /> Analytics Cookies
            </h3>
            <p style={{ color: "#555", lineHeight: 1.8 }}>
              Help us understand how visitors use our website so we can improve
              performance and user experience.
            </p>

            <h3>
              <FaCheckCircle color="#2196F3" /> Functional Cookies
            </h3>
            <p style={{ color: "#555", lineHeight: 1.8 }}>
              Remember your preferences, language, and settings for a better
              experience.
            </p>
          </div>

          <hr style={{ margin: "30px 0" }} />

          <h2>Your Choices</h2>

          <p style={{ color: "#555", lineHeight: 1.9 }}>
            You can accept or reject non-essential cookies through our cookie
            banner when visiting the website. You may also change your browser
            settings to block or delete cookies at any time.
          </p>

          <p style={{ color: "#555", lineHeight: 1.9 }}>
            Please note that disabling certain cookies may affect the
            functionality of some features on Zingle.
          </p>

          <hr style={{ margin: "30px 0" }} />

          <h2>Privacy Commitment</h2>

          <div
            style={{
              background: "#E3F2FD",
              padding: 25,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <FaShieldAlt
              style={{
                color: "#2196F3",
                fontSize: 40,
                marginBottom: 10,
              }}
            />

            <p
              style={{
                color: "#333",
                lineHeight: 1.8,
              }}
            >
              We respect your privacy. Zingle does not sell your personal
              information. Any data collected is used only to improve our
              services and maintain a secure platform.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          textAlign: "center",
          padding: "70px 20px",
          background: "#2196F3",
          color: "#fff",
        }}
      >
        <h2>Your Privacy Matters</h2>

        <p
          style={{
            maxWidth: 700,
            margin: "20px auto",
            lineHeight: 1.8,
          }}
        >
          Learn more about how we collect, use, and protect your information by
          reading our Privacy Policy.
        </p>

        <Link
          to="/privacy"
          style={{
            display: "inline-block",
            marginTop: 20,
            background: "#fff",
            color: "#2196F3",
            padding: "14px 30px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Read Privacy Policy
        </Link>
      </section>
    </div>
  );
}
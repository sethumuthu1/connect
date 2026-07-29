import React from "react";
import { Link } from "react-router-dom";
import {
  FaGavel,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
} from "react-icons/fa";

export default function Rules() {
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
        <FaGavel style={{ fontSize: 60, marginBottom: 20 }} />

        <h1 style={{ fontSize: 46, marginBottom: 15 }}>
          Community Rules
        </h1>

        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          Our goal is to create a safe, friendly, and respectful environment
          where everyone can enjoy meeting new people. Please follow these
          community rules while using Zingle.
        </p>
      </section>

      {/* Rules */}
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
          <h2>✅ What You Should Do</h2>

          <div style={card}>
            <FaCheckCircle style={goodIcon} />
            <div>
              <h3>Be Respectful</h3>
              <p style={text}>
                Treat everyone with kindness and respect regardless of age,
                gender, nationality, religion, or background.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaCheckCircle style={goodIcon} />
            <div>
              <h3>Have Friendly Conversations</h3>
              <p style={text}>
                Use Zingle to make friends, practice languages, or enjoy casual
                conversations.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaCheckCircle style={goodIcon} />
            <div>
              <h3>Report Bad Behaviour</h3>
              <p style={text}>
                If someone violates these rules, report them so we can take
                appropriate action.
              </p>
            </div>
          </div>

          <hr style={divider} />

          <h2>❌ What Is Not Allowed</h2>

          <div style={card}>
            <FaTimesCircle style={badIcon} />
            <div>
              <h3>Harassment or Bullying</h3>
              <p style={text}>
                Do not threaten, insult, bully, or harass other users.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaTimesCircle style={badIcon} />
            <div>
              <h3>Explicit or Adult Content</h3>
              <p style={text}>
                Nudity, sexually explicit content, or inappropriate behaviour is
                strictly prohibited.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaTimesCircle style={badIcon} />
            <div>
              <h3>Hate Speech</h3>
              <p style={text}>
                Do not promote hatred, violence, discrimination, or abusive
                language.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaTimesCircle style={badIcon} />
            <div>
              <h3>Spam</h3>
              <p style={text}>
                Do not send repeated messages, advertisements, scams, or fake
                promotions.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaTimesCircle style={badIcon} />
            <div>
              <h3>Illegal Activities</h3>
              <p style={text}>
                Using Zingle for illegal activities or encouraging illegal
                behaviour is prohibited.
              </p>
            </div>
          </div>

          <div style={card}>
            <FaTimesCircle style={badIcon} />
            <div>
              <h3>Impersonation</h3>
              <p style={text}>
                Do not pretend to be another person or misrepresent your
                identity.
              </p>
            </div>
          </div>

          <hr style={divider} />

          <h2>Safety Tips</h2>

          <div
            style={{
              background: "#E3F2FD",
              borderRadius: 15,
              padding: 25,
              marginTop: 20,
            }}
          >
            <FaShieldAlt
              style={{
                fontSize: 40,
                color: "#2196F3",
                marginBottom: 15,
              }}
            />

            <ul
              style={{
                lineHeight: 2,
                color: "#555",
                paddingLeft: 20,
              }}
            >
              <li>Never share your passwords.</li>
              <li>Do not share bank or payment information.</li>
              <li>Avoid sharing your home address.</li>
              <li>Report suspicious users immediately.</li>
              <li>End conversations that make you uncomfortable.</li>
            </ul>
          </div>

          <hr style={divider} />

          <h2>Violations</h2>

          <p style={text}>
            Users who violate these Community Rules may receive warnings,
            temporary suspensions, or permanent bans depending on the severity
            of the violation.
          </p>

          <hr style={divider} />

          <h2>Questions?</h2>

          <p style={text}>
            If you have any questions about these rules or need assistance,
            please contact our support team.
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
              Contact Support
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
  gap: 20,
  marginTop: 25,
  alignItems: "flex-start",
};

const goodIcon = {
  color: "#28a745",
  fontSize: 28,
  minWidth: 28,
};

const badIcon = {
  color: "#dc3545",
  fontSize: 28,
  minWidth: 28,
};
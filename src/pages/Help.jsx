import React from "react";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaVideo,
  FaUserShield,
  FaEnvelope,
  FaComments,
  FaGlobe,
} from "react-icons/fa";

export default function Help() {
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
        <FaQuestionCircle style={{ fontSize: 60, marginBottom: 20 }} />

        <h1 style={{ fontSize: 48, marginBottom: 15 }}>
          Help Center
        </h1>

        <p
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          Welcome to the Zingle Help Center. Find answers to common questions,
          learn how to use our platform, and get support whenever you need it.
        </p>
      </section>

      {/* Help Cards */}
      <section
        style={{
          maxWidth: 1200,
          margin: "60px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 25,
        }}
      >
        {[
          {
            icon: <FaVideo />,
            title: "Video Chat",
            text: "Start a random video chat instantly with people from around the world.",
          },
          {
            icon: <FaComments />,
            title: "Text Chat",
            text: "Prefer typing? Enjoy anonymous conversations without sharing personal information.",
          },
          {
            icon: <FaUserShield />,
            title: "Safety",
            text: "Learn how to stay safe and report inappropriate behaviour while chatting.",
          },
          {
            icon: <FaGlobe />,
            title: "Global Community",
            text: "Meet people from different countries and discover new cultures.",
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 18,
              boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#2196F3",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p
              style={{
                color: "#666",
                lineHeight: 1.8,
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </section>

      {/* FAQ */}
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
          <h2 style={{ marginBottom: 30 }}>
            Frequently Asked Questions
          </h2>

          <h3>Is Zingle free?</h3>
          <p style={textStyle}>
            Yes. Zingle offers free random video chat and anonymous text chat.
          </p>

          <hr style={divider} />

          <h3>Do I need to create an account?</h3>
          <p style={textStyle}>
            No. You can start chatting instantly without registration.
          </p>

          <hr style={divider} />

          <h3>Can I report abusive users?</h3>
          <p style={textStyle}>
            Yes. If someone violates our community rules, please use the report
            feature or contact our support team.
          </p>

          <hr style={divider} />

          <h3>How can I stay safe?</h3>
          <p style={textStyle}>
            Never share personal information such as your address, passwords,
            banking details, or other sensitive information with strangers.
          </p>

          <hr style={divider} />

          <h3>Why can't I access my camera?</h3>
          <p style={textStyle}>
            Please allow camera and microphone permissions in your browser.
            Also ensure that another application is not using your camera.
          </p>

          <hr style={divider} />

          <h3>Which devices are supported?</h3>
          <p style={textStyle}>
            Zingle works on most modern desktops, laptops, tablets, and mobile
            devices using supported browsers.
          </p>
        </div>
      </section>

      {/* Support */}
      <section
        style={{
          maxWidth: 1000,
          margin: "60px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#2196F3",
            color: "#fff",
            borderRadius: 18,
            padding: 40,
            textAlign: "center",
          }}
        >
          <FaEnvelope
            style={{
              fontSize: 50,
              marginBottom: 20,
            }}
          />

          <h2>Still Need Help?</h2>

          <p
            style={{
              lineHeight: 1.8,
              maxWidth: 700,
              margin: "20px auto",
            }}
          >
            If you couldn't find the answer you're looking for, our support team
            is here to help.
          </p>

          <Link
            to="/contact"
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
            Contact Support
          </Link>
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
  margin: "25px 0",
};
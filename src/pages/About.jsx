import React from "react";
import { Link } from "react-router-dom";
import {
  FaGlobe,
  FaShieldAlt,
  FaUsers,
  FaComments,
  FaHeart,
  FaRocket,
} from "react-icons/fa";

export default function About() {
  return (
    <div style={{ background: "#f8fcff", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg,#e8f7ff,#bfe9ff)",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#111",
            marginBottom: 20,
          }}
        >
          About Zingle
        </h1>

        <p
          style={{
            maxWidth: 850,
            margin: "auto",
            fontSize: 18,
            lineHeight: 1.8,
            color: "#555",
          }}
        >
          Zingle is a modern random video chat and anonymous text chat platform
          built for people who love meeting new friends from around the world.
          Our goal is to make online conversations simple, fast, safe, and
          meaningful without requiring registration.
        </p>
      </section>

      {/* Story */}

      <section
        style={{
          maxWidth: 1200,
          margin: "70px auto",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 34,
            marginBottom: 20,
            color: "#111",
          }}
        >
          Our Story
        </h2>

        <p
          style={{
            lineHeight: 1.9,
            color: "#555",
            fontSize: 17,
          }}
        >
          We created Zingle because meeting new people online should be easy.
          Many existing platforms are filled with advertisements, fake accounts,
          complicated registration processes, and outdated user interfaces.
          Zingle focuses on simplicity while providing a clean and modern
          chatting experience for everyone.

          <br />
          <br />

          Whether you're looking to make friends, improve your English, learn
          about different cultures, or simply have interesting conversations,
          Zingle gives you an instant way to connect with real people from all
          over the world.
        </p>
      </section>

      {/* Features */}

      <section
        style={{
          maxWidth: 1200,
          margin: "60px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 25,
        }}
      >
        {[
          {
            icon: <FaUsers />,
            title: "Meet New People",
            text: "Connect instantly with people worldwide through random matching.",
          },
          {
            icon: <FaComments />,
            title: "Text & Video Chat",
            text: "Choose between anonymous text chat or high-quality video chat.",
          },
          {
            icon: <FaShieldAlt />,
            title: "Privacy First",
            text: "No registration required. Your privacy and security are important.",
          },
          {
            icon: <FaGlobe />,
            title: "Worldwide Community",
            text: "Chat with users from different countries and cultures.",
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 30,
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                margin: "auto",
                borderRadius: "50%",
                background: "#2196F3",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 28,
                marginBottom: 20,
              }}
            >
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </section>

      {/* Mission */}

      <section
        style={{
          maxWidth: 1000,
          margin: "70px auto",
          background: "#fff",
          borderRadius: 20,
          padding: 50,
          boxShadow: "0 10px 35px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Our Mission
        </h2>

        <p
          style={{
            lineHeight: 2,
            color: "#555",
            fontSize: 17,
          }}
        >
          Our mission is to help people build meaningful connections regardless
          of location, language, or culture.

          <br />
          <br />

          We believe technology should bring people together instead of creating
          barriers. Every feature in Zingle is designed to make conversations
          natural, enjoyable, and safe.

          <br />
          <br />

          We continue improving our platform by introducing smarter matching,
          better moderation, faster connections, and an even more user-friendly
          experience.
        </p>
      </section>

      {/* Why Choose */}

      <section
        style={{
          maxWidth: 1200,
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          Why Choose Zingle?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 25,
          }}
        >
          {[
            "Free random video chat",
            "Anonymous text chat",
            "Fast matching",
            "Global community",
            "No registration",
            "Mobile friendly",
            "Clean modern interface",
            "Privacy focused",
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: 22,
                borderRadius: 15,
                display: "flex",
                alignItems: "center",
                gap: 15,
                boxShadow: "0 8px 20px rgba(0,0,0,.08)",
              }}
            >
              <FaHeart color="#2196F3" />

              <span
                style={{
                  fontWeight: 600,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background: "#2196F3",
          color: "#fff",
        }}
      >
        <FaRocket
          style={{
            fontSize: 50,
            marginBottom: 20,
          }}
        />

        <h2
          style={{
            fontSize: 40,
          }}
        >
          Ready to Meet Someone New?
        </h2>

        <p
          style={{
            maxWidth: 700,
            margin: "20px auto",
            lineHeight: 1.8,
            fontSize: 18,
          }}
        >
          Join thousands of people already using Zingle to make new friends,
          discover different cultures, and enjoy meaningful conversations every
          day.
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: 25,
            background: "#fff",
            color: "#2196F3",
            padding: "16px 40px",
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Start Chatting
        </Link>
      </section>
    </div>
  );
}
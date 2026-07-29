import React from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaArrowRight,
  FaVideo,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

const blogs = [
  {
    id: 1,
    title: "Best Random Video Chat Platforms in 2026",
    date: "July 30, 2026",
    icon: <FaVideo />,
    description:
      "Discover the best random video chat platforms to meet new people, make friends, and enjoy secure online conversations.",
  },
  {
    id: 2,
    title: "10 Tips to Stay Safe While Video Chatting",
    date: "July 28, 2026",
    icon: <FaShieldAlt />,
    description:
      "Learn how to protect your privacy and enjoy a safe experience while chatting with strangers online.",
  },
  {
    id: 3,
    title: "How Random Video Chat Helps You Meet New Friends",
    date: "July 25, 2026",
    icon: <FaUsers />,
    description:
      "Explore how random video chat can help you connect with people from different countries and cultures.",
  },
];

export default function Blog() {
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
        <h1 style={{ fontSize: "48px", marginBottom: 15 }}>Zingle Blog</h1>

        <p
          style={{
            maxWidth: 750,
            margin: "0 auto",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          Read the latest articles about random video chat, online safety,
          meeting new people, anonymous chat, and technology updates.
        </p>
      </section>

      {/* Featured */}
      <section
        style={{
          maxWidth: 1200,
          margin: "60px auto",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 40,
            color: "#222",
          }}
        >
          Latest Articles
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 30,
          }}
        >
          {blogs.map((blog) => (
            <div
              key={blog.id}
              style={{
                background: "#fff",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                transition: ".3s",
              }}
            >
              <div
                style={{
                  background: "#2196F3",
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 60,
                  color: "#fff",
                }}
              >
                {blog.icon}
              </div>

              <div style={{ padding: 25 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#777",
                    fontSize: 14,
                    marginBottom: 15,
                  }}
                >
                  <FaCalendarAlt />
                  {blog.date}
                </div>

                <h3
                  style={{
                    color: "#222",
                    marginBottom: 15,
                    lineHeight: 1.5,
                  }}
                >
                  {blog.title}
                </h3>

                <p
                  style={{
                    color: "#666",
                    lineHeight: 1.8,
                    marginBottom: 25,
                  }}
                >
                  {blog.description}
                </p>

                <button
                  style={{
                    background: "#2196F3",
                    color: "#fff",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Read More
                  <FaArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section
        style={{
          maxWidth: 1000,
          margin: "70px auto",
          background: "#fff",
          padding: 40,
          borderRadius: 20,
          boxShadow: "0 8px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>
          Why Read the Zingle Blog?
        </h2>

        <p
          style={{
            lineHeight: 2,
            color: "#555",
            fontSize: 17,
          }}
        >
          The Zingle Blog is dedicated to helping users enjoy a better online
          chatting experience. We regularly publish articles covering random
          video chat, anonymous chat, online privacy, internet safety, language
          learning, making new friends, and the latest communication trends.
          Whether you're a first-time visitor or a regular user, our guides are
          designed to make your conversations more enjoyable and secure.
        </p>

        <p
          style={{
            lineHeight: 2,
            color: "#555",
            marginTop: 20,
            fontSize: 17,
          }}
        >
          We also share tips on improving your video chat quality, staying safe
          online, and discovering new ways to connect with people around the
          world.
        </p>
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
        <h2 style={{ fontSize: 38, marginBottom: 20 }}>
          Ready to Start Chatting?
        </h2>

        <p
          style={{
            maxWidth: 700,
            margin: "0 auto 30px",
            lineHeight: 1.8,
            fontSize: 18,
          }}
        >
          Join thousands of people already using Zingle to meet new friends
          through anonymous text and random video chat.
        </p>

        <Link
          to="/"
          style={{
            background: "#fff",
            color: "#2196F3",
            padding: "15px 35px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Start Chatting
        </Link>
      </section>
    </div>
  );
}
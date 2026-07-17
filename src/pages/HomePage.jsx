import React, { useState, useEffect } from "react";
import { 
  FaVideo, 
  FaComments, 
  FaUserFriends, 
  FaSun, 
  FaMoon, 
  FaPlus,
  FaTimes,
  FaCheck,
  FaStar,
  FaHeart,
  FaRocket,
  FaSmile,
  FaPlay,
  FaCog,
  FaSearch,
  FaUsers,
  FaBars, 
  FaGlobe,
  FaLock,
  FaBell
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/home.css";

// Single shared socket connection for the landing page.
// Replace with your actual backend URL (same one used by /textchat and /videochat).
const socket = io("https://your-backend-url.com");

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState(["All"]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0); // first FAQ open by default

  const predefinedInterests = [
    "Music", "Gaming", "Art", "Technology", "Sports", 
    "Travel", "Food", "Movies", "Books", "Fitness",
    "Photography", "Dance", "Fashion", "Science", "Business"
  ];

  const features = [
    {
      icon: <FaUserFriends />,
      title: "Smart Matching",
      description: "Connect with people who share your interests and passions through our intelligent algorithm."
    },
    {
      icon: <FaGlobe />,
      title: "Global Community",
      description: "Meet people from around the world and discover diverse cultures and perspectives."
    },
    {
      icon: <FaLock />,
      title: "Privacy First",
      description: "Your conversations are secure with end-to-end encryption and privacy controls."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Travel Blogger",
      content: "I've met incredible people from different cultures through Connect. It's completely changed how I make friends online!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "As a remote worker, this platform helped me build meaningful friendships across the globe. The video quality is outstanding!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emma Rodriguez",
      role: "Language Teacher",
      content: "Perfect for practicing languages with native speakers. I've improved my Spanish significantly while making new friends!",
      rating: 5,
      avatar: "ER"
    }
  ];

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Live online users count — pushed by the backend over the "online-count" event
  useEffect(() => {
    socket.on("online-count", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("online-count");
    };
  }, []);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (newInterest.trim() && !selectedInterests.includes(newInterest.trim())) {
      setSelectedInterests([...selectedInterests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    if (interest !== "All") {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    }
  };

  return (
    <div className="landing-container">
      {/* INTEREST MODAL */}
      {showInterestModal && (
        <div className="modal-overlay">
          <div className="interest-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <FaSmile className="modal-title-icon" />
                <h2>Customize Your Interests</h2>
              </div>
              <button 
                className="close-modal"
                onClick={() => setShowInterestModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="current-interests-section">
                <h3>Your Selected Interests</h3>
                <div className="interest-chips">
                  {selectedInterests.map(interest => (
                    <div key={interest} className="interest-chip">
                      <span>{interest}</span>
                      {interest !== "All" && (
                        <button 
                          className="remove-interest"
                          onClick={() => removeInterest(interest)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="add-interest-section">
                <h3>Add Custom Interest</h3>
                <div className="interest-input-container">
                  <input
                    type="text"
                    placeholder="Type your interest here..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                    className="interest-input"
                  />
                  <button 
                    className="add-interest-btn"
                    onClick={addCustomInterest}
                    disabled={!newInterest.trim()}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              
              <div className="predefined-interests-section">
                <h3>Popular Interests</h3>
                <div className="interest-categories">
                  {predefinedInterests.map(interest => (
                    <button
                      key={interest}
                      className={`interest-category ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => toggleInterest(interest)}
                    >
                      <span className="interest-name">{interest}</span>
                      {selectedInterests.includes(interest) && (
                        <FaCheck className="selected-check" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="save-interests-btn"
                onClick={() => setShowInterestModal(false)}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      {/* HEADER */}
<header
  style={{
    width: "100%",
    fontFamily: "Arial, Helvetica, sans-serif",
    position: "relative",
    zIndex: 100,
  }}
>


  <div
    style={{
      width: "100%",
      background: "#ffffff",
      borderBottom: "1px solid #e0e0e0",
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* LEFT: Logo + Name + Tilted Tagline */}
    {/* LEFT: Logo + Name + Tilted Tagline */}
<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <svg width="34" height="34" viewBox="0 0 34 34" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="zingleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FACFE" />
          <stop offset="100%" stopColor="#2C6FF0" />
        </linearGradient>
      </defs>
      <circle cx="17" cy="17" r="17" fill="url(#zingleGrad)" />
      <path
        d="M17 6a11 11 0 100 22 11 11 0 000-22zm0 4a7 7 0 015.6 11.2A6.98 6.98 0 0117 24a7 7 0 010-14z"
        fill="#ffffff"
      />
      <circle cx="17" cy="13.5" r="2.3" fill="#ffffff" />
    </svg>

    <span
      style={{
        fontSize: "26px",
        fontWeight: 800,
        color: "#222",
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
      }}
    >
      Zingle
    </span>
  </div>

  <span
    className="desktop-only"
    style={{
      fontSize: "24px",
      fontWeight: 700,
      color: "#111",
      whiteSpace: "nowrap",
      display: "inline-block",
      transform: "rotate(-3deg)",
      transformOrigin: "center center",
      marginLeft: "80px",
    }}
  >
    Talk to strangers!
  </span>
</div>

    {/* RIGHT: share buttons + online count + your existing controls */}
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <div
        className="desktop-only"
        style={{ display: "flex", alignItems: "center", gap: "6px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#3b5998",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: "3px",
          }}
        >
          <span style={{ fontWeight: 900 }}>f</span>
          <span>Share</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#1da1f2",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: "3px",
          }}
        >
          <span style={{ fontWeight: 900 }}>t</span>
          <span>Tweet</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background: "#2ecc71",
            display: "inline-block",
          }}
        />
        <span
          style={{
            color: "#2196F3",
            fontWeight: 800,
            fontSize: "20px",
            whiteSpace: "nowrap",
          }}
        >
          {onlineUsers.toLocaleString()}+ online now
        </span>
      </div>

      <div className="header-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* <button
          className="interest-btn"
          onClick={() => setShowInterestModal(true)}
          title="Manage Interests"
        >
          <FaPlus className="btn-icon" />
          <span className="btn-text">Interests</span>
        </button> */}

        {/* <button
          className="theme-toggle-btn desktop-only"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button> */}

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* <button className="get-started-btn desktop-only" onClick={() => navigate("/videochat")}>
        Start Chatting
      </button> */}
    </div>

    {/* Mobile Navigation (unchanged) */}
    <div className={`mobile-nav-overlay ${mobileMenuOpen ? "active" : ""}`}>
      <nav className="mobile-nav">
        <div className="mobile-nav-header">
          <div className="mobile-logo">
            <FaComments className="logo-icon" />
            <span>Zingle</span>
          </div>
          <button className="close-mobile-nav" onClick={() => setMobileMenuOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="mobile-nav-content">
          <div className="mobile-online-indicator">
            <div className="pulse-dot"></div>
            <span>{onlineUsers.toLocaleString()} online</span>
          </div>

          <div className="mobile-theme-toggle">
            <span>Theme</span>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          <div className="mobile-nav-actions">
            <button
              className="mobile-get-started"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/videochat");
              }}
            >
              Start Video Chat
            </button>
          </div>
        </div>
      </nav>
    </div>
  </div>
</header>

      {/* HERO SECTION */}
      {/* HERO SECTION */}
<section
  style={{
    minHeight: "85vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #d4f0fc 0%, #a8ddf7 55%, #7bc9f0 100%)",
  }}
>
  {/* visible dot grid pattern */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1.5px, transparent 1.5px)",
      backgroundSize: "26px 26px",
      opacity: 0.7,
    }}
  />

  {/* large soft orbs, varying sizes, spread across the section */}
  <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)", filter: "blur(4px)" }} />
  <div style={{ position: "absolute", top: "60px", left: "-100px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(3,155,229,0.35), transparent 70%)", filter: "blur(6px)" }} />
  <div style={{ position: "absolute", bottom: "80px", right: "6%", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)" }} />
  <div style={{ position: "absolute", bottom: "-140px", left: "20%", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(2,136,209,0.3), transparent 70%)", filter: "blur(8px)" }} />
  <div style={{ position: "absolute", top: "30%", right: "18%", width: "90px", height: "90px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.5)" }} />
  <div style={{ position: "absolute", top: "12%", left: "12%", width: "50px", height: "50px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)" }} />

  {/* sparkle accents */}
  <div style={{ position: "absolute", top: "40%", right: "8%", fontSize: "30px", color: "#ffffff", opacity: 0.9 }}>✦</div>
  <div style={{ position: "absolute", bottom: "18%", left: "8%", fontSize: "22px", color: "#ffffff", opacity: 0.8 }}>✦</div>
  <div style={{ position: "absolute", top: "16%", right: "30%", fontSize: "16px", color: "#ffffff", opacity: 0.7 }}>✦</div>

  {/* bottom wave */}
  <svg
    viewBox="0 0 1440 120"
    preserveAspectRatio="none"
    style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "90px", zIndex: 1 }}
  >
    <path
      d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
      fill="rgba(255,255,255,0.5)"
    />
  </svg>

  {/* main card */}
  <div
    style={{
      position: "relative",
      background: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 25px 70px rgba(2,80,130,0.18)",
      padding: "56px 48px",
      maxWidth: "760px",
      width: "100%",
      textAlign: "center",
      zIndex: 2,
    }}
  >
    <h1
      style={{
        fontSize: "40px",
        fontWeight: 600,
        color: "#111",
        marginBottom: "18px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      Chat with Strangers
    </h1>

    <p
      style={{
        fontSize: "16px",
        color: "#555",
        lineHeight: "1.6",
        maxWidth: "480px",
        margin: "0 auto 36px",
      }}
    >
      One click away from your next great conversation.{" "}
      <span style={{ color: "#0288d1", fontWeight: 700 }}>Zingle</span>{" "}
      pairs you instantly with someone new — no sign-up, no small talk
      required. Just real people, real conversations, right now.
    </p>

    <h3
      style={{
        fontSize: "18px",
        fontWeight: 700,
        color: "#222",
        marginBottom: "18px",
      }}
    >
      Start chatting
    </h3>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "32px",
      }}
    >
      <button
        onClick={() => navigate("/textchat")}
        style={{
          padding: "18px 56px",
          fontSize: "19px",
          fontWeight: 800,
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(41,182,246,0.85), rgba(2,136,209,0.85))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(2,136,209,0.45)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(2,136,209,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(2,136,209,0.45)";
        }}
      >
        Text
      </button>

      <span style={{ color: "#888", fontSize: "15px" }}>or</span>

      <button
        onClick={() => navigate("/videochat")}
        style={{
          padding: "18px 56px",
          fontSize: "19px",
          fontWeight: 800,
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(79,195,247,0.85), rgba(3,155,229,0.85))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(3,155,229,0.45)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(3,155,229,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(3,155,229,0.45)";
        }}
      >
        Video
      </button>
    </div>

    <p
      style={{
        fontSize: "15px",
        fontWeight: 600,
        color: "#333",
        marginBottom: "12px",
      }}
    >
      What's on your mind today?
    </p>

    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto 22px",
        minHeight: "48px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px",
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid #d6eefc",
        background: "#f8fdff",
      }}
    >
      {selectedInterests
        .filter((i) => i !== "All")
        .map((interest) => (
          <span
            key={interest}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "999px",
              background: "#e3f6ff",
              color: "#0288d1",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {interest}
            <FaTimes
              style={{ cursor: "pointer", fontSize: "11px" }}
              onClick={() => removeInterest(interest)}
            />
          </span>
        ))}

      <input
        type="text"
        placeholder={selectedInterests.filter((i) => i !== "All").length === 0 ? "Add your interests (optional)" : ""}
        value={newInterest}
        onChange={(e) => setNewInterest(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
        style={{
          flex: 1,
          minWidth: "120px",
          border: "none",
          outline: "none",
          fontSize: "14px",
          background: "transparent",
        }}
      />
    </div>

    <div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 18px",
          borderRadius: "999px",
          background: "#e3f6ff",
          color: "#0288d1",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        <FaComments style={{ fontSize: "13px" }} />
        Every chat is moderated — connect with confidence
      </span>
    </div>
  </div>
</section>

      {/* FEATURES SECTION */}
     {/* FEATURES SECTION */}
<section
  style={{
    padding: "50px 20px",
    background: "#f8fdff",
  }}
>
  <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
    <div style={{ textAlign: "center", marginBottom: "34px" }}>
      <h2
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: "#1a2b3c",
          marginBottom: "8px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Why Choose Zingle?
      </h2>
      <p style={{ fontSize: "14px", color: "#667", margin: 0 }}>
        Built for quick, real connections — not endless scrolling
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      {[
        {
          icon: <FaUserFriends />,
          title: "Smart Matching",
          description: "Get paired with people who share your interests, not random noise.",
        },
        {
          icon: <FaGlobe />,
          title: "Global Reach",
          description: "Talk to people from 120+ countries, any time of day.",
        },
        {
          icon: <FaLock />,
          title: "Moderated & Safe",
          description: "Active moderation and reporting tools keep chats respectful.",
        },
      ].map((feature, index) => (
        <div
          key={index}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            boxShadow: "0 4px 14px rgba(2,136,209,0.08)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(2,136,209,0.14)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(2,136,209,0.08)";
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              minWidth: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4fc3f7, #0288d1)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            {feature.icon}
          </div>
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#1a2b3c",
                margin: "0 0 4px",
              }}
            >
              {feature.title}
            </h3>
            <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* TESTIMONIALS SECTION */}
      {/* <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What Our Community Says</h2>
            <p className="section-subtitle">
              Hear from real users who have found meaningful connections
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-mark">"</div>
                  <p>{testimonial.content}</p>
                </div>
                
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.avatar}
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <span className="author-role">{testimonial.role}</span>
                    <div className="author-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="star filled" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA SECTION */}
      {/* <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Connecting?</h2>
            <p className="cta-description">
              Join thousands of users worldwide who are already making meaningful connections
            </p>
            
            <div className="cta-actions">
              <button 
                className="cta-primary"
                onClick={() => navigate("/videochat")}
              >
                <FaRocket className="cta-icon" />
                Start Free Today
              </button>
              <button className="cta-secondary">
                <FaPlay className="cta-icon" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section> */}


      {/* FAQ SECTION */}
<section
  style={{
    padding: "80px 20px",
    background: "#ffffff",
    position: "relative",
  }}
>
  <div
    style={{
      position: "absolute",
      top: "20px",
      left: "6%",
      fontSize: "34px",
      color: "#f9a8d4",
      transform: "rotate(10deg)",
    }}
  >
    ✦
  </div>

  <div style={{ maxWidth: "720px", margin: "0 auto" }}>
    <h2
      style={{
        textAlign: "center",
        fontSize: "32px",
        fontWeight: 700,
        color: "#1a2b3c",
        marginBottom: "40px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      Frequently Asked Questions
    </h2>

    {[
      {
        question: "How does interest matching work?",
        answer: (
          <>
            Add topics you're into — like "gaming," "music," or "movies."
            Zingle's matching gives priority to pairing you with people who
            share similar interests, so conversations feel relevant from the
            first message.{" "}
            <a href="#" style={{ color: "#0288d1", fontWeight: 600, textDecoration: "none" }}>
              See tips for great conversations
            </a>
            .
          </>
        ),
      },
      {
        question: "How does Zingle help keep chats safer?",
        answer: (
          <>
            We combine automated detection with human moderation to catch
            and reduce rule-breaking behavior, guided by our{" "}
            <a href="#" style={{ color: "#0288d1", fontWeight: 600, textDecoration: "none" }}>
              Community Guidelines
            </a>
            . Reporting tools are available in every chat. We work hard to
            keep the space positive, but as with any online platform, please
            use good judgment when talking to new people. Read more in our{" "}
            <a href="#" style={{ color: "#0288d1", fontWeight: 600, textDecoration: "none" }}>
              Privacy Policy
            </a>
            .
          </>
        ),
      },
      {
        question: "Why choose Zingle to chat with strangers online?",
        answer: (
          <>
            We're built around better conversations, not just more of them.
            Interest-based matching, active moderation, and a clean
            experience on any device help you find connections that
            actually feel worthwhile. Learn more about what we're building
            in our{" "}
            <a href="#" style={{ color: "#0288d1", fontWeight: 600, textDecoration: "none" }}>
              welcome post
            </a>
            .
          </>
        ),
      },
      {
        question: "Can I use Zingle on my phone?",
        answer: (
          <>
            Yes — Zingle works right in your mobile browser, no app download
            needed. Just open the site, tap Text or Video, and you're
            connected.
          </>
        ),
      },
    ].map((item, index) => {
      const isOpen = openFaq === index;
      return (
        <div
          key={index}
          style={{
            marginBottom: "14px",
            borderRadius: "14px",
            background: isOpen ? "#f8fdff" : "#f6f7f9",
            boxShadow: isOpen ? "0 8px 24px rgba(2,136,209,0.12)" : "none",
            overflow: "hidden",
            transition: "all 0.2s ease",
          }}
        >
          <button
            onClick={() => setOpenFaq(isOpen ? -1 : index)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 700,
              color: "#1a2b3c",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            <span>{item.question}</span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 400,
                color: "#0288d1",
                flexShrink: 0,
                marginLeft: "12px",
              }}
            >
              {isOpen ? "−" : "+"}
            </span>
          </button>

          {isOpen && (
            <div
              style={{
                padding: "0 24px 22px",
                fontSize: "15px",
                lineHeight: "1.7",
                color: "#444",
              }}
            >
              {item.answer}
            </div>
          )}
        </div>
      );
    })}
  </div>
</section>

      {/* FOOTER */}
      {/* FOOTER */}
<footer
  style={{
    padding: "18px 28px",
    background: "#ffffff",
    borderTop: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    fontFamily: "Arial, Helvetica, sans-serif",
  }}
>
  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
    © {new Date().getFullYear()} Zingle.com
  </p>

  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
    <a href="#" style={{ fontSize: "13px", color: "#3b4a6b", textDecoration: "none" }}>
      Blog
    </a>
    <a href="#" style={{ fontSize: "13px", color: "#3b4a6b", textDecoration: "none" }}>
      Rules
    </a>
    <a href="#" style={{ fontSize: "13px", color: "#3b4a6b", textDecoration: "none" }}>
      Terms
    </a>
    <a href="#" style={{ fontSize: "13px", color: "#3b4a6b", textDecoration: "none" }}>
      Privacy
    </a>
    <a href="#" style={{ fontSize: "13px", color: "#3b4a6b", textDecoration: "none" }}>
      Manage Consent
    </a>
  </div>
</footer>
    </div>
  );
}
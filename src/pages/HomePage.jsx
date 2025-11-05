import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
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
import "../styles/home.css";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState(["All"]);
  const [onlineUsers, setOnlineUsers] = useState("1247");
  const navigate = useNavigate();

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
  const socket = io("http://localhost:4000"); // or your backend URL

  socket.on("online-count", (count) => {
    setOnlineUsers(count);
  });

  // Clean up on unmount
  return () => {
    socket.disconnect();
  };
}, []);


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

  // Simulate changing online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 10) - 3;
        return Math.max(1000, prev + change);
      });
    }, 5000);
    
    return () => clearInterval(interval);
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
      <header className="landing-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <FaVideo className="logo-icon" />
              <span className="logo-text">Connect</span>
            </div>
          </div>

          <div className="header-center">
            {/* <div className="online-indicator">
              <div className="pulse-dot"></div>
              <FaUsers className="online-icon" />
              <span className="online-count">{onlineUsers.toLocaleString()}</span>
              <span className="online-text">online now</span>
            </div> */}
          </div>

          <div className="header-right">
            <div className="online-indicator">
  <div className="pulse-dot"></div>
  <FaUsers className="online-icon" />
  <span className="online-count">{onlineUsers}</span>
  <span className="online-text">online now</span>
</div>

            <div className="header-controls">
              <button 
                className="interest-btn"
                onClick={() => setShowInterestModal(true)}
                title="Manage Interests"
              >
                <FaPlus className="btn-icon" />
                <span className="btn-text">Interests</span>
              </button>

              <button 
                className="theme-toggle-btn desktop-only"
                onClick={toggleTheme}
                title="Toggle Theme"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>

            <button className="get-started-btn desktop-only" onClick={() => navigate("/videochat")}>
              Start Chatting
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}>
            <nav className="mobile-nav">
              <div className="mobile-nav-header">
                <div className="mobile-logo">
                  <FaComments className="logo-icon" />
                  <span>Connect</span>
                </div>
                <button 
                  className="close-mobile-nav"
                  onClick={() => setMobileMenuOpen(false)}
                >
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
                  <button 
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                  >
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
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badges">
              <div className="hero-badge">
                <FaRocket className="badge-icon" />
                <span>AI-Powered Matching</span>
              </div>
              <div className="hero-badge">
                <FaLock className="badge-icon" />
                <span>Secure & Private</span>
              </div>
            </div>
            
            <h1 className="hero-title">
              Meet,   <span className="gradient-text">Chat & Connect</span> Instantly
            </h1>
            
            <p className="hero-description">
              Discover authentic conversations with people who share your interests. 
              Our intelligent platform connects you through high-quality video calls 
              that feel natural and engaging.
            </p>
            
            <div className="hero-actions">
              <button 
                className="primary-cta"
                onClick={() => navigate("/videochat")}
              >
                <FaVideo className="cta-icon" />
                Start Free Video Chat
                <div className="cta-glow"></div>
              </button>
              <button className="secondary-cta">
                <FaSearch className="cta-icon" />
                Explore Community
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">120+</div>
                <div className="stat-label">Countries</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9</div>
                <div className="stat-label">
                  <FaStar className="star" />
                  Rating
                </div>
              </div>
            </div>
          </div>

         <div className="hero-visual">
  <div className="visual-container">
    {/* Animated gradient background */}
    <div className="gradient-orbs">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
    </div>
    
    {/* Main video chat mockup */}
    <div className="modern-chat-preview">
      <div className="chat-header">
        <div className="header-users">
          <div className="user-status">
            <div className="status-indicator online"></div>
            <span>You - Online</span>
          </div>
          <div className="user-status">
            <div className="status-indicator online"></div>
            <span>Alex - Connected</span>
          </div>
        </div>
        <div className="call-controls">
          <div className="control-icon mic"></div>
          <div className="control-icon video active"></div>
          <div className="control-icon end-call"></div>
        </div>
      </div>
      
      <div className="video-grid">
        <div className="video-tile local">
          <div className="video-feed">
            <div className="user-avatar">
              <div className="avatar-initials">You</div>
            </div>
            <div className="video-overlay">
              <div className="speaking-indicator"></div>
            </div>
          </div>
        </div>
        
        <div className="video-tile remote">
          <div className="video-feed">
            <div className="user-avatar">
              <div className="avatar-initials">AL</div>
            </div>
            <div className="video-overlay">
              <div className="speaking-indicator active"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="chat-messages">
        <div className="message-row incoming">
          <div className="message-avatar">
            <div className="avatar-small">AL</div>
          </div>
          <div className="message-content">
            <div className="message-bubble">Hey there! 👋 Ready to connect?</div>
            <div className="message-time">2:30 PM</div>
          </div>
        </div>
        
        <div className="message-row outgoing">
          <div className="message-content">
            <div className="message-bubble">Absolutely! Love your profile picture! 😊</div>
            <div className="message-time">2:31 PM</div>
          </div>
          <div className="message-avatar">
            <div className="avatar-small">You</div>
          </div>
        </div>
        
        <div className="message-row incoming">
          <div className="message-avatar">
            <div className="avatar-small">AL</div>
          </div>
          <div className="message-content">
            <div className="message-bubble">Thanks! I see we both love hiking 🏔️</div>
            <div className="message-time">2:32 PM</div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Floating feature highlights */}
    <div className="floating-highlights">
      <div className="highlight-card highlight-1">
        <div className="highlight-icon">
          <FaUserFriends />
        </div>
        <div className="highlight-content">
          <span className="highlight-title">Smart Matching</span>
          <span className="highlight-desc">AI-powered connections</span>
        </div>
        <div className="highlight-glow"></div>
      </div>
      
      <div className="highlight-card highlight-2">
        <div className="highlight-icon">
          <FaVideo />
        </div>
        <div className="highlight-content">
          <span className="highlight-title">HD Quality</span>
          <span className="highlight-desc">Crystal clear video</span>
        </div>
        <div className="highlight-glow"></div>
      </div>
      
      <div className="highlight-card highlight-3">
        <div className="highlight-icon">
          <FaGlobe />
        </div>
        <div className="highlight-content">
          <span className="highlight-title">Global</span>
          <span className="highlight-desc">120+ countries</span>
        </div>
        <div className="highlight-glow"></div>
      </div>
    </div>
  </div>
</div>
        </div>
        
        <div className="hero-background">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Connect?</h2>
            <p className="section-subtitle">
              Experience the difference with features designed for authentic connections
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-highlight"></div>
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
      <section className="cta-section">
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
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-brand">
                <div className="footer-logo">
                  <FaVideo className="logo-icon" />
                  <span className="logo-text">Connect</span>
                </div>
                <p className="footer-description">
                  Building meaningful connections through authentic video conversations.
                </p>
              </div>
              
              <div className="footer-links">
                <div className="link-column">
                  <h4>Platform</h4>
                  <a href="#features">Features</a>
                  <a href="#community">Community</a>
                  <a href="#testimonials">Testimonials</a>
                </div>
                
                <div className="link-column">
                  <h4>Support</h4>
                  <a href="#">Help Center</a>
                  <a href="#">Contact Us</a>
                  <a href="#">Safety Tips</a>
                </div>
                
                <div className="link-column">
                  <h4>Company</h4>
                  <a href="#">About Us</a>
                  <a href="#">Careers</a>
                  <a href="#">Contact</a>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <div className="footer-copyright">
                © {new Date().getFullYear()} Connect. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
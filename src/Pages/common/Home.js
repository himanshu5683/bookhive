/* bookhive/src/components/Home.js */
import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContext from "../../auth/AuthContext";
import { resourcesService, storiesService, circlesService, usersService } from "../../services/api"; // Fixed: Import proper services instead of apiClient
import "../../styles/Home.css";
import ResourceCard from "./ResourceCard";

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trendingResources, setTrendingResources] = useState([]);
    const [latestStories, setLatestStories] = useState([]);
    const [popularCircles, setPopularCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalResources: 0,
        totalUsers: 0,
        totalDownloads: 0
    });

    // Fetch home page data
    const fetchHomeData = async () => {
        try {
            setLoading(true);
            try {
                // Fetch trending resources
                const resourcesRes = await resourcesService.getAll({ limit: 6, sort: 'rating' });
                setTrendingResources(resourcesRes.resources || []);
                
                // Fetch latest stories
                const storiesRes = await storiesService.getAll({ limit: 4 });
                setLatestStories(storiesRes.stories || []);
                
                // Fetch popular circles (sort by memberCount)
                const circlesRes = await circlesService.getAll({ limit: 4, sort: '-memberCount' });
                setPopularCircles(circlesRes.circles || []);
                
                // Fetch stats from resources endpoint
                const resourcesResCount = await resourcesService.getAll({ limit: 100 }); // Get more resources to calculate total downloads accurately
                
                // Calculate total downloads more efficiently
                let totalDownloads = 0;
                if (resourcesResCount.resources) {
                    for (const resource of resourcesResCount.resources) {
                        totalDownloads += resource.downloads || 0;
                    }
                }
                
                // For total users, we'll estimate based on unique authors in resources
                const uniqueAuthors = new Set();
                if (resourcesResCount.resources) {
                    resourcesResCount.resources.forEach(resource => {
                        if (resource.authorId) {
                            uniqueAuthors.add(resource.authorId);
                        }
                    });
                }
                
                setStats({
                    totalResources: resourcesResCount.total || 0,
                    totalUsers: uniqueAuthors.size || 0,
                    totalDownloads: totalDownloads
                });
            } catch (err) {
                console.error('Error fetching home data:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <motion.section 
                className="hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="hero-content">
                    <motion.div 
                        className="hero-text"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <motion.h1 
                            className="hero-title"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            Welcome to BookHive
                        </motion.h1>
                        <motion.p 
                            className="hero-subtitle"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            Connect, Share, and Learn with Fellow Students
                        </motion.p>
                        <motion.div 
                            className="hero-stats"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            <div className="stat-item">
                                <motion.span 
                                    className="stat-number"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {stats.totalResources.toLocaleString()}
                                </motion.span>
                                <span className="stat-label">Resources</span>
                            </div>
                            <div className="stat-item">
                                <motion.span 
                                    className="stat-number"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {stats.totalUsers.toLocaleString()}
                                </motion.span>
                                <span className="stat-label">Learners</span>
                            </div>
                            <div className="stat-item">
                                <motion.span 
                                    className="stat-number"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {stats.totalDownloads.toLocaleString()}
                                </motion.span>
                                <span className="stat-label">Downloads</span>
                            </div>
                        </motion.div>
                    </motion.div>
                    
                    <motion.div 
                        className="hero-buttons"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                    >
                        {user ? (
                            <>
                                <motion.button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/upload')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                >
                                    📤 Upload Resource
                                </motion.button>
                                <motion.button 
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => navigate('/dashboard')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3 }}
                                >
                                    📊 My Dashboard
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/signup')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                >
                                    🚀 Get Started
                                </motion.button>
                                <motion.button 
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => navigate('/resources')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3 }}
                                >
                                    🔍 Browse Resources
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                </div>
                
                <motion.div 
                    className="hero-illustration"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                >
                    <motion.div 
                        className="hero-image-placeholder"
                        animate={{ 
                            y: [0, -10, 0],
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <span className="hero-image-icon">📚</span>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <motion.section 
                className="features-section section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="container">
                    <motion.div 
                        className="section-header text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h2 className="section-title">Powerful Learning Platform</h2>
                        <p className="section-subtitle">Everything you need to enhance your learning journey</p>
                    </motion.div>
                    
                    <div className="features-grid">
                        {["📚", "👥", "📖", "🤖"].map((icon, index) => (
                            <motion.div 
                                key={index}
                                className="feature-card card"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                whileHover={{ 
                                    y: -10,
                                    boxShadow: "var(--bh-shadow-lg)",
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.div 
                                    className="feature-icon"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: index * 0.2
                                    }}
                                >
                                    {icon}
                                </motion.div>
                                <h3>{[
                                    "Share Resources",
                                    "Join Communities",
                                    "Read Stories",
                                    "AI Assistance"
                                ][index]}</h3>
                                <p>{[
                                    "Upload notes, PDFs, and study materials for others. Build a collaborative learning community.",
                                    "Connect with study groups and discussion circles. Collaborate with peers worldwide.",
                                    "Discover inspiring academic journeys and experiences from fellow learners.",
                                    "Get personalized book recommendations, content summarization, and smart search."
                                ][index]}</p>
                                <motion.button 
                                    className="btn btn-secondary" 
                                    onClick={() => navigate([
                                        '/resources',
                                        '/circles',
                                        '/stories',
                                        '/ai/chat'
                                    ][index])}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {[
                                        "Explore Resources",
                                        "Find Circles",
                                        "Read Stories",
                                        "Try AI Assistant"
                                    ][index]}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Trending Resources */}
            <motion.section 
                className="section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container">
                    <motion.div 
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div>
                            <h2 className="section-title">🔥 Trending Resources</h2>
                            <p className="section-subtitle">Most popular learning materials this week</p>
                        </div>
                        <motion.button 
                            className="btn btn-outline" 
                            onClick={() => navigate('/resources')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View All Resources →
                        </motion.button>
                    </motion.div>
                    
                    {loading ? (
                        <motion.div 
                            className="loading-skeleton-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {[...Array(6)].map((_, index) => (
                                <motion.div 
                                    key={index} 
                                    className="skeleton-card"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                />
                            ))}
                        </motion.div>
                    ) : trendingResources.length > 0 ? (
                        <motion.div 
                            className="resources-grid"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {trendingResources.slice(0, 6).map((resource, index) => (
                                <motion.div
                                    key={resource._id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ 
                                        y: -5,
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <ResourceCard key={resource._id} resource={resource} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="empty-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="empty-icon">📚</div>
                            <h3>No trending resources found</h3>
                            <p>Be the first to upload a resource and start the trend!</p>
                            <motion.button 
                                className="btn btn-primary"
                                onClick={() => navigate('/upload')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Upload Resource
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </motion.section>

            {/* Latest Stories */}
            <motion.section 
                className="section bg-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container">
                    <motion.div 
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div>
                            <h2 className="section-title">📖 Latest Stories</h2>
                            <p className="section-subtitle">Inspiring journeys from our community</p>
                        </div>
                        <motion.button 
                            className="btn btn-outline" 
                            onClick={() => navigate('/stories')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View All Stories →
                        </motion.button>
                    </motion.div>
                    
                    {loading ? (
                        <motion.div 
                            className="loading-skeleton-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {[...Array(4)].map((_, index) => (
                                <motion.div 
                                    key={index} 
                                    className="skeleton-card"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                />
                            ))}
                        </motion.div>
                    ) : latestStories.length > 0 ? (
                        <motion.div 
                            className="stories-grid"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {latestStories.map((story, index) => (
                                <motion.div
                                    key={story._id}
                                    className="story-card card"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ 
                                        y: -5,
                                        boxShadow: "var(--bh-shadow-md)",
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <h3 className="story-title">{story.title}</h3>
                                    <p className="story-author">by {story.author}</p>
                                    <p className="story-excerpt">{story.content.substring(0, 120)}...</p>
                                    <div className="story-meta">
                                        <span className="story-date">
                                            {new Date(story.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <motion.button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => navigate(`/stories/${story._id}`)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Read More
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="empty-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="empty-icon">📖</div>
                            <h3>No stories published yet</h3>
                            <p>Share your learning journey with the community!</p>
                            <motion.button 
                                className="btn btn-primary"
                                onClick={() => navigate('/stories')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Share Your Story
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </motion.section>

            {/* Popular Study Circles */}
            <motion.section 
                className="section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container">
                    <motion.div 
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div>
                            <h2 className="section-title">👥 Popular Study Circles</h2>
                            <p className="section-subtitle">Join active learning communities</p>
                        </div>
                        <motion.button 
                            className="btn btn-outline" 
                            onClick={() => navigate('/circles')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Browse All Circles →
                        </motion.button>
                    </motion.div>
                    
                    {loading ? (
                        <motion.div 
                            className="loading-skeleton-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {[...Array(4)].map((_, index) => (
                                <motion.div 
                                    key={index} 
                                    className="skeleton-card"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                />
                            ))}
                        </motion.div>
                    ) : popularCircles.length > 0 ? (
                        <motion.div 
                            className="circles-grid"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {popularCircles.map((circle, index) => (
                                <motion.div
                                    key={circle._id}
                                    className="circle-card card"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ 
                                        y: -5,
                                        boxShadow: "var(--bh-shadow-md)",
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <div className="circle-header">
                                        <h3 className="circle-title">{circle.name}</h3>
                                        <span className="circle-members">
                                            👥 {circle.memberCount || 0} members
                                        </span>
                                    </div>
                                    <p className="circle-description">{circle.description}</p>
                                    <div className="circle-tags">
                                        {circle.tags && circle.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="badge badge-secondary">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <motion.button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => navigate(`/circles/${circle._id}`)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Join Circle
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="empty-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="empty-icon">👥</div>
                            <h3>No study circles created yet</h3>
                            <p>Start your own study group and invite others!</p>
                            <motion.button 
                                className="btn btn-primary"
                                onClick={() => navigate('/circles')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Study Circle
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section 
                className="cta-section section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container">
                    <motion.div 
                        className="cta-card card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <div className="cta-content">
                            <motion.h2 
                                className="cta-title"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Ready to Transform Your Learning?
                            </motion.h2>
                            <motion.p 
                                className="cta-description"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Join thousands of students sharing resources, collaborating in study groups, 
                                and accelerating their learning journey with BookHive.
                            </motion.p>
                            <motion.div 
                                className="cta-buttons"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/signup')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Join BookHive Free
                                </motion.button>
                                <motion.button 
                                    className="btn btn-outline btn-lg"
                                    onClick={() => navigate('/resources')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Explore Resources
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
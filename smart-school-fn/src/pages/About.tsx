import { Users, Target, Eye, Heart, BookOpen, Award, Globe, Lightbulb } from 'lucide-react';
export const About = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      position: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "15+ years in educational technology with a passion for democratizing learning.",
      linkedin: "#"
    },
    {
      name: "Michael Chen",
      position: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Former Google engineer specializing in scalable learning platforms and AI.",
      linkedin: "#"
    },
    {
      name: "Dr. Emily Rodriguez",
      position: "Head of Learning Design",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "PhD in Educational Psychology with expertise in online curriculum development.",
      linkedin: "#"
    },
    {
      name: "David Kim",
      position: "Lead UX Designer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Award-winning designer focused on creating intuitive learning experiences.",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Accessibility",
      description: "We believe quality education should be available to everyone, regardless of their background or circumstances."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We continuously explore new technologies and methodologies to enhance the learning experience."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Learning thrives in supportive communities where students and educators collaborate and grow together."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We maintain the highest standards in content quality, platform reliability, and student support."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Empowering Minds Through
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Online Learning
            </span>
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Welcome to EduTech, where we're revolutionizing education by making high-quality learning accessible,
            engaging, and transformative for learners worldwide.
          </p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to the Future of Learning</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            At EduTech, we understand that learning doesn't stop at the classroom door. In today's rapidly evolving world,
            continuous learning is essential for personal and professional growth. Our platform bridges the gap between
            traditional education and modern learning needs, offering flexible, interactive, and personalized educational
            experiences that fit seamlessly into your life.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Whether you're a student looking to supplement your studies, a professional seeking to upskill, or someone
            pursuing a new passion, we're here to support your learning journey every step of the way.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Target className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To democratize access to quality education by creating an innovative online learning platform that
                connects learners with expert instructors worldwide. We strive to break down barriers to education
                and empower individuals to achieve their full potential through flexible, engaging, and effective
                learning experiences.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Eye className="w-12 h-12 text-purple-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the world's leading online learning platform, where millions of learners can access
                transformative education that adapts to their unique needs and goals. We envision a future where
                geographical boundaries don't limit learning opportunities, and where every person has the tools
                they need to succeed in an ever-changing world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors duration-300">
                  <div className="text-blue-600 mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">The passionate individuals behind EduTech</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                  />
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                  <a
                    href={member.linkedin}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Connect
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <Globe className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Countries Served</div>
            </div>
            <div>
              <Users className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-2">100K+</div>
              <div className="text-blue-100">Active Learners</div>
            </div>
            <div>
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-2">5K+</div>
              <div className="text-blue-100">Courses Available</div>
            </div>
            <div>
              <Award className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start Learning?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of learners who are already transforming their lives through our platform.
          </p>
          <div className="space-x-4">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Browse Courses
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
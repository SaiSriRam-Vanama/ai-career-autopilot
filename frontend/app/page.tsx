'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Target, TrendingUp, MessageSquare, BookOpen, Zap } from 'lucide-react';

import { useEffect } from 'react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Career Autopilot
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 text-center z-10">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Career Navigator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Get personalized career roadmaps, skill gap analysis, and intelligent course recommendations
              powered by cutting-edge AI models.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="group px-8 py-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-lg glass hover:bg-white/20 transition-all text-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Succeed</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl glass hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Personalized Roadmaps</h3>
              <p className="text-muted-foreground">
                AI-generated 12-week learning plans tailored to your target role and current skills.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl glass hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Skill Gap Analysis</h3>
              <p className="text-muted-foreground">
                Identify exactly what skills you need to land your dream job with real-time market data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl glass hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Course Recommendations</h3>
              <p className="text-muted-foreground">
                Get curated course suggestions from top platforms to fill your skill gaps efficiently.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl glass hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Career Advisor</h3>
              <p className="text-muted-foreground">
                Chat with an intelligent AI assistant for personalized career guidance 24/7.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl glass hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Resume Analysis</h3>
              <p className="text-muted-foreground">
                Automatic skill extraction from your resume using advanced NLP models.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl glass hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Weekly Auto-Updates</h3>
              <p className="text-muted-foreground">
                Your roadmap automatically updates based on the latest job market trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of professionals who are accelerating their career growth with AI.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-primary hover:bg-gray-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 AI Career Autopilot. Built with ❤️ for career growth.</p>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const posts = [
  { date: 'Mar 1, 2026', title: '5 Ways Face Recognition Is Transforming Church Attendance in Nigeria', excerpt: 'From Sunday services to midweek meetings, discover how churches are using AI to track, engage, and grow their congregations.', tag: 'Industry' },
  { date: 'Feb 20, 2026', title: 'Buddy Punching: The Hidden Cost Killing Your Business', excerpt: 'Time theft costs businesses billions annually. Learn how facial recognition eliminates buddy punching for good.', tag: 'Insights' },
  { date: 'Feb 10, 2026', title: 'Building AI Models That Work for African Faces', excerpt: 'Why diversity in training data matters, and how Mispar is pioneering inclusive facial recognition technology.', tag: 'Technology' },
  { date: 'Jan 28, 2026', title: 'NDPR and Facial Recognition: What Your Organization Needs to Know', excerpt: 'A practical guide to deploying face recognition systems that comply with Nigeria\'s Data Protection Regulation.', tag: 'Compliance' },
  { date: 'Jan 15, 2026', title: 'The Future of Contactless Access Control in African Offices', excerpt: 'Post-COVID, organizations are rethinking access. Here\'s why facial recognition is the answer.', tag: 'Trends' },
];

const Blog = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar onRequestDemo={() => navigate('/#demo')} />
      <main>
        <section className="section-dark pt-32 pb-20">
          <div className="container-custom text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">Blog</span>
            <h1 className="text-white mb-6">Insights & <span className="text-cyan">Updates</span></h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Explore articles on facial recognition, AI ethics, workforce management, and the future of identity technology.</p>
          </div>
        </section>
        <section className="section-darker py-20">
          <div className="container-custom max-w-4xl">
            <div className="space-y-6">
              {posts.map((p, i) => (
                <article key={i} className="glass-card p-6 hover:border-cyan/30 transition-colors card-lift cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-white/30 text-sm">{p.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan/10 text-cyan text-xs">{p.tag}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                  <p className="text-white/50 text-sm mb-3">{p.excerpt}</p>
                  <span className="text-cyan text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">Read more <ArrowRight size={14} /></span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Blog;

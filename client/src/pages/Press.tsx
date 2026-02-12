import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';
import { Button } from '@/components/ui/button';

const pressReleases = [
  {
    id: 1,
    title: 'LUXE Announces Sustainable Fashion Initiative for 2025',
    source: 'Fashion Weekly',
    date: 'January 15, 2025',
    excerpt: 'Leading e-commerce platform LUXE unveils comprehensive sustainability program aimed at reducing environmental impact across its supply chain.',
    link: '#',
    featured: true,
  },
  {
    id: 2,
    title: 'LUXE Named Top E-Commerce Platform by Industry Awards',
    source: 'Retail Insider',
    date: 'January 10, 2025',
    excerpt: 'LUXE receives recognition for exceptional user experience and innovative shopping features at the annual Retail Excellence Awards.',
    link: '#',
    featured: true,
  },
  {
    id: 3,
    title: 'Partnership Announcement: LUXE x Designer Collections',
    source: 'Style Magazine',
    date: 'December 20, 2023',
    excerpt: 'Exclusive collaboration brings limited-edition designer pieces to LUXE customers worldwide.',
    link: '#',
    featured: false,
  },
  {
    id: 4,
    title: 'LUXE Expands International Shipping to 50 New Countries',
    source: 'E-Commerce Today',
    date: 'December 5, 2023',
    excerpt: 'Global expansion continues as LUXE now offers shipping to over 150 countries with localized payment options.',
    link: '#',
    featured: false,
  },
  {
    id: 5,
    title: 'LUXE Mobile App Reaches 10 Million Downloads',
    source: 'Tech News Daily',
    date: 'November 28, 2023',
    excerpt: 'Mobile shopping milestone achieved as LUXE app becomes one of the most downloaded retail applications.',
    link: '#',
    featured: false,
  },
];

const mediaMentions = [
  { name: 'Vogue', logo: '✦' },
  { name: 'Forbes', logo: '◆' },
  { name: 'TechCrunch', logo: '▲' },
  { name: 'Elle', logo: '★' },
  { name: 'Bloomberg', logo: '●' },
  { name: 'WWD', logo: '◇' },
];

const Press = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen py-12 lg:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">Press & Media</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Latest news, press releases, and media coverage about LUXE.
            </p>
          </div>

          {/* Media Mentions */}
          <motion.div
            variants={fadeUp}
            className="mb-16 p-8 bg-card rounded-3xl border border-border"
          >
            <h2 className="text-center text-muted-foreground mb-6">As Featured In</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {mediaMentions.map((media) => (
                <motion.div
                  key={media.name}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 text-2xl font-display font-bold text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <span>{media.logo}</span>
                  <span>{media.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured Articles */}
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold mb-8">Featured Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pressReleases.filter(p => p.featured).map((article) => (
                <motion.article
                  key={article.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      Featured
                    </span>
                    <span className="text-sm text-muted-foreground">{article.source}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {article.date}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Read More <ExternalLink size={14} />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* All Press Releases */}
          <motion.section variants={fadeUp}>
            <h2 className="font-display text-2xl font-bold mb-8">Latest News</h2>
            <div className="space-y-4">
              {pressReleases.filter(p => !p.featured).map((article) => (
                <motion.article
                  key={article.id}
                  whileHover={{ x: 4 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all flex items-center gap-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Newspaper size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 line-clamp-1">{article.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 flex-shrink-0">
                    Read <ExternalLink size={14} />
                  </Button>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Press Contact */}
          <motion.div
            variants={fadeUp}
            className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 text-center"
          >
            <h2 className="font-display text-2xl font-bold mb-4">Media Inquiries</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              For press inquiries, interview requests, or media kit access, please contact our communications team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="mailto:press@luxe.store">Contact Press Team</a>
              </Button>
              <Button variant="outline">Download Media Kit</Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Press;

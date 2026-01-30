import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Sparkles, Heart } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';

const openPositions = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote / New York',
    type: 'Full-time',
    description: 'Build and maintain our customer-facing web applications using React and TypeScript.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'New York',
    type: 'Full-time',
    description: 'Create intuitive and beautiful user experiences across our digital platforms.',
  },
  {
    id: 3,
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Lead our brand marketing initiatives and drive customer acquisition strategies.',
  },
  {
    id: 4,
    title: 'Fashion Stylist',
    department: 'Creative',
    location: 'Los Angeles',
    type: 'Full-time',
    description: 'Style photoshoots and create compelling visual content for our collections.',
  },
  {
    id: 5,
    title: 'Customer Experience Specialist',
    department: 'Support',
    location: 'Remote',
    type: 'Part-time',
    description: 'Provide exceptional support and create memorable experiences for our customers.',
  },
  {
    id: 6,
    title: 'Supply Chain Analyst',
    department: 'Operations',
    location: 'New York',
    type: 'Full-time',
    description: 'Optimize our supply chain operations for efficiency and sustainability.',
  },
];

const benefits = [
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision coverage' },
  { icon: Users, title: 'Flexible Work', description: 'Remote-first culture with flexible hours' },
  { icon: Sparkles, title: 'Learning Budget', description: '$2,000 annual professional development stipend' },
  { icon: Briefcase, title: 'Parental Leave', description: '16 weeks paid leave for all new parents' },
];

const Careers = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Briefcase size={16} />
              Join Our Team
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
            >
              Build the Future of
              <span className="block gradient-text">Fashion with Us</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg lg:text-xl text-muted-foreground"
            >
              We're always looking for passionate people who share our vision for
              sustainable, innovative fashion. Explore our open positions below.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-secondary/30 dark:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeUp}
                className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-4xl font-bold mb-4"
            >
              Open Positions
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Find your next opportunity and help us shape the future of fashion.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-4"
          >
            {openPositions.map((job) => (
              <motion.div
                key={job.id}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Apply Now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* No Match CTA */}
      <section className="py-20 lg:py-28 bg-secondary/30 dark:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-2xl lg:text-3xl font-bold mb-4"
            >
              Don't see a perfect match?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground mb-8"
            >
              We're always interested in meeting talented people. Send us your resume
              and we'll reach out when a fitting opportunity arises.
            </motion.p>
            <motion.a
              variants={fadeUp}
              href="mailto:careers@Luxe.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Send Your Resume
            </motion.a>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Careers;

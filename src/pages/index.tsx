import { Button } from "@/components/ui/button"
import { LoadingBeam } from "@/components/loading-beam"
import { ArrowRight, Shield, CreditCard, Building2, PiggyBank, LineChart, Users, HelpCircle, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/router'
import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, Globe, DollarSign, Bitcoin, Banknote } from 'lucide-react';
import React from 'react';

// Hero slides data
const heroSlides = [
  {
    title: "Modern Banking for the Digital Age",
    description: "Experience seamless banking with our cutting-edge platform. Manage your finances, cards, and transactions all in one place.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070",
    cta: "Get Started"
  },
  {
    title: "Smart Investments for Your Future",
    description: "Grow your wealth with our expert investment solutions. From stocks to mutual funds, we've got you covered.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070",
    cta: "Start Investing"
  },
  {
    title: "Flexible Loans for Every Need",
    description: "Whether it's a home, car, or personal loan, we offer competitive rates and flexible terms to suit your needs.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071",
    cta: "Explore Loans"
  }
]

// FAQ data
const faqs = [
  {
    question: "How secure is my money with Green Valley Bank?",
    answer: "We use state-of-the-art encryption and security measures to protect your funds. Our platform is regularly audited and complies with international banking standards."
  },
  {
    question: "What types of accounts do you offer?",
    answer: "We offer a range of accounts including savings, checking, investment, and business accounts, each designed to meet different financial needs."
  },
  {
    question: "How can I apply for a loan?",
    answer: "You can apply for a loan through our online platform. Simply log in, select the loan type, fill out the application, and our team will review it within 24 hours."
  },
  {
    question: "What investment options are available?",
    answer: "We offer various investment options including stocks, mutual funds, bonds, and retirement accounts. Our investment advisors can help you choose the right options."
  }
]

// Testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "Green Valley Bank has transformed how I manage my business finances. The mobile app is intuitive and the customer service is exceptional.",
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    name: "Michael Chen",
    role: "Tech Professional",
    content: "The investment platform is fantastic. I've seen significant growth in my portfolio since switching to Green Valley Bank.",
    image: "https://i.pravatar.cc/150?img=2"
  },
  {
    name: "Emma Rodriguez",
    role: "Homeowner",
    content: "Getting my mortgage through Green Valley Bank was smooth and stress-free. Their rates were competitive and the process was transparent.",
    image: "https://i.pravatar.cc/150?img=3"
  }
]

// Community images data
const communityImages = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/13.jpg",
  "https://randomuser.me/api/portraits/women/14.jpg",
  "https://randomuser.me/api/portraits/men/15.jpg",
  "https://randomuser.me/api/portraits/women/16.jpg",
  "https://randomuser.me/api/portraits/men/17.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme();
  const [openSector, setOpenSector] = useState<number | null>(null);

  const investmentSectors = [
    {
      name: 'Savings Accounts',
      icon: PiggyBank,
      short: 'Safe, flexible accounts for your everyday money.',
      detail: 'Savings accounts are a secure way to store your money, earn interest, and access funds anytime. Perfect for emergency funds and short-term goals.'
    },
    {
      name: 'Fixed Deposits / CDs',
      icon: Banknote,
      short: 'Lock in your money for higher interest.',
      detail: 'Fixed deposits (Certificates of Deposit) offer higher interest rates when you commit your money for a set period. Great for stable, predictable growth.'
    },
    {
      name: 'Stocks & Mutual Funds',
      icon: LineChart,
      short: 'Invest in companies or diversified funds.',
      detail: 'Stocks and mutual funds let you invest in businesses for long-term growth. Mutual funds pool your money with others for diversification.'
    },
    {
      name: 'Bonds',
      icon: DollarSign,
      short: 'Lend money for regular interest payments.',
      detail: 'Bonds are loans to governments or companies. They pay you interest and are generally less risky than stocks.'
    },
    {
      name: 'Real Estate',
      icon: Building2,
      short: 'Invest in property or real estate funds.',
      detail: 'Real estate investments can provide rental income and potential appreciation. You can invest directly or through real estate funds.'
    },
    {
      name: 'Cryptocurrency',
      icon: Bitcoin,
      short: 'Digital assets like Bitcoin and Ethereum.',
      detail: 'Cryptocurrencies are digital, decentralized assets. They are high risk and high reward, and can diversify your portfolio.'
    },
    {
      name: 'Commodities',
      icon: Globe,
      short: 'Gold, oil, and agricultural products.',
      detail: 'Commodities help diversify your investments and can hedge against inflation. Examples include gold, oil, and wheat.'
    },
    {
      name: 'Retirement Accounts',
      icon: Shield,
      short: 'Save for the future with tax advantages.',
      detail: 'Retirement accounts like IRAs or pensions help you save for the long term, often with tax benefits.'
    },
    {
      name: 'Business & Startup Investments',
      icon: Briefcase,
      short: 'Support new businesses and innovation.',
      detail: 'Investing in startups or private businesses can offer high returns and help drive innovation, but comes with higher risk.'
    },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <LoadingBeam />
      <div className="min-h-screen bg-background">
        {/* Minimal Landing Page Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-green-300 flex items-center justify-center text-white font-bold text-xl shadow-lg">GV</div>
            <span className="text-2xl font-bold hidden sm:inline-block">Green Valley Bank</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link href="/auth/login">
              <Button variant="ghost" className="border border-black dark:border-white rounded-md">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-neutral-900 text-white border border-black rounded-md hover:bg-neutral-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-100">
                Sign Up
              </Button>
            </Link>
          </div>
        </header>
        {/* Hero Section with Slider */}
        <section className="relative h-[600px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
              >
                <div className="absolute inset-0 bg-black/50" />
              </div>
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl text-white">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                      {heroSlides[currentSlide].title}
                    </h1>
                    <p className="text-xl mb-8">
                      {heroSlides[currentSlide].description}
                    </p>
                    <Link href="/register">
                      <Button size="lg" className="bg-white text-black hover:bg-white/90">
                        {heroSlides[currentSlide].cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>


        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className="relative">
                  <Shield className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Secure Banking</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  State-of-the-art security measures to protect your financial data and transactions.
                </p>
              </div>
              <div className="group p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className="relative">
                  <CreditCard className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Smart Cards</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  Manage your cards with ease. Freeze, unfreeze, and monitor transactions in real-time.
                </p>
              </div>
              <div className="group p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className="relative">
                  <Building2 className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Business Banking</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  Comprehensive solutions for businesses of all sizes, from startups to enterprises.
                </p>
              </div>
              <div className="group p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className="relative">
                  <PiggyBank className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Savings & Loans</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  Competitive interest rates on savings and flexible loan options for every need.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Smart Investment Solutions</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Grow your wealth with our expert investment solutions. We offer a range of investment options tailored to your goals and risk tolerance.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <LineChart className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Stock Trading</h3>
                      <p className="text-muted-foreground">Access global markets with our advanced trading platform.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Mutual Funds</h3>
                      <p className="text-muted-foreground">Diversify your portfolio with professionally managed funds.</p>
                    </div>
                  </div>
                </div>
                <Link href="/register" className="inline-block mt-8">
                  <Button size="lg">
                    Start Investing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070"
                  alt="Investment"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Photo Collage Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Our Community</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {communityImages.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Happy customer"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Green Valley Bank?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group p-6 rounded-2xl bg-background border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <Shield className="h-12 w-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">World-Class Security</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">Your money and data are protected by the latest encryption and security protocols.</p>
              </div>
              <div className="group p-6 rounded-2xl bg-background border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <LineChart className="h-12 w-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Smart Investments</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">Grow your wealth with expert advice and a range of investment options.</p>
              </div>
              <div className="group p-6 rounded-2xl bg-background border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <Users className="h-12 w-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Personalized Support</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">Our team is here for you 24/7, ready to help with any question or need.</p>
              </div>
              <div className="group p-6 rounded-2xl bg-background border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <CreditCard className="h-12 w-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">All-in-One Banking</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">Manage accounts, cards, loans, and investments—all in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Press/Partners Logos Section */}
        {/* Removed: As seen in logos that caused 404 errors */}

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="group bg-background rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-4 border-primary shadow" />
                  <div className="text-4xl text-primary mb-2">“</div>
                  <p className="text-lg font-medium mb-4">{t.content}</p>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ways to Grow Your Money Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">How We Grow Your Money </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {investmentSectors.map((sector, i) => (
                <button
                  key={sector.name}
                  onClick={() => setOpenSector(i)}
                  className="group p-6 rounded-xl bg-background border border-border shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 cursor-pointer flex flex-col items-center gap-4 focus:outline-none"
                >
                  <sector.icon className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <div className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">{sector.name}</div>
                  <div className="text-muted-foreground text-sm text-center group-hover:text-foreground/80 transition-colors duration-300">{sector.short}</div>
                </button>
              ))}
            </div>
            {/* Modal for sector details */}
            <Dialog open={openSector !== null} onOpenChange={v => !v && setOpenSector(null)}>
              <DialogContent className="max-w-md w-full bg-white dark:bg-black text-gray-900 dark:text-white">
                {openSector !== null && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {React.createElement(investmentSectors[openSector!].icon, { className: 'h-7 w-7 text-green-600' })}
                        {investmentSectors[openSector!].name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 text-base">{investmentSectors[openSector].detail}</div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Big Call to Action Section (moved before footer) */}
        <section className="py-16 bg-gradient-to-br from-[#232526] via-[#414345] to-[#bfc1c2] text-white text-center rounded-2xl shadow-xl mt-16 mb-8">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8">Join thousands of happy customers and experience the future of banking today.</p>
            <Link href="/register">
              <Button size="lg" className="bg-black text-white hover:bg-gray-900 text-xl px-8 py-4 rounded-full shadow-lg">Get Started</Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">Green Valley Bank</h3>
                <p className="text-muted-foreground">
                  Modern banking solutions for the digital age. Secure, fast, and reliable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                  <li><Link href="/services" className="text-muted-foreground hover:text-foreground">Services</Link></li>
                  <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                  <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                  <li><Link href="/security" className="text-muted-foreground hover:text-foreground">Security</Link></li>
                  <li><Link href="/compliance" className="text-muted-foreground hover:text-foreground">Compliance</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
              © 2024 Green Valley Bank. All rights reserved.
            </div>
          </div>
        </footer>

        
      </div>
    </>
  )
} 
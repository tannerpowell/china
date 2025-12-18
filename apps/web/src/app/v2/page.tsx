"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Phone, Clock } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTagline}>Authentic Asian Cuisine</span>
          <h1 className={styles.heroTitle}>
            Fresh Flavors,<br />
            <span className={styles.heroTitleAccent}>Crafted Daily</span>
          </h1>
          <p className={styles.heroDescription}>
            Experience the art of Asian cooking with dishes made from scratch using the finest ingredients.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/menu" className={styles.primaryButton}>
              View Menu
              <ArrowRight size={18} />
            </Link>
            <Link href="/menu" className={styles.secondaryButton}>
              Order Online
            </Link>
          </div>
        </div>

        {/* Decorative Element */}
        <div className={styles.heroDecor}>
          <div className={styles.decorCircle} />
          <div className={styles.decorLine} />
        </div>
      </section>

      {/* Info Cards */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <MapPin size={24} strokeWidth={1.5} />
            </div>
            <h3 className={styles.infoTitle}>Location</h3>
            <p className={styles.infoText}>
              Visit us for dine-in or<br />
              convenient takeout
            </p>
            <Link href="/location" className={styles.infoLink}>
              Get Directions
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Clock size={24} strokeWidth={1.5} />
            </div>
            <h3 className={styles.infoTitle}>Hours</h3>
            <p className={styles.infoText}>
              Mon–Sat: 11am–9pm<br />
              Sunday: 12pm–8pm
            </p>
            <span className={styles.infoStatus}>
              <span className={styles.statusDot} />
              Open Now
            </span>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Phone size={24} strokeWidth={1.5} />
            </div>
            <h3 className={styles.infoTitle}>Contact</h3>
            <p className={styles.infoText}>
              Questions? Call us or<br />
              order by phone
            </p>
            <a href="tel:+1234567890" className={styles.infoLink}>
              Call to Order
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className={styles.featuredSection}>
        <div className={styles.featuredHeader}>
          <h2 className={styles.featuredTitle}>Our Specialties</h2>
          <p className={styles.featuredSubtitle}>
            Handcrafted dishes that keep our guests coming back
          </p>
        </div>

        <div className={styles.featuredGrid}>
          <div className={styles.featuredItem}>
            <div className={styles.featuredImageWrapper}>
              <img
                src="/gallery/_category--chicken__group_16x9.jpg"
                alt="General Tso's Chicken"
                className={styles.featuredImage}
              />
            </div>
            <h3 className={styles.featuredName}>Signature Chicken</h3>
            <p className={styles.featuredDesc}>Crispy, sweet, and perfectly spiced</p>
          </div>

          <div className={styles.featuredItem}>
            <div className={styles.featuredImageWrapper}>
              <img
                src="/gallery/_category--noodles__group_16x9.jpg"
                alt="Hand-tossed Noodles"
                className={styles.featuredImage}
              />
            </div>
            <h3 className={styles.featuredName}>Fresh Noodles</h3>
            <p className={styles.featuredDesc}>Wok-tossed to perfection</p>
          </div>

          <div className={styles.featuredItem}>
            <div className={styles.featuredImageWrapper}>
              <img
                src="/gallery/_category--beef__group_16x9.jpg"
                alt="Premium Beef"
                className={styles.featuredImage}
              />
            </div>
            <h3 className={styles.featuredName}>Premium Beef</h3>
            <p className={styles.featuredDesc}>Tender and full of flavor</p>
          </div>
        </div>

        <div className={styles.featuredCta}>
          <Link href="/menu" className={styles.primaryButton}>
            Explore Full Menu
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>China Island</span>
            <span className={styles.footerTagline}>Asian Grill</span>
          </div>
          <p className={styles.footerCopy}>
            Fresh Asian cuisine, made with care.
          </p>
        </div>
      </footer>
    </div>
  );
}

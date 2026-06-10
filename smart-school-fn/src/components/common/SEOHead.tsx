import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
}

const BASE_URL = 'https://jobexam.rw';

export const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://jobexam.rw/og-image.jpg',
  ogType = 'website',
  keywords,
}: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = `${title} | JobExam Rwanda`;
    const fullUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', keywords || 'Exam preparation Rwanda, JobExam Rwanda, CPA Rwanda, Government exams Rwanda, Career development Rwanda, Professional certification Rwanda, Online exams Rwanda');

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', fullUrl);

    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);

    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    return () => {
      document.title = 'JobExam Rwanda - Rwanda\'s Leading Exam Preparation & Career Development Platform';
    };
  }, [title, description, canonicalUrl, ogImage, ogType, keywords]);

  return null;
};

import { Helmet } from "react-helmet";
import { useTranslation } from "@/hooks/use-translation";

interface SEOMetadataProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  schemaData?: Record<string, any>;
  article?: boolean;
}

export default function SEOMetadata({
  title,
  description,
  canonicalUrl,
  imageUrl,
  schemaData,
  article = false,
}: SEOMetadataProps) {
  const { t } = useTranslation();
  
  // Default site metadata
  const siteName = "CarValueAI";
  const siteUrl = "https://carvalueai.bg";
  const defaultTitle = t.seo.defaultTitle;
  const defaultDescription = t.seo.defaultDescription;
  const defaultImage = "/images/carvalueai-social.jpg";
  
  // Use provided values or defaults
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageUrl = canonicalUrl || siteUrl;
  const pageImage = imageUrl || `${siteUrl}${defaultImage}`;
  
  // Generate structured data schema
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/valuation?vin={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  
  // Merge any additional schema data
  const finalSchema = schemaData ? { ...baseSchema, ...schemaData } : baseSchema;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
      
      {/* Language Alternatives */}
      <link rel="alternate" href={`${siteUrl}/en`} hrefLang="en" />
      <link rel="alternate" href={`${siteUrl}/bg`} hrefLang="bg" />
      <link rel="alternate" href={siteUrl} hrefLang="x-default" />
    </Helmet>
  );
}
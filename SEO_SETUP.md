# SEO Setup Guide

## Environment Variables

To properly configure SEO metadata and social media sharing, you need to set the `NEXT_PUBLIC_SITE_URL` environment variable.

### Development

The system will automatically use `http://localhost:3000` as the fallback for development.

### Production

Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Replace `yourdomain.com` with your actual domain.

### What This Does

The `metadataBase` property in your root layout uses this environment variable to:

1. **Resolve relative image URLs** for social media sharing
2. **Generate proper canonical URLs** for SEO
3. **Create absolute URLs** for Open Graph and Twitter Card meta tags

### Example

With `NEXT_PUBLIC_SITE_URL=https://noahpaige.dev`:

- Relative image `/masters-thesis.png` becomes `https://noahpaige.dev/masters-thesis.png`
- Canonical URL becomes `https://noahpaige.dev/projects/masters-thesis`

### Testing Social Media Previews

After setting up the environment variable, test your social media previews using:

- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Current SEO Coverage

- **Total Articles**: 8
- **With SEO Metadata**: 3 (37.5%)
- **Articles with SEO**: masters-thesis, cyberpunk-2077, clair-obscur

### Adding SEO to New Articles

Add SEO metadata to your MDX frontmatter:

```yaml
---
title: "Your Article Title"
description: "Your article description"
seo:
  title: "Custom SEO Title for Social Media"
  description: "Custom SEO description for search engines"
  keywords: ["keyword1", "keyword2", "keyword3"]
  image: "/custom-social-image.png"
  canonical: "https://yourdomain.com/projects/your-article"
---
```

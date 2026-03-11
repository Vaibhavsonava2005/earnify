import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/'], // Don't index private areas
        },
        sitemap: 'https://earnify.site/sitemap.xml',
    };
}

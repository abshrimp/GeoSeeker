import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = 'GeoSeeker',
}) => {
    return (
        <Helmet>
            <title>{title}</title>
        </Helmet>
    );
};

export default SEO; 
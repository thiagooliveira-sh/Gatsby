/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Helmet} from "react-helmet"
import { useStaticQuery, graphql } from 'gatsby'

function SEO({ description, lang, meta, title, image, slug }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            siteUrl
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description
  const siteUrl = site.siteMetadata.siteUrl
  
  // Ensure absolute URL for images - handle both custom and default images
  let imagePath = image || "/assets/img/template.png"
  
  // Normalize path: remove ../static/ prefix if present (from gatsby-remark-relative-images)
  // and ensure path starts with /
  if (imagePath.includes('../static/')) {
    imagePath = imagePath.replace('../static', '')
  }
  if (!imagePath.startsWith('/')) {
    imagePath = '/' + imagePath
  }
  
  const ogImage = `${siteUrl}${imagePath}`
  
  // Build canonical URL if slug is provided
  const canonicalUrl = slug ? `${siteUrl}${slug}` : siteUrl

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: slug ? `article` : `website`,
        },
        {
          property: `og:url`,
          content: canonicalUrl,
        },
        {
          property: `og:image`,
          content: ogImage
        },
        {
          property: `og:image:secure_url`,
          content: ogImage
        },
        {
          property: `og:image:width`,
          content: `1200`,
        },
        {
          property: `og:image:height`,
          content: `630`,
        },
        {
          property: `og:image:alt`,
          content: title,
        },
        {
          name: `twitter:card`,
          content: `summary_large_image`,
        },
        {
          name: `twitter:image`,
          content: ogImage
        },  
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    />
  )
}

SEO.defaultProps = {
  lang: `pt-br`,
  meta: [],
  description: ``,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  slug: PropTypes.string,
}

export default SEO

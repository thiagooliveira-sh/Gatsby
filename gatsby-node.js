const path = require("path")
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type MarkdownRemarkFrontmatter {
      image: String
      title: String
      description: String
      date: Date @dateformat
      category: String
      background: String
      tags: [String]
    }
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
    }
  `)
}

// To add the slug field to each post
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  // Ensures we are processing only markdown files
  if (node.internal.type === "MarkdownRemark") {
    // Use `createFilePath` to turn markdown files in our `data/faqs` directory into `/faqs/slug`
    const slug = createFilePath({
      node,
      getNode,
      basePath: "pages",
    })

    // Creates new query'able field with name of 'slug'
    createNodeField({
      node,
      name: "slug",
      value: `/${slug.slice(12)}`,
    })
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  
  const result = await graphql(`
    {
      allMarkdownRemark(sort: {frontmatter: {date: DESC}}) {
        edges {
          node {
            fields {
              slug
            }
          }
          next {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
          previous {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  const posts = result.data.allMarkdownRemark.edges

  // Create blog post pages
  posts.forEach(({ node, next, previous }) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/blog-post.js`),
      context: {
        slug: node.fields.slug,
        previousPost: next,
        nextPost: previous,
      },
    })
  })

  // Create paginated blog list pages
  const postsPerPage = 8
  const numPages = Math.ceil(posts.length / postsPerPage)

  Array.from({ length: numPages }).forEach((_, index) => {
    createPage({
      path: index === 0 ? `/` : `/page/${index + 1}`,
      component: path.resolve(`./src/templates/blog-list.js`),
      context: {
        limit: postsPerPage,
        skip: index * postsPerPage,
        numPages,
        currentPage: index + 1,
      },
    })
  })
}

// Webpack optimization
exports.onCreateWebpackConfig = ({ stage, actions, getConfig, plugins }) => {
  if (stage === 'build-javascript' || stage === 'develop') {
    actions.setWebpackConfig({
      optimization: {
        minimize: stage === 'build-javascript',
        minimizer: stage === 'build-javascript' ? [
          plugins.minifyJs({
            terserOptions: {
              compress: {
                drop_console: true,
              },
              output: {
                comments: false,
              },
            },
          }),
          plugins.minifyCss(),
        ] : [],
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            },
            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 30,
            },
            // Styled components chunk
            styles: {
              test: /[\\/]node_modules[\\/](styled-components|@emotion)[\\/]/,
              name: 'styles',
              chunks: 'all',
              priority: 25,
            },
          }
        }
      },
      cache: {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        compression: 'gzip',
      },
      // Reduce bundle size
      resolve: {
        alias: {
          'react': 'react',
          'react-dom': 'react-dom',
        },
      },
    })
  }
  
  // Production optimizations
  if (stage === 'build-javascript') {
    actions.setWebpackConfig({
      devtool: false, // Disable source maps in production for faster builds
    })
  }
}

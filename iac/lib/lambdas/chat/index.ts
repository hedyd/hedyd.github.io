import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

export const sendPrompt = async (prompt: string) => {
  const userContent = `
    Here is the resume:
    Hedy Deng

    # Resume

    ## Senior Software Engineer, WW International
    - Core developer responsible for moving the legacy Drupal 7 website off Acquia Cloud onto WW’s internal AWS infrastructure.
    - Led the conversion of legacy React class components into functional components with TypeScript.
    - Set up CI/CD pipelines for linting, testing, and Docker deployments with Github Actions.
    - Improved performance across tiers by adding Memcached for the Drupal CMS, Redis for the GraphQL API layer, and Fastly compatible Cache-Control headers for the front-end React app.
    - Led a team of three engineers on development for an internal tool. Set up a Next.js application with Okta single sign-on, Ant Design components, and Vitest.

    ## Tech Lead, Meredith (Formerly Time Inc.) 
    - Maintained over ten sites serving millions of monthly users, such as InStyle, Allrecipes, Food & Wine, and Travel & Leisure.
    - Key developer for a custom Drupal API module used to provide data to an Express/Handlebars front-end.
    - Laid the groundwork for major features such as infinite scrolling articles, critical CSS, and automated testing.

    ## Freelance, Cynda Media Lab
    - Design Portfolio Center: Set up the foundation for creating custom Wordpress Gutenberg blocks for lit-html components, allowing content editors to add, preview, and edit components on pages.
    - MIT Remote Learning Hub: Set up user roles in Auth0 and built React components in Storybook.
    - GUND Campaign Website: Created a way for users to build and share custom avatars with HTML canvas.
    - Vincent Di Fate Portfolio: Built an Angular frontend, custom Shopify theme, and custom CMS with Angular Material.

    ## Senior Software Engineer, Lockheed Martin Desktop Solutions, Inc.
    - Themed and customized over 30 Drupal websites for members of the U.S. House and Senate.
    - Created custom Drupal modules to retrieve and store data from social media APIs and update that data on cron runs.
    - Built a drag and drop e-newsletter wizard in jQuery Mobile.
    - Performed 508 compliance testing using NVDA and added WAI-ARIA where needed to improve accessibility.

    # Projects

    ## Senate Intelligence Committee
    Lockheed Martin Desktop Solutions, Inc. | 2011

    Website for the Senate Intelligence Committee. The site serves as a repository for the committee's publications and bills. It also contains the committee's hearing schedule and a live stream of their public hearings.

    ### Skills
    Drupal 7, CSS, JavaScript, PHP, SQL, Jenkins, Git

    ### Responsibilities
    - Back-end developer. Set up a vanilla Drupal 7 site as the base.
    - Worked on several front-end features, including extending the Calendar module to display tooltips for events on hover.
    - Responsible for monitoring Drupal core security advisories and patching the site, usually within 24 hours.
    - Held training sessions for editors and responded directly to maintenance requests.

    ### Features
    - Calendar with dates for open and closed hearings
    - Paginated list of legislation using Panels/Views
    - Keyword and category search of content
    - Akamai caching

    ## #HowDoYouHug Campaign
    Cynda Media Lab | 2016

    A social media campaign for GUND. The campaign's core goal was to encourage social shares of their promotional website. Visitors could share custom avatars they built on the site, and GUND would donate toys to charities after milestones were reached.

    ### Skills
    HTML, HTML Canvas, SCSS, JavaScript, GreenSock, MongoDB, Git

    ### Responsibilities
    - Created an animated meter with HTML canvas that gets updated when a user shares their avatar or posts to social media.
    - Developed a custom avatar builder with HTML canvas that allows users to pick a plush silhouette and pan/zoom it on top of a background of their choosing. The canvas is then saved as an image, allowing users to share their new avatar.
    - Built a slideshow and masonry layout for user generated posts curated by site admins.

    ### Features
    - Create and share custom avatars with GUND products
    - Grid of social media posts by users

    ## Tera Cloud Memory Extension
    Cynda Media Lab | 2016

    Multilingual marketing website for HB Mobile's Tera, a custom Android phone with additional cloud storage capacity of 1TB.

    ### Skills
    HTML, SCSS, JavaScript, Node.js, Express, Gulp, Git

    ### Responsibilities
    - Set up front end and utilized Gulp for tasks such as SASS compilation, JS minification, Babel, and auto-prefixing.
    - Set up components with the ability to get flat data from multiple sources by path for multilingual support.

    ### Features
    - I18n support with toggle from Chinese to English

    ## InStyle.com
    Meredith | 2018

    Website for a celebrity fashion magazine. The site contains landing pages for beauty product shopping, celebrity outfit galleries, and general fashion news.

    ### Skills
    Handlebars, SCSS, JavaScript, Node.js, Express, Drupal 7, PHP, SQL, Nightmare, Mocha/Chai, Jenkins, CircleCI, Grunt, Git

    ### Responsibilities
    - Key developer for the Best Beauty Buys section of the website. Wrote a custom Drupal 7 module that generated the API used by the front end.
    - Built the Best Beauty Buys front-end template with a Handlebars/Node.js setup.
    - Worked on several performance and security improvement initiatives, including critical CSS, lazy loading, and an HTTPS migration.
    - Built a regression test suite. Testing included tasks such as typing text into a search field, checking results, and ensuring that pagination worked as expected.

    ### Features
    - Product listing page with filtering, pagination, featured products, and load more
    - Lazy loading blog articles on scroll
    - Critical CSS with Penthouse
    - Regression test suite with Nightmare and Mocha/Chai

    ## MIT and FIT Remote Learning Hub
    Cynda Media Lab | 2022

    An online learning platform used by teachers to create syllabuses and students to track coursework.

    ### Skills
    React, SCSS, TypeScript, Node.js, MongoDB, Storybook, Git

    ### Responsibilities
    - Set up user authentication. Users with a teacher role could edit and create lesson units, while users with a student role would have a read-only view of courses they were enrolled in.
    - Built front-end components for the user dashboard, course edit pages, and a subsection of the site with a dynamic workshop schedule.

    ### Features
    - Auth0 login with role-based access control
    - Custom CMS for content editing
    - Storybook integration for front-end prototyping

    ## Design Portfolio Center
    Cynda Media Lab | 2023

    Provides mentoring for aspiring designers or UI/UX professionals looking to improve their skills and web portfolio.

    ### Skills
    lit-html, Web Components, Wordpress, Webflow, Framer, SCSS, Storybook, Git

    ### Responsibilities
    - Mentor for designers enrolled in the program, providing tutoring on low-code portfolio options like Webflow and Framer.
    - Built several front-end components using lit-html and Web Components.
    - Set up the foundation for creating custom Wordpress Gutenberg blocks for lit-html components, allowing content editors to add, preview, and edit components on pages.

    ### Features
    - Headless Wordpress with lit-html front-end
    - Custom Gutenberg blocks for content editing
    - Calendly integration for scheduling meetings
    = Light and dark themes

    ## Vincent Di Fate
    Cynda Media Lab | 2023

    Portfolio website for Vincent Di Fate, an illustrator working in the specialties of science fiction, fantasy, and aerospace art.

    ### Skills
    Shopify, Angular 4, Angular Material, SCSS, TypeScript, Node.js, MongoDB, Git

    ### Responsibilities
    - Developed Angular components for gallery and grid views for all artwork.
    - Built the front-end for a custom CMS, allowing the client to upload new art pieces and edit their project and biography pages.
    - Created a custom shopify theme for the Shop part of the website.

    ### Features
    - Shop with custom shopify theme matching the main site
    - Custom CMS for content editing with Angular Material
    - Contact form for each piece of artwork

    ## WW Internal Tooling
    WW International | 2024

    Internal tooling for WW International. Handles users in the UK who sign up for WW through a free government program.

    ### Skills
    React, Next.js, SCSS, TypeScript, Express, Node.js, PostgreSQL, Docker, Kubernetes, Vitest, Github Actions, Git

    ### Responsibilities
    - Set up the Next.js (App Router) app with Typescript and the Ant Design component library.
    - Managed a team of three engineers. Acted as a point of contact and divided tasks.
    - Led weekly client demos of new key functionality.

    ### Features
    - CSV report generation for government audits
    - OKTA login and role-based access control using NextAuth
    - User data tables with filtering and pagination

    ## Portfolio Website
    Personal | 2025

    ### Skills
    Astro, AWS Bedrock, AWS Lambda, AWS API Gateway, AWS CDK, React, Git

    ### Responsibilities
    - Set up a chat bot that answers questions about my resume.
    - Deployed a Lambda function and API Gateway REST API via AWS CDK.
    - Created UI using Astro.

    ### Features
    - AI powered chat assistant
    - Astro content collections

    ## WeightWatchers.com
    WW International | 2025

    Website for the WeightWatchers (WW) App. Offers information about how to sign up for a WW subscription, as well as free recipes and articles on wellness.

    ### Skills
    React, Next.js, SCSS, JavaScript, TypeScript, Apollo GraphQL, Node.js, Hapi, Drupal 7/8/9/10, PHP, SQL, Storybook, Memcached, Redis, Fastly, Docker, Kubernetes, Jest, Playwright, Webpack, Github Actions, Git

    ### Responsibilities
    - Core developer responsible for the moving the old Drupal 7 website off Acquia Cloud onto WW's internal AWS infrastructure.
    - Led the conversion of legacy React class components into functional components with TypeScript.
    - Set up CI/CD pipelines for linting, testing, and Docker deployments with Github Actions.

    ### Features
    - React frontend with GQL API layer and Drupal backend
    - Drupal CMS for articles and custom pages
    - Blogs, recipes, and taxonomy driven category pages for SEO
    - Storybook integration with front-end components
    - A/B testing with Fastly Compute

    Here is the user's query:
    ${prompt}
  `;

  const systemContent = `
    You are a question answering agent. I will provide you with a resume. The user will provide you with a question. Your job is to answer the user's question using only information from the resume.
    
    - You should provide concise answers to simple questions when the answer is directly contained in the resume, but when comes to yes/no questions, provide some details.
    - If the resume does not contain information that can answer the question, state that Hedy's resume does not contain this information.
    - DO NOT USE INFORMATION THAT IS NOT IN THE RESUME!"
  `;

  const input: InvokeModelCommandInput = {
    body: JSON.stringify({
      system: [{ text: systemContent }],
      messages: [
        {
          role: "user",
          content: [{ text: userContent }],
        },
      ],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.7,
      },
    }),
    contentType: "application/json",
    modelId: "amazon.nova-micro-v1:0",
  };

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);

  return Buffer.from(response.body).toString();
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  let prompt: string;
  const MAX_LENGTH = 200;

  try {
    const body = JSON.parse(event.body || "{}");
    prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'prompt' in request body." }),
      };
    }

    if (prompt.length > MAX_LENGTH) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `'prompt' should be less than ${MAX_LENGTH} characters.`,
        }),
      };
    }
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body." }),
    };
  }

  try {
    const response = await sendPrompt(prompt);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://hedyd.github.io",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: response,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process prompt with the model.",
        details: message,
      }),
    };
  }
};

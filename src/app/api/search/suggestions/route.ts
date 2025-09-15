import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github';

// Popular repositories for suggestions (deduplicated)
const POPULAR_REPOS = [
  'facebook/react',
  'microsoft/vscode',
  'vercel/next.js',
  'nodejs/node',
  'python/cpython',
  'microsoft/TypeScript',
  'tensorflow/tensorflow',
  'pytorch/pytorch',
  'kubernetes/kubernetes',
  'docker/docker',
  'mongodb/mongo',
  'redis/redis',
  'elastic/elasticsearch',
  'apache/kafka',
  'apache/spark',
  'spring-projects/spring-boot',
  'rails/rails',
  'laravel/laravel',
  'django/django',
  'flask/flask',
  'expressjs/express',
  'fastify/fastify',
  'nestjs/nest',
  'nuxt/nuxt',
  'vuejs/vue',
  'angular/angular',
  'sveltejs/svelte',
  'preactjs/preact',
  'solidjs/solid',
  'remix-run/remix',
  'gatsbyjs/gatsby',
  'storybookjs/storybook',
  'jestjs/jest',
  'cypress-io/cypress',
  'playwright-community/playwright',
  'puppeteer/puppeteer',
  'seleniumhq/selenium',
  'appium/appium',
  'webdriverio/webdriverio',
  'testing-library/react-testing-library',
  'enzymejs/enzyme',
  'mochajs/mocha',
  'jasmine/jasmine',
  'karma-runner/karma',
  'webpack/webpack',
  'rollup/rollup',
  'vitejs/vite',
  'parcel-bundler/parcel',
  'esbuild/esbuild',
  'swc-project/swc',
  'babel/babel',
  'typescript-eslint/typescript-eslint',
  'prettier/prettier',
  'eslint/eslint',
  'stylelint/stylelint',
  'postcss/postcss',
  'tailwindcss/tailwindcss',
  'sass/sass',
  'less/less',
  'stylus/stylus',
  'styled-components/styled-components',
  'emotion-js/emotion',
  'mui/material-ui',
  'ant-design/ant-design',
  'chakra-ui/chakra-ui',
  'mantine/mantine',
  'react-bootstrap/react-bootstrap',
  'semantic-ui-org/semantic-ui',
  'foundation/foundation-sites',
  'bulma/bulma',
  'pure-css/pure',
  'bootstrap/bootstrap',
  'materializecss/materialize',
  'getbem/getbem',
  'necolas/normalize.css',
  'modernizr/modernizr',
  'jquery/jquery',
  'lodash/lodash',
  'moment/moment',
  'dayjs/dayjs',
  'date-fns/date-fns',
  'axios/axios',
  'request/request',
  'node-fetch/node-fetch',
  'undici/undici',
  'got/got',
  'ky/ky',
  'superagent/superagent',
  'cheeriojs/cheerio',
  'jsdom/jsdom'
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();

    if (!query || query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    // Filter popular repos that match the query
    const matchingRepos = POPULAR_REPOS.filter(repo => 
      repo.toLowerCase().includes(query) ||
      repo.split('/')[1].toLowerCase().includes(query) ||
      repo.split('/')[0].toLowerCase().includes(query)
    );

    // Remove duplicates and limit to 8 suggestions
    const uniqueRepos = Array.from(new Set(matchingRepos)).slice(0, 8);

    // If we have matching repos, return them
    if (uniqueRepos.length > 0) {
      return NextResponse.json({ 
        suggestions: uniqueRepos.map(repo => ({
          fullName: repo,
          name: repo.split('/')[1],
          owner: repo.split('/')[0],
          type: 'popular'
        }))
      });
    }

    // If no popular repos match, try GitHub search for more suggestions
    try {
      const searchResults = await githubService.searchRepositories(query, 1, 5);
      const suggestions = searchResults.items.map(repo => ({
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner.login,
        type: 'search',
        stars: repo.stargazers_count,
        description: repo.description
      }));

      return NextResponse.json({ suggestions });
    } catch (searchError) {
      // If GitHub search fails, return empty suggestions
      console.error('Error fetching search suggestions:', searchError);
      return NextResponse.json({ suggestions: [] });
    }

  } catch (error: any) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
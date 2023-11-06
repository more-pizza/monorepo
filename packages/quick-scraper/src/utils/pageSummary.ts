import { Page } from 'playwright';
import { HTML_TAGS } from '../constants';

interface PageSummary {
  url: string;
  text: string;
  links: string[];
}

export async function getPageSummary(page: Page): Promise<PageSummary> {
  const url = page.url();
  const text = await page.innerText('body');

  const results = await page.evaluate(
    function ({ htmlTags }) {
      // get the full text
      const text = document.body.innerText;

      // get count of all the tags
      const tagCount = {};
      for (const tag of htmlTags) {
        tagCount[tag] = document.getElementsByTagName(tag).length;
      }

      // get all the links on the page
      const links = Array.from(new Set([...Array.from(document.links).map((link) => link.href)]));

      return { text, tagCount, links };
    },
    { htmlTags: HTML_TAGS }
  );

  return { url, text: results.text, links: results.links };
}

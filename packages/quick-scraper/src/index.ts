import { JSDOMCrawler } from 'crawlee';

import { Dataset, PlaywrightCrawler, log, LogLevel } from 'crawlee';

export enum ScrapeAction {
  ExtractText = 'extractText',
}

export interface ScrapeMap {
  items: { action: ScrapeAction; name: string; selector: string }[];
}
const ACTION_MAP = {
  [ScrapeAction.ExtractText]: async function (locator) {
    const value = await locator.innerText();
    return value;
  },
};

export function convertScrapeMapToInstructions() {}

export async function scrapePage(url: string, scrapeMap: ScrapeMap) {
  log.setLevel(LogLevel.DEBUG);

  const crawler = new PlaywrightCrawler({
    launchContext: { launchOptions: { headless: false } },
    minConcurrency: 1,
    maxConcurrency: 1,
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 30,
    maxRequestsPerCrawl: 10,
    requestHandler: async function ({ request, page, log }) {
      log.debug(`Processing ${request.url}...`);

      const values: { [name: string]: string | null } = {};

      for (const item of scrapeMap.items) {
        const element = await page.$(item.selector);
        if (!element) {
          log.debug(`Selector ${item.selector} not found.`);
          values[item.name] = null;
          continue;
        }

        const actionHandler = ACTION_MAP[item.action];
        if (!actionHandler) {
          log.debug(`Action handler for ${item.action} not found.`);
          values[item.name] = null;
          continue;
        }

        const value = await actionHandler(element);
        values[item.name] = value;
      }

      await Dataset.pushData({ url: request.url, result: values });
    },
    failedRequestHandler: function ({ request }) {
      log.debug(`Request ${request.url} failed twice.`);
    },
  });

  // Run the crawler and wait for it to finish.
  await crawler.run([url]);

  log.debug('Crawler finished.');
}

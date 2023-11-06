const { scrapePage } = require('../dist/index');

scrapePage('https://adviserinfo.sec.gov/firm/summary/167700', {
  items: [
    {
      action: 'text',
      name: 'name',
      selector: 'investor-tools-big-name > div > span',
    },
  ],
});

---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Crawl Upwork Jobs"
conversation_id: 00c9324b-aa89-41c0-b4dc-74d079832b27
create_time: 12/10/2023 at 3:36 PM
update_time: 12/10/2023 at 6:16 PM
---

# Title: Crawl Upwork Jobs

Created: 12/10/2023 at 3:36 PM
Last Updated: 12/10/2023 at 6:16 PM
Chat URL: https://chat.openai.com/c/00c9324b-aa89-41c0-b4dc-74d079832b27


>[!nexus_user] **User** - 12/10/2023 at 3:36 PM
> Write a javascript function that will crawl upwork for jobs related to a query, which contain a certain title or set of keywords.
<!-- UID: aaa23bf0-88cf-4dbd-a3c4-56330582c575 -->




>[!nexus_agent] **Assistant** - 12/10/2023 at 3:37 PM
> Sure, I can help you get started with a JavaScript function for crawling Upwork. However, keep in mind that web scraping may violate Upwork's terms of service, and it's important to review and comply with their policies before proceeding. Also, note that web scraping is a complex task and may require continuous adjustments as the website's structure evolves.
> 
> Given those considerations, here's a simplified example using Node.js and the Puppeteer library for web scraping. Make sure to install Puppeteer using npm if you haven't already:
> 
> ```bash
> npm install puppeteer
> ```
> 
> Now, you can create a JavaScript function for crawling Upwork:
> 
> ```javascript
> const puppeteer = require('puppeteer');
> 
> async function crawlUpwork(query, titleOrKeywords) {
>  const browser = await puppeteer.launch();
>  const page = await browser.newPage();
> 
>  // Navigate to Upwork search results page
>  await page.goto(`https://www.upwork.com/search/jobs?q=${query}`);
> 
>  // Wait for the results to load (you might need to adjust the selector)
>  await page.waitForSelector('.job-tile');
> 
>  // Extract job details
>  const jobs = await page.evaluate(() => {
>  const jobTiles = document.querySelectorAll('.job-tile');
>  const jobDetails = [];
> 
>  jobTiles.forEach((tile) => {
>  const title = tile.querySelector('.job-title').innerText;
>  const description = tile.querySelector('.job-description').innerText;
> 
>  // Check if the job title or description contains the specified keywords
>  const containsKeywords =
>  titleOrKeywords.some((keyword) => title.includes(keyword)) ||
>  titleOrKeywords.some((keyword) => description.includes(keyword));
> 
>  if (containsKeywords) {
>  jobDetails.push({ title, description });
>  }
>  });
> 
>  return jobDetails;
>  });
> 
>  await browser.close();
> 
>  return jobs;
> }
> 
> // Example usage:
> const query = 'web development';
> const keywords = ['javascript', 'node.js', 'react'];
> crawlUpwork(query, keywords)
>  .then((jobs) => {
>  console.log('Matching jobs:', jobs);
>  })
>  .catch((error) => {
>  console.error('Error:', error);
>  });
> ```
> 
> This script uses Puppeteer to open Upwork, perform a search based on the provided query, and then extracts job details that contain the specified title or keywords. Keep in mind that website structures may change, so you may need to adapt the code accordingly. Also, be sure to review Upwork's terms of service to ensure compliance.
<!-- UID: b6085d71-1bbc-41c9-99ec-9fe017f7288f -->

---




>[!nexus_user] **User** - 12/10/2023 at 3:39 PM
> The logic should respect the robots.txt file.
<!-- UID: aaa2e011-2a3d-412d-81e1-f96e68da567b -->




>[!nexus_agent] **Assistant** - 12/10/2023 at 3:39 PM
> Absolutely, it's crucial to respect the `robots.txt` file to ensure ethical and legal web scraping practices. Puppeteer has built-in support for checking `robots.txt` rules before making requests. Here's an updated version of the previous script with robots.txt compliance:
> 
> ```javascript
> const puppeteer = require('puppeteer');
> 
> async function crawlUpwork(query, titleOrKeywords) {
>  const browser = await puppeteer.launch();
>  const page = await browser.newPage();
> 
>  // Check robots.txt rules before navigating
>  await page.goto('https://www.upwork.com/robots.txt');
>  const isAllowed = await page.evaluate(() => {
>  const content = document.body.textContent || document.body.innerText;
>  return !/User-agent: \*\s+Disallow: \//i.test(content);
>  });
> 
>  if (!isAllowed) {
>  console.error('Access to Upwork is not allowed based on robots.txt');
>  await browser.close();
>  return;
>  }
> 
>  // Navigate to Upwork search results page
>  await page.goto(`https://www.upwork.com/search/jobs?q=${query}`);
> 
>  // Wait for the results to load (you might need to adjust the selector)
>  await page.waitForSelector('.job-tile');
> 
>  // Extract job details
>  const jobs = await page.evaluate(() => {
>  const jobTiles = document.querySelectorAll('.job-tile');
>  const jobDetails = [];
> 
>  jobTiles.forEach((tile) => {
>  const title = tile.querySelector('.job-title').innerText;
>  const description = tile.querySelector('.job-description').innerText;
> 
>  // Check if the job title or description contains the specified keywords
>  const containsKeywords =
>  titleOrKeywords.some((keyword) => title.includes(keyword)) ||
>  titleOrKeywords.some((keyword) => description.includes(keyword));
> 
>  if (containsKeywords) {
>  jobDetails.push({ title, description });
>  }
>  });
> 
>  return jobDetails;
>  });
> 
>  await browser.close();
> 
>  return jobs;
> }
> 
> // Example usage:
> const query = 'web development';
> const keywords = ['javascript', 'node.js', 'react'];
> crawlUpwork(query, keywords)
>  .then((jobs) => {
>  console.log('Matching jobs:', jobs);
>  })
>  .catch((error) => {
>  console.error('Error:', error);
>  });
> ```
> 
> This script first checks Upwork's `robots.txt` file to ensure that web scraping is allowed. If the rules in the `robots.txt` file disallow crawling, the script logs an error and terminates. This helps ensure that you're following ethical and legal guidelines while scraping.
<!-- UID: 727600cd-6b9e-4dd0-9864-7e7f21318f68 -->

---




>[!nexus_user] **User** - 12/10/2023 at 3:49 PM
> I'd like to refactor this logic to scrape and indeed.
<!-- UID: aaa23ec4-679f-4c40-8326-e6e66f8cde6f -->




>[!nexus_agent] **Assistant** - 12/10/2023 at 3:49 PM
> While I can provide you with a general structure for web scraping LinkedIn and Indeed, it's crucial to note that web scraping these platforms may violate their terms of service. Both LinkedIn and Indeed have strict policies against automated scraping, and violating these policies could lead to account suspension or legal action. Always review and comply with the terms of service of the websites you are scraping.
> 
> That being said, if you have explicit permission from these platforms to scrape data, you can use Puppeteer or other scraping libraries. Here's a generalized example:
> 
> ```javascript
> const puppeteer = require('puppeteer');
> 
> async function scrapeJobs(site, query, titleOrKeywords) {
>  const browser = await puppeteer.launch();
>  const page = await browser.newPage();
> 
>  // Define the base URL and search query based on the site
>  let baseUrl, searchUrl;
>  if (site === '') {
>  baseUrl = 'https://www..com/jobs';
>  searchUrl = `${baseUrl}/search/?keywords=${query}`;
>  } else if (site === 'indeed') {
>  baseUrl = 'https://www.indeed.com';
>  searchUrl = `${baseUrl}/jobs?q=${query}`;
>  } else {
>  console.error('Unsupported site:', site);
>  await browser.close();
>  return;
>  }
> 
>  // Check robots.txt rules before navigating
>  await page.goto(`${baseUrl}/robots.txt`);
>  const isAllowed = await page.evaluate(() => {
>  const content = document.body.textContent || document.body.innerText;
>  return !/User-agent: \*\s+Disallow: \//i.test(content);
>  });
> 
>  if (!isAllowed) {
>  console.error(`Access to ${site} is not allowed based on robots.txt`);
>  await browser.close();
>  return;
>  }
> 
>  // Navigate to the search results page
>  await page.goto(searchUrl);
> 
>  // Wait for the results to load (you might need to adjust the selector)
>  await page.waitForSelector('.job-tile');
> 
>  // Extract job details
>  const jobs = await page.evaluate(() => {
>  const jobTiles = document.querySelectorAll('.job-tile');
>  const jobDetails = [];
> 
>  jobTiles.forEach((tile) => {
>  const title = tile.querySelector('.job-title').innerText;
>  const description = tile.querySelector('.job-description').innerText;
> 
>  // Check if the job title or description contains the specified keywords
>  const containsKeywords =
>  titleOrKeywords.some((keyword) => title.includes(keyword)) ||
>  titleOrKeywords.some((keyword) => description.includes(keyword));
> 
>  if (containsKeywords) {
>  jobDetails.push({ title, description });
>  }
>  });
> 
>  return jobDetails;
>  });
> 
>  await browser.close();
> 
>  return jobs;
> }
> 
> // Example usage for LinkedIn:
> const = 'software engineer';
> const = ['javascript', 'node.js', 'react'];
> scrapeJobs('', , )
>  .then((jobs) => {
>  console.log('LinkedIn Matching jobs:', jobs);
>  })
>  .catch((error) => {
>  console.error('Error:', error);
>  });
> 
> // Example usage for Indeed:
> const indeedQuery = 'software developer';
> const indeedKeywords = ['python', 'django', 'sql'];
> scrapeJobs('indeed', indeedQuery, indeedKeywords)
>  .then((jobs) => {
>  console.log('Indeed Matching jobs:', jobs);
>  })
>  .catch((error) => {
>  console.error('Error:', error);
>  });
> ```
> 
> This script is a modified version of the previous one, adapted for both LinkedIn and Indeed. Please ensure that you have permission to scrape data from these platforms and review their terms of service before proceeding.
<!-- UID: 2e2631ee-a97f-4ae3-91b4-9f0128659b75 -->

---




>[!nexus_user] **User** - 12/10/2023 at 6:14 PM
> Please review this language model prompt to create a job proposal harvester:
> 
> # High level task description
> 
> through ethical means curate job postings from as many job listing sites as possible.
> Start with , upwork, and indeed. Recomend other job sites.
> 
> Create a list of job sites with API's that enable collection of job postings.
> From this list, narrow it down to those that have npm packages,
> to reduce the amount of effort in imlpementing them.
> 
> # Initial setup
> 
> Check that docker is installed. Provide a link to the official docker install
> guide for each operating system.
> 
> # Collections
> 
> Mongodb allows for a lot of flexibility.
> Suggest other data which all the platforms have that could be added and would be useful.
> Using each services API documents.
> 
> ## Job listings
> ### Description
> A document containing data pertaining to a job listing from an arbitrary source.
> ### Schema
> 
> title: string
> source: string
> content: string
> 
> # Services
> 
> Respect the robots.txt and the ToS and Privacy policies of each of the job APIs.
> Search each services API documentation for their rate limiting
> policy and be sue to respect it in the implementation.
> Use node js and express for the backend.
> Generate a docker-compose.yml file that will stand up:
>  the entry file of which will be `./services/job-hunter/index.js`.
>  the entry file of which will be `./services/get-similar-words.js`.
>  A boiler plate mongodb instance.
>  A boiler plate weaviate instance.
> 
> Start with a list of seed keywords, collecting every page of jobs
> that match the query given to the respective websites 20 jobs at a time.
> 
> When the request promise resolves, try to:
>  save each of the jobs in the job listings collection
> 
> Catch the attempt to save the job. If the error thrown is a unique key violation
> then add the current keyword to the list of keywords stored on the job postings entry:
> if it was not already present on the job posting entry:
>  add the current keyword to the list of keywords associated with the job posting
>  Add the list of keywords to a seperate mongodb collection called "keywords"
>  Add the current keyword to a set containing all previously encountered keywords.
>  Using node rake extract a list of keywords from the posting.
>  for each keyword:
>  unless the keyword was already present in the set of all keywords encountered so far:
>  add the keyword encountered to the js set containing all keywords encountered so far.
>  add the keyword encountered to the mongodb collection of key words.
>  Add the job posting's mongodb primary key to the keyword collection entry's list of related document relationships.
>  otherwise: don't do anything and continue.
> When you encounter a result with less than 20 results,
> Add the current key words from the exhausted searches to a set of used keywords.
> Set the value of the variable holding the current keywords with the array returned from the `get_similar_words` call.
> Filter every value in the new keywords array that is in the set of exhausted key words.
> 
> If the array of keywords is empty:
>  output the following data to the terminal on seperate lines.
>  the number of jobs that were found for each key word in total
>  The number of jobs that were found from each source.
<!-- UID: aaa2f52f-db32-49ec-ae7b-03dcdcb01f49 -->




>[!nexus_agent] **Assistant** - 12/10/2023 at 6:14 PM
> **Job Proposal Harvester**
> 
> ## High-Level Task Description
> 
> The goal is to ethically curate job postings from various job listing sites, starting with LinkedIn, Upwork, and Indeed. Additionally, we'll explore other job sites with APIs, prioritizing those with npm packages to streamline implementation efforts.
> 
> ## Initial Setup
> 
> Ensure Docker is installed. Refer to the official Docker installation guides:
> - [Docker Install Guide for Windows](https://docs.docker.com/desktop/install/windows/)
> - [Docker Install Guide for macOS](https://docs.docker.com/desktop/install/mac/)
> - [Docker Install Guide for Linux](https://docs.docker.com/desktop/install/linux/)
> 
> ## Collections
> 
> Utilize MongoDB for flexibility. Suggested additional data for job listings includes:
> - Location
> - Company
> - Post date
> - Job type (full-time, part-time, contract, etc.)
> 
> ### Job Listings Document Schema
> 
> ```json
> {
>  "title": "string",
>  "source": "string",
>  "content": "string",
>  "location": "string",
>  "company": "string",
>  "postDate": "date",
>  "jobType": "string"
> }
> ```
> 
> ## Services
> 
> Respect robots.txt, ToS, and Privacy policies. Check and adhere to API rate limiting policies.
> 
> Use Node.js and Express for the backend. Create a `docker-compose.yml` file:
> 
> ```yaml
> version: '3'
> services:
>  job-hunter:
>  build: ./services/job-hunter
>  command: node index.js
>  get-similar-words:
>  build: ./services/get-similar-words
>  command: node index.js
>  mongodb:
>  image: mongo
>  ports:
>  - "27017:27017"
>  weaviate:
>  image: semitechnologies/weaviate
>  ports:
>  - "8080:8080"
> ```
> 
> ## Implementation
> 
> 1. Start with seed keywords, collect jobs 20 at a time from each site.
> 2. Save each job in the MongoDB job listings collection.
> 3. Handle unique key violation errors.
>  - Add the current keyword to the job postings entry if not already present.
>  - Add the current keyword to a separate MongoDB collection called "keywords."
>  - Add the current keyword to a set of encountered keywords.
>  - Extract keywords from the posting and update the keyword collection entry.
> 4. When encountering a result with fewer than 20 jobs, add exhausted keywords to a set.
> 5. Update the current keywords using similar words, filtering out exhausted keywords.
> 
> ## Output
> 
> If the array of keywords is empty:
> - Output the total number of jobs found for each keyword.
> - Output the number of jobs found from each source.
> 
> Remember to continuously review and adapt the system based on changes in API documentation and website structures. Always prioritize ethical and legal considerations when web scraping.
<!-- UID: 159ac5d1-cf5f-4d6f-953d-f44090815f78 -->

---




>[!nexus_user] **User** - 12/10/2023 at 6:15 PM
> Do you see any problems with this plan?
<!-- UID: aaa220c5-9a22-423e-b86c-07d0929aa628 -->




>[!nexus_agent] **Assistant** - 12/10/2023 at 6:15 PM
> While the plan outlines a comprehensive approach to harvesting job postings from various sources, there are some considerations and potential challenges to address:
> 
> 1. **Ethical and Legal Concerns:**
>  - Ensure compliance with the terms of service, privacy policies, and robots.txt files of each job API. Violating these terms can lead to legal consequences or access restrictions.
> 
> 2. **Rate Limiting:**
>  - Take into account the rate-limiting policies of each job API. Implement a mechanism to respect these limits to avoid being blocked or restricted.
> 
> 3. **Data Storage and Schema:**
>  - Consider expanding the data schema to include additional relevant information such as salary, skills required, and application deadline, depending on the available data from the job APIs.
> 
> 4. **Docker and Service Integration:**
>  - Verify that the Docker services (job-hunter, get-similar-words, MongoDB, Weaviate) integrate seamlessly. Ensure that the Docker containers are configured correctly for each service.
> 
> 5. **Seed Keywords and Exhaustive Searches:**
>  - Monitor the list of seed keywords and implement a strategy for refreshing or expanding the seed keyword list periodically. Additionally, handle exhausted searches efficiently, considering potential variations in keyword results.
> 
> 6. **Handling Errors:**
>  - Implement comprehensive error handling, logging, and recovery mechanisms. Consider scenarios where API requests fail or encounter unexpected responses.
> 
> 7. **Continuous Adaptation:**
>  - Job websites and APIs may undergo changes over time. Regularly review and update the scraping logic to adapt to any modifications in the structure or policies of the job platforms.
> 
> 8. **Documentation:**
>  - Maintain thorough documentation for the entire system, including API keys, configurations, and implementation details. This documentation will be crucial for ongoing maintenance and troubleshooting.
> 
> 9. **Testing:**
>  - Conduct extensive testing, including unit tests and end-to-end tests, to identify and rectify issues before deploying the system into production.
> 
> 10. **Monitoring and Logging:**
>  - Implement robust monitoring and logging mechanisms to track the system's performance, detect anomalies, and facilitate debugging.
> 
> Remember that web scraping is a dynamic and potentially complex task, and staying informed about changes in job platforms and APIs is essential for the long-term success of the harvesting system.
<!-- UID: 6f73a26e-b442-46fc-847d-40320d875625 -->

---




>[!nexus_user] **User** - 12/10/2023 at 6:16 PM
> Generate a description of rate limiting, and tell me where in the prompt to put it so it makes the most sense.
<!-- UID: aaa2a878-2736-431f-8dd4-53f2a1e1496f -->




>[!nexus_agent] **Assistant** - 12/10/2023 at 6:16 PM
> **Rate Limiting Description:**
> 
> Rate limiting is a mechanism employed by online platforms and APIs to control the number of requests a user or system can make within a specified time frame. This is done to prevent abuse, ensure fair usage, and maintain system stability. Each API may have its own rate-limiting policies, defining the maximum number of requests allowed per minute or per hour.
> 
> **Integration into the Prompt:**
> 
> In the prompt, the section regarding rate limiting can be added under the "Services" section where it discusses the interaction with job APIs. Specifically, it could be included in the following manner:
> 
> ```markdown
> # Services
> 
> Respect the robots.txt and the ToS and Privacy policies of each of the job APIs.
> Search each service's API documentation for their rate-limiting policy and be sure to respect it in the implementation. Rate limiting is a crucial consideration to prevent overwhelming the job platforms and ensure long-term access to their data.
> Use node js and express for the backend.
> Generate a docker-compose.yml file that will stand up:
>  the entry file of which will be `./services/job-hunter/index.js`.
>  the entry file of which will be `./services/get-similar-words.js`.
>  A boilerplate MongoDB instance.
>  A boilerplate Weaviate instance.
> ```
> 
> In this placement, the mention of rate limiting is integrated naturally into the flow of the services section, emphasizing its importance in maintaining ethical and responsible interactions with the job APIs.
<!-- UID: 058a0035-21ef-4225-95bd-1acfb5bcc826 -->

---



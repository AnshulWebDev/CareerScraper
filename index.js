const puppeteer = require("puppeteer");
const fs = require("fs");

const jobKeyWord = "data";
let pageNumber = "2";
const maxPageNumber = "5";

const URL = `https://www.naukri.com/${jobKeyWord}-jobs`;

const scrapJobs = async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto(URL);

  // Wait for the job listings to load
  await page.waitForSelector(".list article");

  await page.waitForSelector(".jobTuple");

  // Extract job titles, company names, and URLs
  const jobList = await page.evaluate(() => {
    const listings = Array.from(document.querySelectorAll(".jobTuple"));
    return listings.map((listing) => {
      const jobTitleElement = listing.querySelector(".title");
      const jobTitle = jobTitleElement
        ? jobTitleElement.textContent.trim()
        : "N/A";

      const companyElement = listing.querySelector(".companyInfo .subTitle");
      const company = companyElement
        ? companyElement.textContent.trim()
        : "N/A";

      const urlElement = listing.querySelector("a");
      const url = urlElement ? urlElement.getAttribute("href") : "N/A";

      const tagsElement = Array.from(listing.querySelectorAll(".tags li"));
      const tags = tagsElement.map((tagsElement) =>
        tagsElement.textContent.trim()
      );

      const jobLocationElement = listing.querySelector(".locWdth");
      const jobLocation = jobLocationElement
        ? jobLocationElement.textContent.trim()
        : "N/A";

      const jobDateElement = listing.querySelector(".postedDate");
      const jobDate = jobDateElement
        ? jobDateElement.textContent.trim()
        : "N/A";

      const companyImageUrl = listing.querySelector(".imgCont img");
      const companyImage = companyImageUrl
        ? companyImageUrl.getAttribute("src")
        : "N/A";

      return {
        jobTitle,
        company,
        url,
        tags,
        jobLocation,
        companyImage,
        jobDate,
      };
    });
  });
  // Print individual job details
  console.log(jobList);

  //json file output
  fs.writeFile("job_data.json", JSON.stringify(jobList, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("Job data has been saved to job_data.json");
    }
  });
  // Close the browser
  await browser.close();
};
scrapJobs();


setTimeout(() => {
  scrapJobsNextPage();
}, 15000);

const scrapJobsNextPage = async () => {
  // Launch Puppeteer
  for (pageNumber; pageNumber <= maxPageNumber; pageNumber++) {
    //for page change according to condition
    const pageChangeURL = `https://www.naukri.com/${jobKeyWord}-jobs-${pageNumber}`;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(pageChangeURL);

    // Wait for the job listings to load
  await page.waitForSelector(".list article");

  await page.waitForSelector(".jobTuple");

  // Extract job titles, company names, and URLs
  const jobList = await page.evaluate(() => {
    const listings = Array.from(document.querySelectorAll(".jobTuple"));
    return listings.map((listing) => {
      const jobTitleElement = listing.querySelector(".title");
      const jobTitle = jobTitleElement
        ? jobTitleElement.textContent.trim()
        : "N/A";

      const companyElement = listing.querySelector(".companyInfo .subTitle");
      const company = companyElement
        ? companyElement.textContent.trim()
        : "N/A";

      const urlElement = listing.querySelector("a");
      const url = urlElement ? urlElement.getAttribute("href") : "N/A";

      const tagsElement = Array.from(listing.querySelectorAll(".tags li"));
      const tags = tagsElement.map((tagsElement) =>
        tagsElement.textContent.trim()
      );

      const jobLocationElement = listing.querySelector(".locWdth");
      const jobLocation = jobLocationElement
        ? jobLocationElement.textContent.trim()
        : "N/A";

      const jobDateElement = listing.querySelector(".postedDate");
      const jobDate = jobDateElement
        ? jobDateElement.textContent.trim()
        : "N/A";

      const companyImageUrl =listing.querySelector(".imgCont img");
      const companyImage =companyImageUrl
        ? companyImageUrl.getAttribute("src")
        : "N/A";

      return {
        jobTitle,
        company,
        url,
        tags,
        jobLocation,
        companyImage,
        jobDate,
      };
    });
  });
  // Print individual job details
  console.log(jobList);

  //json file output
  fs.appendFile("job_data.json", JSON.stringify(jobList, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("Job data has been saved to job_data.json");
    }
  });

  // Close the browser
  await browser.close();
  }
};

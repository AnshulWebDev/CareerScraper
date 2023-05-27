const puppeteer = require("puppeteer");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const naukriData=()=>{
  const url = "mongodb://127.0.0.1:27017";
const dbName = "careerScrapper";
const collectionName = "jobs";

const client = new MongoClient(url, {
  useUnifiedTopology: true,
});

const jobKeyWord = "web-developer";
let pageNumber = "2";
const maxPageNumber = "6";
const URL = `https://www.naukri.com/${jobKeyWord}-jobs`;

const scrapJobs = async () => {
  // Launch Puppeteer
  const pageChangeURL = `https://www.naukri.com/${jobKeyWord}-jobs-${pageNumber}`;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto(URL);

  // Wait for the job listings to load
  await page.waitForSelector(".list article", { timeout: 60000 });

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

  const filteredJobList = jobList.filter((job) => {
    return (
      job.jobTitle !== "N/A" &&
      job.company !== "N/A" &&
      job.url !== "N/A" &&
      job.tags.length > 0 &&
      job.jobLocation !== "N/A" &&
      job.jobDate !== "N/A"
    );
  });

  // Print individual job details
  // console.log(filteredJobList);

  // Check if filteredJobList is not empty
  if (filteredJobList.length > 0) {
    await client.connect();
    // Insert data to MongoDB
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if job data already exists in the collection
    const existingJobs = await collection
      .find({
        $or: filteredJobList.map((job) => ({
          jobTitle: job.jobTitle,
          company: job.company,
          url: job.url,
          jobLocation: job.jobLocation,
          jobDate: job.jobDate,
        })),
      })
      .toArray();

    const newJobs = filteredJobList.filter((job) => {
      // Check if the job is not already present in the database
      return !existingJobs.some(
        (existingJob) =>
          existingJob.jobTitle === job.jobTitle &&
          existingJob.company === job.company &&
          existingJob.url === job.url &&
          existingJob.tags === job.tags &&
          existingJob.jobLocation === job.jobLocation &&
          existingJob.jobDate === job.jobDate
      );
    });

    // console.log(newJobs);

    if (newJobs.length > 0) {
      // JSON file output
      fs.writeFile("job_data.json", JSON.stringify(newJobs, null, 2), (err) => {
        if (err) {
          console.error("Error writing JSON file:", err);
        } else {
          console.log("Job data has been saved to job_data.json");
        }
      });

      // Insert new jobs to MongoDB
      await collection.insertMany(newJobs);
    }
  }
  // Close the browser
  await browser.close();
};

scrapJobs();

setTimeout(() => {
  scrapJobsNextPage();
}, 15000);
// For page change according to condition
// for (pageNumber; pageNumber <= maxPageNumber; pageNumber++)

const scrapJobsNextPage = async () => {
  // For page change according to condition
  for (pageNumber; pageNumber <= maxPageNumber; pageNumber++) {
    // Launch Puppeteer
    const pageChangeURL = `https://www.naukri.com/${jobKeyWord}-jobs-${pageNumber}`;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(pageChangeURL);

    // Wait for the job listings to load
    await page.waitForSelector(".list article", { timeout: 60000 });

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

    const filteredJobList = jobList.filter((job) => {
      return (
        job.jobTitle !== "N/A" &&
        job.company !== "N/A" &&
        job.url !== "N/A" &&
        job.tags.length > 0 &&
        job.jobLocation !== "N/A" &&
        job.jobDate !== "N/A"
      );
    });

    // Print individual job details
    // console.log(filteredJobList);

    // Check if filteredJobList is not empty
    if (filteredJobList.length > 0) {
      await client.connect();
      // Insert data to MongoDB
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Check if job data already exists in the collection
      const existingJobs = await collection
        .find({
          $or: filteredJobList.map((job) => ({
            jobTitle: job.jobTitle,
            company: job.company,
            url: job.url,
            jobLocation: job.jobLocation,
            jobDate: job.jobDate,
          })),
        })
        .toArray();

      const newJobs = filteredJobList.filter((job) => {
        // Check if the job is not already present in the database
        return !existingJobs.some(
          (existingJob) =>
            existingJob.jobTitle === job.jobTitle &&
            existingJob.company === job.company &&
            existingJob.url === job.url &&
            existingJob.tags === job.tags &&
            existingJob.jobLocation === job.jobLocation &&
            existingJob.jobDate === job.jobDate
        );
      });

      // console.log(newJobs);

      if (newJobs.length > 0) {
        // JSON file output
        fs.writeFile(
          "job_data.json",
          JSON.stringify(newJobs, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing JSON file:", err);
            } else {
              console.log("Job data has been saved to job_data.json");
            }
          }
        );

        // Insert new jobs to MongoDB
        await collection.insertMany(newJobs);
      }
    }
    // Close the browser
    await browser.close();
    await client.close();
  }
};
}

naukriData();
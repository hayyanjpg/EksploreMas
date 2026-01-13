#  ExploreMas - Tourism & Culinary Directory

**ExploreMas** is a full-stack web application designed to help users discover hidden gems, culinary spots, and hangout places. 

This project serves as a dual-purpose portfolio:
1.  **Development:** Demonstrating modern web development skills (Rust & TypeScript) with AI-Assisted coding.
2.  **Quality Assurance:** A comprehensive showcase of End-to-End Testing, API Load Testing, and Performance Optimization analysis.

---

##  Tech Stack

### Development (Built with AI Assistance)
* **Frontend:** TypeScript, React, Tailwind CSS
* **Backend:** Rust (High-performance API)
* **Database:** PostgreSQL (Neon DB)
* **Hosting:** Vercel (FE) & HuggingFace Spaces (BE)

### Quality Assurance (QA Tools)
* **Manual Testing:** Blackbox Testing & Exploratory Testing
* **Automation/Load Testing:** k6 (JavaScript)
* **API Testing:** Postman & Chrome DevTools Network Analysis
* **Performance Audit:** Google Lighthouse

---

##  QA Project Highlights

As the lead QA for this project, I conducted rigorous testing to ensure stability and performance.

### 1. Load Testing & Scalability
Simulated heavy traffic using **k6** to test backend limits.
* **Scenario:** 50 Concurrent Virtual Users (VUs) with Ramp-up period.
* **Result:** 100% Success Rate (No Crash), but identified high latency.
* **Observation:** Average response time ~1.6s due to distributed free-tier architecture (Network Latency).
* **Recommendation:** Implemented Redis Caching for static endpoints (e.g., `/wisata_alam`) to reduce latency to <500ms.

### 2. Manual & Functional Testing
* Verified comprehensive test scenarios (Positive & Negative cases) for Search, Filter, and Admin CRUD modules.
* Identified and reported **Major Bug** in Mobile Responsive Layout (CLS issues).

### 3. Performance Audit (Lighthouse)
* **Accessibility Score:** 96/100 (Excellent)
* **Best Practices:** 96/100 (Excellent)
* **Performance:** 74/100 (Needs Optimization on Image LCP)


##  Test Artifacts & Reports

Detailed documentation of the testing process can be found here:

| Document | Description |
| :--- | :--- |
| [ **Final QA Report (PDF)**](./Final%20Report%20website%20ExploreMas.pdf) | Complete report covering Manual, API, and Load Test analysis. |
| [ **Load Test Script**](./performance.js) | The k6 JavaScript code used to simulate user traffic. |
| [ **Bug Report Log**](./Final%20Report%20website%20ExploreMas.pdf) | List of identified bugs categorized by severity. |

---

##  How to Run the Load Test (Locally)

If you want to replicate the performance test results:

1.  **Install k6**:
    ```bash
    # Windows
    winget install k6
    # Mac
    brew install k6
    ```

2.  **Clone this repository**:
    ```bash
    git clone [https://github.com/yourusername/QA-Portfolio-ExploreMas.git](https://github.com/yourusername/QA-Portfolio-ExploreMas.git)
    cd QA-Portfolio-ExploreMas
    ```

3.  **Run the script**:
    ```bash
    k6 run performance.js
    ```

---

##  Author

**Hayyan N** *Aspiring QA Engineer & Full-Stack Enthusiast*

> "Building with AI, Perfecting with QA Logic."

Connect with me on [LinkedIn](www.linkedin.com/in/hayyannashrulloh)

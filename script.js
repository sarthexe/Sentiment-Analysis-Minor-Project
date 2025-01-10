const tweetsContainer = document.getElementById("tweets-container");
const addTweetBtn = document.getElementById("add-tweet-btn");
const analyzeBtn = document.getElementById("analyze-btn");
const resultsDiv = document.getElementById("results");

let tweets = [{ translated_content: "" }];

// Function to render the tweets
function renderTweets() {
  tweetsContainer.innerHTML = "";
  tweets.forEach((tweet, index) => {
    const tweetDiv = document.createElement("div");
    tweetDiv.className = "tweet";
    tweetDiv.innerHTML = `
      <textarea
        placeholder="Enter translated content"
        rows="2"
        oninput="updateTweet(${index}, this.value)"
      >${tweet.translated_content}</textarea>
      <button class="btn remove-btn" onclick="removeTweet(${index})">Remove Tweet</button>
    `;
    tweetsContainer.appendChild(tweetDiv);
  });
}

// Function to update a tweet's content
function updateTweet(index, value) {
  tweets[index].translated_content = value;
}

// Function to add a new tweet
function addTweet() {
  tweets.push({ translated_content: "" });
  renderTweets();
}

// Function to remove a tweet
function removeTweet(index) {
  tweets.splice(index, 1);
  renderTweets();
}

// Function to analyze sentiment
async function analyzeSentiment() {
  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;
  resultsDiv.classList.add("hidden");

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze_sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweets }),
    });
    const result = await response.json();

    resultsDiv.innerHTML = `
      <h3>Results</h3>
      <p><strong>Positive Count:</strong> ${result.positive_count}</p>
      <p><strong>Neutral Count:</strong> ${result.neutral_count}</p>
      <p><strong>Negative Count:</strong> ${result.negative_count}</p>
      <h4>Running Average Sentiment Over Time:</h4>
      <p>The values indicate the degree of positive or negative meaning</p>
      <pre>${JSON.stringify(result.running_avg, null, 2)}</pre>
    `;
    resultsDiv.classList.remove("hidden");
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    alert("An error occurred while analyzing sentiment. Please try again.");
  }

  analyzeBtn.textContent = "Analyze Sentiment";
  analyzeBtn.disabled = false;
}

// Event listeners
addTweetBtn.addEventListener("click", addTweet);
analyzeBtn.addEventListener("click", analyzeSentiment);

// Initial render
renderTweets();

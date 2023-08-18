let selectedIndex = -1; // -1 is the starting point of our indexes ->
const selectedColor = "#eee";
let initialValue = "";

// MATCHING THE INPUT FUNCTION
const getMatches = (query) => {
  if (!query) {
    // NO CHARACTERS TYPED
    hideResults();
    return;
  }

  // THERE ARE CHARACTERS IN THE INPUT
  const baseURL =
    "http://localhost/sites/autocomplete_searchbar/backend/cities_api.php"; // links to our php file
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${baseURL}?query=${query}`);

  xhr.addEventListener("load", (e) => {
    // prevents the children from repeating/adding onto itself -> instead it erases the children when the user resets the input
    resultsContainer.innerHTML = "";
    const response = e.currentTarget.responseText;
    if (e.currentTarget.status === 200 && response.length > 0) {
      const results = response.split("|");
      displayResults(results);
    } else if (e.currentTarget.status !== 200) {
      handleError(e.currentTarget.status);
    } else {
      hideResults();
    }
  });
  xhr.send(null);
};

// zipcode function
const sendRequest = (query) => {
  // console.log("SEND REQUEST:", query);
  hideResults();

  // 1. Send a request to my backend
  // 2. My backend will send a request to the API
  // Why? -> leaving any private information into the JS file is dangerous -> users can find this information through inspect
  const apiKey =
    "IgloaVH0wkO8Qtl9m8On62vRx3MDV8C8Ae247Br1hqCJqFOZ4tcFORfRzJE9yVDF";
  const baseURL = "https://capitalzipcodes.vercel.app";

  // this split will seperate the string into two index's
  const cityState = query.split(" - "); // Albany - NY,  Salt+Lake+City - UT
  // index 0 is going to be the CITIES
  const city = cityState[0].replaceAll(" ", "+"); // if cities have more than 1 word -> spaces will be replaced with "+"
  // index 1 is going to be the STATES
  const state = cityState[1];

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${baseURL}/?api_key=${apiKey}&city=${city}&state=${state}`); // shortens the link/readability
  xhr.addEventListener("load", () => {
    zipcodeContainer.innerHTML = `<h2>Zipcodes for ${cityState[0]} ${
      state ? " - " + state : ""
    }`;
    if (xhr.status === 200) {
      const zipcodes = JSON.parse(xhr.responseText).zip_codes;
      console.log(zipcodes);
      zipcodes.forEach((zip) => {
        const p = document.createElement("p");
        p.textContent = zip;
        zipcodeContainer.appendChild(p);
      });
    } else {
      const p = document.createElement("p");
      p.textContent = "No zipcodes found";
      zipcodeContainer.appendChild(p);
    }
  });
  xhr.send(null);
};

const displayResults = (results) => {
  resultsContainer.style.display = "block";
  input.dataset.open = true;
  results.forEach((result, index) => {
    const p = document.createElement("p");
    p.textContent = result;
    p.dataset.index = index;
    p.addEventListener("click", handleResultClick, true);
    p.addEventListener("mouseenter", handleMouseEnter);
    p.addEventListener("mouseleave", handleMouseLeave);
    resultsContainer.appendChild(p);
  });
};

const handleError = (status) => {
  console.error(status);
};

const handleResultClick = (e) => {
  input.value = e.currentTarget.textContent;
  sendRequest(input.value);
  hideResults();
};

// Prevent the cursor from jumping to the beginning
input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
  }
});

input.addEventListener("keyup", (e) => {
  const value = e.currentTarget.value;
  if (e.key === "Enter" && value) {
    sendRequest(value);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    handleArrowDown(value);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    handleArrowUp(value);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    input.value = initialValue;
    if (resultsContainer.children[selectedIndex]) {
      resultsContainer.children[selectedIndex].style.backgroundColor =
        "initial";
    }
    selectedIndex = -1;
  } else {
    initialValue = value;
    getMatches(value);
  }
});

const handleArrowUp = (value) => {
  // children gives an array of the child elements
  const results = resultsContainer.children;
  if (results.length === 0) return; // no results

  // I HAVE RESULTS
  selectedIndex--;
  // if the
  if (results[selectedIndex + 1]) {
    results[selectedIndex + 1].style.backgroundColor = "initial";
  }
  if (selectedIndex >= 0) {
    results[selectedIndex].style.backgroundColor = selectedColor;
    input.value = results[selectedIndex].textContent;
  } else if (selectedIndex === -1) {
    input.value = initialValue;
  } else if (selectedIndex <= -2) {
    // if the selectedindex is currently on -1 but it overextends -> push back to the last index
    selectedIndex = results.length - 1; // set to last index
    results[selectedIndex].style.backgroundColor = selectedColor;
    input.value = results[selectedIndex].textContent;
  }
};

const handleArrowDown = (value) => {
  const results = resultsContainer.children;
  if (results.length === 0) return; // no results

  selectedIndex++;

  if (results[selectedIndex - 1]) {
    results[selectedIndex - 1].style.backgroundColor = "initial";
  }
  if (selectedIndex >= 0 && selectedIndex < results.length) {
    results[selectedIndex].style.backgroundColor = selectedColor;
    input.value = results[selectedIndex].textContent;
  } else if (selectedIndex >= results.length) {
    selectedIndex = -1;
    input.value = initialValue;
  }
};

// if the user isn't using the search bar/input -> collapse the container
const hideResults = () => {
  input.dataset.open = false;
  resultsContainer.innerHTML = "";
  resultsContainer.style.display = "none";
  selectedIndex = -1;
};

// prevent the input's blur event if clicking on a result
// needed because blur fires before click
// don't prevent default if clicking on the input,
// or else can't select text or move cursor
autocomplete.addEventListener("mousedown", (e) => {
  if (e.target !== input) {
    e.preventDefault();
  }
});

autocomplete.addEventListener("click", (e) => {
  if (e.currentTarget === e.target) {
    input.focus();
    input.placeholder = "City Name";
  }
});

input.addEventListener("blur", (e) => {
  if (input.value === "") {
    input.placeholder = " ";
  }
  hideResults();
});

// If the input still has text in it, get matches when re-focusing
input.addEventListener("focus", () => {
  getMatches(input.value);
});

const handleMouseEnter = (e) => {
  if (selectedIndex > -1) {
    resultsContainer.children[selectedIndex].style.backgroundColor = "initial";
  }
  selectedIndex = e.currentTarget.dataset.index;
  e.currentTarget.style.backgroundColor = selectedColor;
};
const handleMouseLeave = (e) => {
  e.currentTarget.style.backgroundColor = "initial";
};

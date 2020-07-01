// We have buttons in UI which can change query variables or trigger a request. With fetchSetup we configure query variables and pass them as parameters to our fetchMedia function and then call it.
// For now we configure search and page
function fetchSetup() {
  // Gets search query from user
  const getSearchQuery = () => {
    const mediaInput = document.getElementById("mediaInput");
    const searchQuery = document.getElementById("searchQuery");
    searchQuery.innerHTML = `Showing results for: ${mediaInput.value}`;
    return mediaInput.value;
  };
  // Declares current page
  if (this.id === "mediaBtn") {
    let currentPage;
  }
  // Determines current page
  const getCurrentPage = () => {
    if (this.id === "previousBtn") {
      if (parseInt(currentPage) !== 1) {
        currentPage = parseInt(currentPage) - 1;
        console.log(this.id, currentPage);
      }
    }
    if (this.id === "nextBtn") {
      currentPage = parseInt(currentPage) + 1;
      console.log(this.id, currentPage);
    }
    if (this.id === "mediaBtn") {
      currentPage = 1;
      console.log(this.id, currentPage);
    }
    return currentPage;
  };
  // fetchMedia returns a promise with formatted data of a particular request then we can call showResults to manipulate the DOM.
  fetchMedia(getSearchQuery(), getCurrentPage()).then(showResults);
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Event listeners which trigger fetchSetup
document.getElementById("mediaForm").addEventListener("click", function (e) {
  e.preventDefault();
});
document.getElementById("mediaBtn").addEventListener("click", fetchSetup);
document.getElementById("previousBtn").addEventListener("click", fetchSetup);
document.getElementById("nextBtn").addEventListener("click", fetchSetup);

// By using graphql, fetchMedia triggers a query request and receives data. Then it formats the data in the form of an array of objects which we can retrieve and manipulate data from using forEach.
const fetchMedia = async (search, page) => {
  // Checkout https://anilist.gitbook.io/anilist-apiv2-docs/
  // And https://anilist.co/graphiql
  const query = `
  query ($id: Int, $page: Int, $perPage: Int, $search: String) {
    Page (page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media (id: $id, search: $search, type: ANIME) {
        id
        title {
          romaji
        }
        description
        coverImage {
          medium
          color
        }
      }
    }
  }
  `;

  const variables = {
    search: search,
    page: page,
    perPage: 10,
  };

  const url = "https://graphql.anilist.co";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  };

  const response = await fetch(url, options);
  const rawData = await response.json();
  // Here we format the data
  const entries = [];
  const data = rawData.data.Page.media;
  data.forEach((element) => {
    const entry = {
      id: element.id,
      title: element.title.romaji,
      des: element.description,
      imageUrl: element.coverImage.medium,
      imageColor: element.coverImage.color,
    };
    entries.push(entry);
  });
  return entries;
};

// Manipulates the DOM to show our desired outcome on the screen
const showResults = (data) => {
  const list = document.getElementById("list");
  list.innerHTML = null;
  data.forEach((entry) => {
    list.innerHTML += `
    <li>
      <h3>${entry.title}</h3>
      <img src="${entry.imageUrl}" alt="${entry.title}">
      <p>${entry.des}</p>
    </li>`;
    console.log(entry.title);
  });
};

const getSearchQuery = () => {
  const mediaInput = document.getElementById("mediaInput");
  const searchQuery = document.getElementById("searchQuery");
  searchQuery.innerHTML = `Showing results for: ${mediaInput.value}`;
  return mediaInput.value;
};
let currentPage = 0;
function fetchHandler() {
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
  fetchMedia(getSearchQuery(), getCurrentPage()).then(showResults);
}
document.getElementById("mediaBtn").addEventListener("click", fetchHandler);

document.getElementById("previousBtn").addEventListener("click", fetchHandler);
document.getElementById("nextBtn").addEventListener("click", fetchHandler);

const fetchMedia = async (title, page) => {
  var query = `
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

  var variables = {
    search: title,
    page: page,
    perPage: 10,
  };

  var url = "https://graphql.anilist.co";
  var options = {
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

  // fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

  // function handleResponse(response) {
  //   return response.json().then(function (json) {
  //     return response.ok ? json : Promise.reject(json);
  //   });
  // }

  // function handleData(rawData) {
  //   const entries = [];
  //   data = rawData.data.Page.media;
  //   data.forEach((element) => {
  //     const entry = {
  //       id: element.id,
  //       title: element.title.romaji,
  //       imageUrl: element.coverImage.medium,
  //       imageColor: element.coverImage.color,
  //     };
  //     entries.push(entry);
  //   });
  //   return entries;
  // }

  // function handleError(error) {
  //   alert("Error, check console");
  //   console.error(error);
  // }
};

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

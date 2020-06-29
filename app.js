const clickEventHandler = () => {
  const mediaInput = document.getElementById("mediaInput");
  const searchQuery = document.getElementById("searchQuery");
  searchQuery.innerHTML = `Showing results for: ${mediaInput.value}`;
  fetchMedia(mediaInput.value);
  showResults();
};
document
  .getElementById("mediaBtn")
  .addEventListener("click", clickEventHandler);

const fetchMedia = async (title) => {
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
    page: 1,
    perPage: 10,
  };

  var url = "https://graphql.anilist.co",
    options = {
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
  fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

  function handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  function handleData(rawData) {
    const entries = [];
    data = rawData.data.Page.media;
    data.forEach((element) => {
      const entry = {
        id: element.id,
        title: element.title.romaji,
        imageUrl: element.coverImage.medium,
        imageColor: element.coverImage.color,
      };
      entries.push(entry);
    });
    return entries;
  }

  function handleError(error) {
    alert("Error, check console");
    console.error(error);
  }
};

const showResults = () => {
  const list = document.getElementById("list");
};

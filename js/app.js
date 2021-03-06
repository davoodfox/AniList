// We have buttons in UI which can change query variables or trigger a request. With fetchSetup we configure query variables and pass them as parameters to our fetchMedia function and then call it.
// For now we configure search and page

const EVT = new EventEmitter2();

const PageInfo = (function () {
  var page, query;
  EVT.on("page-info-updated", function (obj) {
    page = obj.page;
    query = obj.query;
  });
  function init() {
    return {
      page: page,
      query: query,
    };
  }
  return {
    init: init,
  };
})();

const SearchForm = (function () {
  document.getElementById("searchForm").addEventListener("click", function (e) {
    e.preventDefault();
  });
  function SearchButtonClickHandler() {
    searchInput = document.getElementById("searchInput");
    if (searchInput.value == "") {
      alert("Please fill in the search bar");
      return;
    }
    const pageInfo = {
      page: 1,
      query: searchInput.value,
    };
    searchInput.value = "";
    EVT.emit("page-info-updated", pageInfo);
    document.getElementById(
      "searchQuery"
    ).innerText = `Showing results for: ${pageInfo.query}`;
  }
  document
    .getElementById("searchButton")
    .addEventListener("click", SearchButtonClickHandler);
})();

const Pagination = (function () {
  const pagination = document.getElementById("pagination");
  pagination.addEventListener("click", function (e) {
    pageInfo = PageInfo.init();
    if (e.target.id == "previousBtn") {
      if (pageInfo.page != 1) {
        pageInfo.page--;
      }
    }
    if (e.target.id == "nextBtn") {
      pageInfo.page++;
    }
    EVT.emit("page-info-updated", pageInfo);
  });
})();

const GraphQl = (function () {
  EVT.on("page-info-updated", function (obj) {
    fetchMedia(obj.page, obj.query).then(showResults);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  });
})();

// By using graphql, fetchMedia triggers a query request and receives data. Then it formats the data in the form of an array of objects which we can retrieve and manipulate data from using forEach.
const fetchMedia = async (page, search) => {
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
        bannerImage
        externalLinks {
          url
          site
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
      bannerUrl: element.bannerImage,
      linkNames: [],
      linkUrls: [],
    };
    element.externalLinks.forEach((element) => {
      entry.linkNames.push(element.site);
      entry.linkUrls.push(element.url);
    });
    entries.push(entry);
  });
  return entries;
};

// Manipulates the DOM to show our desired outcome on the screen
const showResults = (data) => {
  const list = document.getElementById("list");
  var style = document.createElement("style");
  style.type = "text/css";
  document.getElementsByTagName("head")[0].appendChild(style);

  list.innerHTML = null;
  data.forEach((entry) => {
    style.innerHTML += `
    #listItem${entry.id} {
      width: 100%;
      height: 100%;
      display: block;
      position: relative;
      background-color: ${entry.imageColor}22;
    }
    #listItem${entry.id}::after {
      content: "";
      background: url(${entry.bannerUrl});
      background-size: cover;
      background-position: top;
      opacity: 0.2;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      position: absolute;
      z-index: -1;   
    }
    
    `;
    list.innerHTML += `
    <li class="list__item" id="listItem${entry.id}">
      <h3 class="list__item__title">${entry.title}</h3>
      <img src="${entry.imageUrl}" alt="${entry.title}" class="list__item__image">
      <p class="list__item__paragraph">${entry.des}</p>
      <ul class="list__item__links" id="linkList${entry.id}">
      </ul>
    </li>`;
    const linkList = document.getElementById(`linkList${entry.id}`);
    entry.linkNames.forEach((element, index) => {
      linkList.innerHTML += `<li class="list__item__links__item"><a href="${entry.linkUrls[index]}" class="list__item__links__link">${element}</a></li>`;
    });
    // console.log(entry.linkNames, entry.linkUrls);
  });
  document.getElementById("pagination").style.display = "flex";
};

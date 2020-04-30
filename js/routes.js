//an array, defining the routes
export default [
  {
    //the part after '#' in the url (so-called fragment):
    hash: 'welcome',
    ///id of the target html element:
    target: 'router-view',
    //the function that returns content to be rendered to the target html element:
    getTemplate: (targetElm) =>
      renderMenuAnd(() => {
        document.getElementById(targetElm).innerHTML = document.getElementById(
          'template-welcome'
        ).innerHTML;
      }),

    // (document.getElementById(targetElm).innerHTML = document.getElementById(
    //   'template-welcome'
    // ).innerHTML),
  },
  {
    hash: 'articles',
    target: 'router-view',
    getTemplate: fetchAndDisplayArticles,
  },

  {
    hash: 'article',
    target: 'router-view',
    getTemplate: fetchAndDisplayArticle,
  },

  {
    hash: 'opinions',
    target: 'router-view',
    getTemplate: createHtml4opinions,
  },

  {
    hash: 'addOpinion',
    target: 'router-view',
    getTemplate: (targetElm) =>
      (document.getElementById(targetElm).innerHTML = document.getElementById(
        'template-addOpinion'
      ).innerHTML),
  },
];

function createHtml4opinions(targetElm) {
  const opinions = JSON.parse(localStorage.contactForm);

  if (opinions && Array.isArray(opinions)) {
    const container = document.getElementById(targetElm);
    console.log(container);

    const content = opinions.reduce((acum, elem) => {
      return acum + renderOpinion(elem);
    }, '');

    container.innerHTML = content;
  }
}

async function fetchAndDisplayArticles(targetElm, page, count) {
  if (page === undefined || count === undefined) {
    window.location.hash = `#articles/${getLastOffsetPage()}/${getLastLimit()}`;
  }

  const limit = parseInt(count);
  const offsetPage = parseInt(page);
  const offset = offsetPage > 1 ? limit * (offsetPage - 1) : 0;

  try {
    const response = await fetchArticles(limit, offset);

    const totalCount = response.meta.totalCount;

    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById('template-articles').innerHTML,
      Object.assign(
        {},
        { articles: response.articles },
        {
          prevPage: offsetPage > 1 ? offsetPage - 1 : 0,
          nextPage: offset + limit > totalCount ? 0 : offsetPage + 1,
          pageCount: limit,
        }
      )
    );
    const newPager = {
      offsetPage: offsetPage,
      limit: limit,
    };

    sessionStorage.pagerHistory = JSON.stringify(newPager);
    renderMenu();
  } catch (error) {
    // console.log('here');

    const errMsgObj = { errMessage: error };
    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById('template-articles-error').innerHTML,
      errMsgObj
    );
  }
}

function getLastOffsetPage() {
  if (sessionStorage.pagerHistory === undefined) {
    return 1;
  }
  const pager = JSON.parse(sessionStorage.pagerHistory);
  if (pager !== undefined) {
    return pager.offsetPage ? pager.offsetPage : 1;
  }
  return 1;
}

function getLastLimit() {
  if (sessionStorage.pagerHistory === undefined) {
    return 20;
  }
  const pager = JSON.parse(sessionStorage.pagerHistory);
  if (pager !== undefined) {
    return pager.limit ? pager.limit : 20;
  }
  return 20;
}

function renderOpinion(elem) {
  const template = document.getElementById('template-opinions').innerHTML;
  const formatedElement = Object.assign({}, elem, {
    createdDate: new Date(elem.createdDate).toLocaleDateString(),
  });

  const renderedOpinion = Mustache.render(template, formatedElement);
  return renderedOpinion;
}

async function fetchArticles(limit = 20, offset = 0) {
  const url = 'https://wt.kpi.fei.tuke.sk/api/article';

  const response = await fetch(`${url}/?max=${limit}&offset=${offset}`);

  if (!response.ok) {
    throw new Error(
      `Server answered with ${response.status}: ${response.statusText}.`
    );
  }
  const responseJson = await response.json();
  addArtDetailLink2ResponseJson(responseJson);
  //   const articlesReponses = await Promise.all(
  //     responseJson.articles.map((article) => fetch(`${url}/${article.id}`))
  //   );

  //   const errors = articlesReponses.reduce((acum, item) => {
  //     if (!item.ok) {
  //       return acum + ' ' + item.url;
  //     }
  //     return acum;
  //   }, '');

  //   if (errors != '') {
  //     throw new Error(`Failed to access the comments with urls ${errors}.`);
  //   }

  //   const articles = await Promise.all(articlesReponses.map((i) => i.json()));

  //   return { articles: articles, meta: responseJson.meta };
  return responseJson;
}

async function fetchAndDisplayArticle(targetElm, artIdFromHash, page, count) {
  fetchAndProcessArticle(...arguments, false);
}

function fetchAndProcessArticle(
  targetElm,
  artIdFromHash,
  page,
  count,
  forEdit
) {
  const urlBase = 'https://wt.kpi.fei.tuke.sk/api';
  const url = `${urlBase}/article/${artIdFromHash}`;
  console.log(url);

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        //if we get server error
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then((responseJSON) => {
      if (forEdit) {
      } else {
        responseJSON.backLink = `#articles/${page}/${count}`;
        responseJSON.editLink = `#artEdit/${responseJSON.id}/${page}/${count}`;
        responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${page}/${count}`;

        document.getElementById(targetElm).innerHTML = Mustache.render(
          document.getElementById('template-article').innerHTML,
          responseJSON
        );
      }
    })
    .catch((error) => {
      ////here we process all the failed promises
      const errMsgObj = { errMessage: error };
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById('template-articles-error').innerHTML,
        errMsgObj
      );
    });
}

function addArtDetailLink2ResponseJson(responseJSON) {
  responseJSON.articles = responseJSON.articles.map((article) => ({
    ...article,
    detailLink: `#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`,
  }));
}

function renderMenu() {
  console.log(getLastOffsetPage());
  console.log(getLastLimit());

  document.getElementById('menu').innerHTML = Mustache.render(
    document.getElementById('template-menu').innerHTML,
    {
      page: getLastOffsetPage(),
      count: getLastLimit(),
    }
  );
}

// HOC for rendering menu with every route
function renderMenuAnd(job) {
  job();
  renderMenu();
}

//an array, defining the routes

const urlBase = 'https://wt.kpi.fei.tuke.sk/api';
const back4appURL = 'https://parseapi.back4app.com/classes/opinions';
const commentCount = 10;
const uniqueTag = 'chemistry';

export default [
  {
    hash: 'welcome',
    target: 'router-view',
    getTemplate: (targetElm) =>
      renderMenuAnd(() => {
        document.getElementById(targetElm).innerHTML = document.getElementById(
          'template-welcome'
        ).innerHTML;
      }),
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
    getTemplate: fetchadnDisplayOpinions,
  },

  {
    hash: 'addOpinion',
    target: 'router-view',
    getTemplate: addOpinion,
  },
  {
    hash: 'artEdit',
    target: 'router-view',
    getTemplate: editArticle,
  },
  {
    hash: 'artDelete',
    target: 'router-view',
    getTemplate: deleteArticle,
  },
  {
    hash: 'artInsert',
    target: 'router-view',
    getTemplate: insertArticle,
  },
  {
    hash: 'commentInsert',
    tarhet: 'route-view',
    getTemplate: insertComment,
  },
];

// function fetchadnDisplayOpinions(targetElm) {
//   const opinions = JSON.parse(localStorage.contactForm);

//   if (opinions && Array.isArray(opinions)) {
//     const container = document.getElementById(targetElm);

//     const content = opinions.reduce((acum, elem) => {
//       return acum + renderOpinion(elem);
//     }, '');

//     container.innerHTML = content;
//   }
// }

async function fetchAndDisplayArticles(targetElm, page, count) {
  if (page === undefined || count === undefined) {
    window.location.hash = `#articles/${getLastOffsetPage()}/${getLastLimit()}`;
    return;
  }

  const limit = parseInt(count);
  const offsetPage = parseInt(page);
  const offset = offsetPage > 1 ? limit * (offsetPage - 1) : 0;

  try {
    //fetch articles načíta articles + content plus nataví link na deftail
    const response = await fetchArticles(limit, offset, offsetPage);

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
    const errMsgObj = { errMessage: error };
    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById('template-articles-error').innerHTML,
      errMsgObj
    );
  }
}

function renderOpinion(elem) {
  const template = document.getElementById('template-opinions').innerHTML;
  const formatedElement = Object.assign({}, elem, {
    createdDate: new Date(elem.createdDate).toLocaleDateString(),
  });

  const renderedOpinion = Mustache.render(template, formatedElement);
  return renderedOpinion;
}

async function fetchAndDisplayArticle(
  targetElm,
  artIdFromHash,
  page,
  count,
  commentPage
) {
  console.log('fetchAndDisplayArticle - start');
  await fetchAndProcessArticle(...arguments, false);
  console.log('fetchAndDisplayArticle - end');
}

async function fetchAndProcessArticle(
  targetElm,
  artIdFromHash,
  page,
  count,
  commentPageFromHash,
  forEdit
) {
  console.log('fetchAndProcessArticle - start');

  const commentPage = parseInt(commentPageFromHash);

  const url = `${urlBase}/article/${artIdFromHash}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new rror(
        `Server answered with ${response.status}: ${response.statusText}.`
      );
    }
    const responseJSON = await response.json();
    responseJSON.tags = responseJSON.tags.filter((f) => f !== uniqueTag);

    if (forEdit) {
      console.log('article edit');

      responseJSON.formTitle = 'Article Edit';
      responseJSON.formSubmitCall = `processArtEditFrmData(event,${artIdFromHash},${page},${count},${commentPage},'${urlBase}')`;
      responseJSON.submitBtTitle = 'Save article';
      responseJSON.urlBase = urlBase;

      responseJSON.backLink = `#article/${artIdFromHash}/${page}/${count}/${commentPage}`;

      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById('template-article-form').innerHTML,
        responseJSON
      );
    } else {
      responseJSON.backLink = `#articles/${page}/${count}`;
      responseJSON.editLink = `#artEdit/${responseJSON.id}/${page}/${count}/${commentPage}`;
      responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${page}/${count}/${commentPage}`;
      responseJSON.addCommentLink = `#commentInsert/${responseJSON.id}/${page}/${count}/${commentPage}`;

      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById('template-article').innerHTML,
        responseJSON
      );

      await fetchAndProcessArticleComments(
        artIdFromHash,
        page,
        count,
        commentPage
      );
    }
  } catch (error) {
    ////here we process all the failed promises
    const errMsgObj = { errMessage: error };
    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById('template-articles-error').innerHTML,
      errMsgObj
    );
  }

  console.log('fetchAndProcessArticle - end');
}

function editArticle(targetElm, artIdFromHash, page, count) {
  fetchAndProcessArticle(...arguments, true);
}

async function deleteArticle(targetElm, artIdFromHash, page, count) {
  const c = confirm('This article is going to be removed.');

  if (!c) {
    window.location.hash = `#article/${artIdFromHash}/${page}/${count}`;
    return;
  }

  try {
    await deleteArticleReq(artIdFromHash);
    alert('Article was successfuly deleted!');
    window.location.hash = `#articles/${page}/${count}`;
  } catch (error) {
    const errMsgObj = { errMessage: error };
    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById('template-articles-error').innerHTML,
      errMsgObj
    );
  }
}

async function insertArticle(targetElm, artIdFromHash, page, count) {
  const responseJSON = {};
  responseJSON.formTitle = 'Article Edit';
  // responseJSON.backLink = `#article/${artIdFromHash}/${page}/${count}`;
  responseJSON.formSubmitCall = `processInsertArticle(event, '${urlBase}')`;

  responseJSON.submitBtTitle = 'Insert article';
  responseJSON.urlBase = urlBase;

  document.getElementById(targetElm).innerHTML = Mustache.render(
    document.getElementById('template-article-form').innerHTML,
    responseJSON
  );
}

function renderMenu() {
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

async function fetchArticles(limit = 20, offset = 0, offsetPage = 1) {
  const url = 'https://wt.kpi.fei.tuke.sk/api/article';

  const response = await fetch(
    `${url}/?max=${limit}&offset=${offset}&tag=${uniqueTag}`
    // `${url}/?max=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(
      `Server answered with ${response.status}: ${response.statusText}.`
    );
  }
  const responseJson = await response.json();

  const artContent = responseJson.articles.map((article) => {
    return fetch(`${urlBase}/article/${article.id}`);
  });

  const articlesPromises = await Promise.all(artContent);

  const errorsUrl = articlesPromises.reduce((acum, item) => {
    if (!item.ok) {
      return acum + ' ' + item.url;
    }
    return acum;
  }, '');

  if (errorsUrl !== '') {
    throw new Error(`Unable load articles from ${errorsUrl}`);
  }
  const articlesJson = await Promise.all(articlesPromises.map((a) => a.json()));

  const articlesJsonShortContent = articlesJson.map((a) => {
    if (a.content.length > 200) {
      const content = a.content.substring(0, 200) + '...';
      return Object.assign({}, a, { content: content });
    } else {
      return a;
    }
  });

  const articles = articlesJsonShortContent.map((article) => ({
    ...article,
    detailLink: `#article/${article.id}/${offsetPage}/${limit}/1`,
  }));

  return Object.assign({}, responseJson, { articles: articles });
}

async function deleteArticleReq(articleId) {
  const deleteReqSettings = {
    method: 'DELETE',
  };

  //3. Execute the request
  const response = await fetch(
    `${urlBase}/article/${articleId}`,
    deleteReqSettings
  );
  if (!response.ok) {
    throw new Error(
      `Server answered with ${response.status}: ${response.statusText}.`
    );
  }
  return;
}

async function fetchAndProcessArticleComments(
  articleId,
  articlePage,
  articleCount,
  pageFromHash
) {
  try {
    const page = pageFromHash ? parseInt(pageFromHash) : 1;
    const offset = page > 1 ? commentCount * (page - 1) : 0;

    const commentsResponse = await fetch(
      `${urlBase}/article/${articleId}/comment?max=${commentCount}&offset=${offset}`
    );
    const comments = await commentsResponse.json();

    comments.comments = comments.comments.map((c) => {
      console.log(new Date(c.dateCreated).toDateString());

      return Object.assign({}, c, {
        dateCreated: new Date(c.dateCreated).toDateString(),
      });
    });
    // const
    const previousCommentPageLink = `#article/${articleId}/${articlePage}/${articleCount}/${
      page > 1 ? page - 1 : 1
    }`;
    const nextCommentPageLink = `#article/${articleId}/${articlePage}/${articleCount}/${
      page + 1
    }`;

    // const nextCommentPageLink = await

    document.getElementById('article-comments').innerHTML = Mustache.render(
      document.getElementById('template-article-comment').innerHTML,
      Object.assign({}, comments, {
        articleId: articleId,
        articlePage: articlePage,
        articleCount: articleCount,
        previousCommentPageLink: page > 1 ? page - 1 : 0,
        nextCommentPageLink:
          page * commentCount < comments.meta.totalCount ? page + 1 : 0,
      })
    );
  } catch (error) {
    console.log(error);

    // TODO: error
  }
}

async function insertComment(target, articleId, page, count, commentPage) {
  console.log('insertComment - start');

  await processInsertArticleComment(parseInt(articleId), urlBase);

  window.location.hash = `#article/${parseInt(articleId)}/${parseInt(
    page
  )}/${parseInt(count)}/${commentPage}`;
  console.log('insertComment - end');
}

function addOpinion(targetElm) {
  document.getElementById(targetElm).innerHTML = document.getElementById(
    'template-addOpinion'
  ).innerHTML;

  const userInfo = JSON.parse(sessionStorage.userInfo);
  if (userInfo.name !== undefined) {
    document.getElementById('name').value = userInfo.name;
  }
  if (userInfo.email !== undefined) {
    document.getElementById('email').value = userInfo.email;
  }
}

async function fetchadnDisplayOpinions(targetElm) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': 'lz2QCBACZ3E4XKq8rNJ9wC8ddHdMEDtIl750sO0u',
        'X-Parse-REST-API-Key': 'Q3NgdE00PieVrb4EjWbcjmt983Imynswu2zDRUOQ',
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(back4appURL, options);

    const responseJson = await response.json();
    console.log(responseJson.results);

    responseJson.results = responseJson.results.map((i) => {
      return Object.assign({}, i, {
        createdDate: new Date(i.createdDate).toDateString(),
      });
    });

    document.getElementById(
      targetElm
    ).innerHTML = Mustache.render(
      document.getElementById('template-opinions').innerHTML,
      { opinions: responseJson.results }
    );
  } catch (error) {
    renderError(targetElm, 'There wa s a problem with loading opinions');
  }
}

function renderError(targetElm, msg) {
  document.getElementById(
    targetElm
  ).innerHTML = Mustache.render(
    document.getElementById('template-error').innerHTML,
    { errMessage: msg }
  );
}

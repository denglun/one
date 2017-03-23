
/*

const first_post = '4968395';
const last_post = 'http://blog.tianya.cn/post-437001-25562026-1.shtml';
//const total = 'http://blog.tianya.cn/m/list.jsp?userId=6868524';
const blogpage = 'http://blog.tianya.cn/blog-437001-11.shtml';
const url = 'http://blog.tianya.cn/api/blog?method=blogRcmd.ice.selectthouchPostbyuserId&params.articleCount=1000&params.userId=6868524&params.postId=123873910';
//const url = 'http://www.tianya.cn/api/tw?method=userinfo.ice.getUserTotalArticleList&params.userId=6868524&params.pageSize=20&params.bMore=true&params.publicNextId=2147483647&params.techNextId=2147483647&params.cityNextId=2147483647'


app.get('/load', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  //console.log("response", response.json);
  fetch(url).then(response => response.json())
    .then(json => json.data.thouchPostbyuserIdData, err => res.end('error get source data.'))
    // .then(items => items.map(item => ({ title: item.Title, content: getContent(item.PostID), time: item.createDateTime })))
    .then(items => items.map(item => ({ time: item.createDateTime, title: item.Title, origin: item.PostID })))
    .then(result => res.end(JSON.stringify(result)));
});

app.get('/content/:pid', (req, res) => {

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  const pid = req.params.pid;
  console.log("pid", pid);
  const data_url = `http://blog.tianya.cn/m/post-${pid}.shtml`;

  const findArticle = html => {
    const start = html.indexOf('<article class="blog-article">');
    const end = html.indexOf('</article>');
    let art = html.substring(start + 30, end);
    art = art.replace(/<BR>/g, "\n\r");
    return art;
  };

  fetch(data_url).then(response => response.text())
    .then(html => findArticle(html), err => res.end('error get source data.' + err))
    .then(art => res.end(JSON.stringify({ content: art })));

});

app.post('/import', (req, res) => {
  req.body.posts.map(
    post => {
      console.log("save: ", post.title);
      db.get('posts').push(post).write();
    }
  );
  res.send('{"msg":"done"}');
});*/
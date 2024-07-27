import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

const News = (props) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const updateNews = async () => {
    props.setProgress(10);
    const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`;
    setLoading(true);

    try {
      let data = await fetch(url);
      let parsedData = await data.json();
      setTotalResults(parsedData.totalResults || 0);

      if (page === 1) {
        setArticles(parsedData.articles || []);
      } else {
        setArticles((prevArticles) => [...prevArticles, ...(parsedData.articles || [])]);
      }

      setLoading(false);
      props.setProgress(100);
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${capitalizeFirstLetter(props.category)} - NewsReport`;
    updateNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Include 'page' as a dependency to fix the useEffect warning

  const fetchMoreData = async () => {
    const nextPage = page + 1;
    const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${nextPage}&pageSize=${props.pageSize}`;

    try {
      let data = await fetch(url);
      let parsedData = await data.json();
      setTotalResults(parsedData.totalResults || 0);
      setPage(nextPage);
    } catch (error) {
      console.error("Error fetching more news:", error);
    }
  };

  return (
    <>
      <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>
        NewsReport - Top {capitalizeFirstLetter(props.category)} Headlines
      </h1>
      {loading && <Spinner />}
      <InfiniteScroll
        dataLength={articles.length}
        next={fetchMoreData}
        hasMore={articles.length < totalResults}
        loader={<Spinner />}
      >
        <div className="container">
          <div className="row">
            {articles.map((element, index) => (
              <div className="col-md-4" key={index}>
                <NewsItem
                  title={element.title || ""}
                  description={element.description || ""}
                  imageUrl={element.urlToImage || ""}
                  newsUrl={element.url || ""}
                  author={element.author || ""}
                  date={element.publishedAt || ""}
                  source={element.source?.name || ""}
                />
              </div>
            ))}
          </div>
        </div>
      </InfiniteScroll>
    </>
  );
};

News.defaultProps = {
  country: "in",
  pageSize: 8,
  category: "general",
};

News.propTypes = {
  country: PropTypes.string,
  pageSize: PropTypes.number,
  category: PropTypes.string,
};

export default News;

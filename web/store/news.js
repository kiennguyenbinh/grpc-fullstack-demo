import { NewsRequest, SubscribeRequest } from './grpc/news_service_pb.js'
import grpc from './grpc/news_service_grpc_web_pb.js'

const newsService = new grpc.NewsServiceClient('http://localhost:3000/grpc')
let currentSubscription = null

export const state = () => ({
  newsList: [],
  topic: null,
  breakingNews: null
})

export const mutations = {
  loadNews(state, newsList) {
    state.newsList = newsList
  },
  pushNews(state, news) {
    state.newsList.push(news)
    state.breakingNews = news
  },
  updateTopic(state, topic) {
    state.topic = topic
  }
}

export const actions = {
  getNews({ commit }, topic) {
    const request = new NewsRequest()
    request.setTopic(topic)
    newsService.getNews(request, {}, function(err, response) {
      if (!err) {
        commit('updateTopic', topic)
        commit('loadNews', response.getNewsList())
      }
    })
  },
  subscribe({ commit }, topic) {
    const subscribeRequest = new SubscribeRequest()
    subscribeRequest.setTopic(topic)
    if (currentSubscription !== null) currentSubscription.cancel()
    currentSubscription = newsService.subscribe(subscribeRequest, {})
    currentSubscription.on('data', function(response) {
      commit('pushNews', response)
    })
  }
}

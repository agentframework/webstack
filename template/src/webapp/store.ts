import * as Vue from 'vue'
import * as Vuex from 'vuex'
import axios from 'axios'
import { VersionResult } from '../shared/version';

Vue.use(Vuex); // No need when using vuex as external lib

export interface IState {
  version: string
}

const state: IState = {
  version: null
};

export default new Vuex.Store<IState>({
  state,
  mutations: {
    update: (state: IState, data: VersionResult) => state.version = data.version
  },
  actions: {
    refresh ({ commit }) {
      return axios.get(`/api/version`)
        .then(response => {
          commit('update', response.data);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
});
















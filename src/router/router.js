import VueRouter from 'vue-router';
import Vue from 'vue';
import store from '../vuex/store';
import router_list from './router_list';
import EventBus from '../utils/eventbus';

Vue.use(VueRouter);

const routes = router_list;

const scrollBehavior = (to, from, savedPosition) => {
  // if the returned position is falsy or an empty object,
  // will retain current scroll position.
  let position = false;

  // if no children detected
  if (to.matched.length < 2) {
    // scroll to the top of the page
    position = { x: 0, y: 0 };
  } else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
    // if one of the children has scrollToTop option set to true
    position = { x: 0, y: 0 };
  }

  // savedPosition is only available for popstate navigations (back button)
  if (savedPosition) {
    position = savedPosition;
  }

  if (to.hash) {
    position.selector = to.hash;
  }
  return position;
};

const router = new VueRouter({
  mode: 'history',
  base: '/d2/',
  scrollBehavior,
  routes,
  linkActiveClass: 'active',
});

router.beforeEach(async (to, from, next) => {
  try {
    if (!await store.dispatch('RefreshToken')) {
      await store.dispatch('LogOut');
    }

    const logged_info = store.getters.logged_info;
    //logged_info.cellphone = "19999999999";
    const is_login = logged_info.seq;
    // Vue.$log.debug('[router.beforeEach]', 'to.meta', to, logged_info);
    if (!to.name) {
      return next({ name: 'index' });
    }
    if (to.path.indexOf('admin') !== -1) {
      if (logged_info.used_admin !== 'A') {
        return next({ name: 'index' });
      }
    } else if (to.meta.guest_only) {
      if (is_login) {
        return next({ name: 'drive' });
      }
    } else if (to.meta.guest) {
      return next();
    } else if (to.meta.login) {
      if (!is_login) {
        return next({ name: 'index' });
      }
    }
    if (to.meta.guest) {
      return next();
    } else if (to.meta.login) {
      if (!is_login) {
        EventBus.emit('alertPopupOpen', null, '로그인후 이용이 가능합니다.', null);
        return next({ name: 'index' });
      }
    }
    Vue.$log.debug('[router.beforeEach 3]');
    // 정상인 경우
    return next();

    // 요청하다 에러나면 취소
  } catch (e) {
    // Vue.$log.error(e);
    return next(false);
  }
});

export default router;

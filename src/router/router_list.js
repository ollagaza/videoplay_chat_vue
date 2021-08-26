import IndexPage from '../pages/IndexPage';
import Page1 from '../pages/Page1';
import Page2 from '../pages/Page2';
import Join from '../components/join/Join'
import Member_Info from '../components/join/Member_Info'

const router_list = [
  {
    path: '/',
    name: 'index',
    component: IndexPage,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/page1',
    name: 'page1',
    component: Page1,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/page2',
    name: 'page2',
    component: Page2,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/member/joinx',
    name: 'join',
    component: Join,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/member/join',
    name: 'Member_Info',
    component: Member_Info,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
];


export default router_list;

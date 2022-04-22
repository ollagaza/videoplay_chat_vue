import IndexPage from '../pages/IndexPage';
import Page1 from '../pages/Page1';
import Operation from '../pages/Operation';
import OperationView from '../pages/OperationView';
import Page4 from '../pages/Page4';
import Chat from '../pages/Chat';
import Rooms from '../pages/Rooms';
import Join from '../components/join/Join';
import Member_Info from '../components/join/Member_Info';
import Member from '../pages/Member';

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
    path: '/operation/:is_list',
    name: 'operation',
    component: Operation,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/page4/:operation_seq',
    name: 'page4',
    component: Page4,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/operationview/:operation_seq',
    name: 'operationview',
    component: OperationView,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/chat',
    name: 'chat',
    component: Chat,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/member/:is_list',
    name: 'member',
    component: Member,
    meta: { navigation: '', border_line: '', menu_id: '0', no_pad: true, guest: true, login: false, helpCode: 'main' },
  },
  {
    path: '/chat/:room_name?',
    name: 'rooms',
    component: Rooms,
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

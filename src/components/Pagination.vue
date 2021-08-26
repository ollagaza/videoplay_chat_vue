<template>

  <div class="paging_wrapper">
    <div class="paging" v-if="has_page">
      <template v-if="page_info.pageCount > 10">
        <div class="move first" v-on:click="movePage(FIRST)"></div>
        <div class="move prev" v-on:click="movePage(PREV)"></div>
      </template>
      <template v-for="(page, key) in pages">
        <div
          :key="key"
          v-on:click="movePage(page)"
          v-bind:class="{ on: page === page_info.cur_page }"
        >{{ page }}</div>
      </template>
      <template v-if="page_info.pageCount > 10">
        <div class="move next" v-on:click="movePage(NEXT)"></div>
        <div class="move last" v-on:click="movePage(LAST)"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: ['pageNo', 'pageRows', 'pageColumns', 'totalCount', 'pageNationObj'],
  data() {
    return {
      FIRST: 'FIRST',
      LAST: 'LAST',
      PREV: 'PREV',
      NEXT: 'NEXT',
      page_info: {},
      pages: [],
      has_page: false,
    };
  },
  created() {
    this.makePaging();
  },
  computed: {
  },
  watch: {
    pageNationObj: {
      handler(value) {
        this.pageNationObj = value;
        this.makePaging();
      },
      deep: true,
    },
  },
  methods: {
    movePage(page) {
      if (page === this.FIRST) {
        this.onMovePage(1);
      } else if (page === this.LAST) {
        this.onMovePage(this.page_info.last_page);
      } else if (page === this.PREV) {
        this.onMovePage(this.page_info.skipPrev);
      } else if (page === this.NEXT) {
        this.onMovePage(this.page_info.skipNext);
      } else {
        this.onMovePage(page);
      }
    },
    onMovePage(page) {
      this.$emit('onMovePage', page);
    },
    makePaging() {

      if (this.pageNationObj) {
        this.page_info = this.pageNationObj;
        this.$log.debug('this.pageNationObj', this.pageNationObj);
      } else {
        this.page_info.cur_page = this.pageNo;
        this.page_info.list_count = this.pageRows;
        this.page_info.total_count = this.totalCount;
        this.page_info.first_page = this.first_page;
        this.page_info.last_page = this.last_page;
        this.page_info.page_count = this.pageColumns;
        this.$log.debug('this.pageNo', this.pageNo);
      }
      this.page_info.pageCount = Math.ceil(this.page_info.total_count / this.page_info.list_count);
      // this.$log.debug('this.page_info.pageCount',this.page_info.total_count, this.page_info.list_count, this.page_info.pageCount);
      this.page_info.last_page = this.page_info.pageCount;
      this.has_page = this.page_info.pageCount > 0;

      this.page_info.prevPage = this.pageNo - 1 > 1 ? this.pageNo - 1 : 1;
      this.page_info.nextPage = this.pageNo + 1 <= this.page_info.last_page ? this.pageNo + 1 : this.page_info.last_page;
      const columns = this.page_info.page_count ? this.page_info.page_count : 10;
      const total_skip_page = Math.floor((this.page_info.pageCount - 1) / columns);
      const current_skip_page = Math.floor((this.page_info.cur_page - 1) / columns);
      this.page_info.skipPrev = current_skip_page > 0 ? (current_skip_page - 1) * this.page_info.page_count + 1 : 1;
      this.page_info.skipNext = current_skip_page !== total_skip_page ? (current_skip_page + 1) * this.page_info.page_count + 1 : (current_skip_page + 1) * this.page_info.page_count + 1;
      // this.$log.debug(this.totalCount, this.page_info);
      const current_page_first = current_skip_page * this.page_info.page_count + 1;
      this.pages = [];
      // this.$log.debug(this.page_info.page_count, this.page_info.last_page);
      for (let i = 0; i < this.page_info.page_count; i++) {
        const page = current_page_first + i;
        if (page > this.page_info.last_page) {
          break;
        }
        this.pages.push(page);
      }
      this.has_page = this.pages.length > 0;
      // this.$log.debug(this.has_page);
    },
  },
};
</script>

<style scoped>
.move {
  width: 24px;
  height: 24px;
  padding: 0;
  background-repeat: no-repeat;
  background-position: center;
}

.move.first {
  margin-right: 6px;
  background-image: url(/img/jiin/first_arrow.png);
}
.move.prev {
  background-image: url(/img/jiin/pre_arrow.png);
}
.move.next {
  margin-left: 20px;
  background-image: url(/img/jiin/next_arrow.png);
}
.move.last {
  margin-left: 6px;
  background-image: url(/img/jiin/end_arrow.png);
}

.move.first:hover {
  margin-right: 6px;
  background-image: url(/img/jiin/first_arrow.png);
}
.move.prev:hover {
  background-image: url(/img/jiin/pre_arrow.png);
}
.move.next:hover {
  margin-left: 20px;
  background-image: url(/img/jiin/next_arrow.png);
}
.move.last:hover {
  background-image: url(/img/jiin/end_arrow.png);
}
.paging_wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  height: 30px;
}
.paging_wrapper .paging {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.paging_wrapper .paging > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-left: 20px;
  cursor: pointer;
  font-weight: 400;
  font-size: 16px;
  color: #888;
}
.paging_wrapper .paging > div.on {
  pointer-events: none;
  cursor: default;
  color: #030303;
}
.paging_wrapper .paging > div.off {
  pointer-events: none;
  color: #555555;
}
</style>



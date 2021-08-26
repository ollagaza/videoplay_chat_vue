<template>
  <div class="layout">
    <div style="width: 1180px; height:100%; ">
      <div class="report_wrapper">
        <div class="item_title" style="display: grid; grid-template-columns: 200px 2fr; justify-items: flex-end;">
          <div style="justify-self: flex-start;">분석 리포트</div>
          <div class="btn newgreen" style="width:150px; justify-self: flex-end;" v-on:click="onPdfClicked">PDF Download</div>
        </div>
        <div style="margin-top: 30px;">
          <div style="display: flex; flex-direction: row;">
            <div class="item_sub_title">
              {{c_result_text}} 의심
            </div>
            <div class="item_sub_title_tail">
              {{c_group_name}} / {{c_plant_status}} / {{c_plant_day}}
            </div>
          </div>
          <div style="display: flex; flex-direction: row; margin-top: 20px; ">
            <div style="position: relative; width:540px; height:405px; border: 1px solid #ccc; margin-right: 20px; text-align: center;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <img v-bind:src="`${c_img_url}`" style="max-width:540px; max-height:405px;">
              </div>
            </div>
            <div style="width: 490px;">
              <div style="display: flex; flex-direction: row;">
                <div class="checkmain">{{c_check_main}} 확률</div>
                <div class="checkpercent">{{c_check_percent}}%</div>
              </div>
              <div style="margin-top: 10px;font-weight: 400; font-size: 14px; color: #aaa297;letter-spacing: -0.5px">
                아래의 발생원인과 조치사항을 참고 하세요.
              </div>
              <div style="margin-top: 25px;">
                <template v-for="(item, idx) in c_check">
                <div class="chart" v-bind:class="{on: item.select_data === 1}" v-on:click="onChartClick(item.seq)">
                  <div style="" class="chart_img"></div>
                  <div class="chart_text">{{item.result_text}} {{item.percent}}%</div>
                  <div class="chart_line">
                    <div class="chart_line_wrap">
                      <div class="chart_line_back"></div>
                      <div class="chart_line_graph" v-bind:style="{width: `${item.percent}%`}"></div>
                    </div>
                  </div>
                </div>
                </template>
                <div style="margin-top: 30px; text-align: right;display: flex; flex-direction: row-reverse">
                  <div class="btn_change" v-on:click="onResultChange">판정변경</div>
                </div>
              </div>
            </div>
          </div>
          <template v-if="c_case">
            <div class="div_sp">
              <div class="div_sp_title">마르병 발생원인</div>
              <div class="div_sp_text" v-html="c_case">
              </div>
            </div>
          </template>
          <template v-if="c_act">
            <div class="div_sp">
              <div class="div_sp_title">처방사항</div>
              <div class="div_sp_text" v-html="c_act">
              </div>
            </div>
          </template>
          <template v-if="c_recom">
            <div class="div_sp_one">
              <div class="div_sp_title">약제추천</div>
              <div class="div_sp_img" v-html="c_recom">
              </div>
            </div>
          </template>
          <template v-else>
            <div class="div_sp_one">
              <div class="div_sp_title">약제추천</div>
              <div class="div_sp_img">
                <div>
                  <div style="flat:left; width:250px;">
                    <img src="/img/jiin/sample1.jpg" style="max-width: 1000px;">
                  </div>
                </div>
              </div>
            </div>
            <div class="div_sp_one">
              <div class="div_sp_title">혼용약제</div>
              <div class="div_sp_img">
                <div>
                  <div style="flat:left; width:250px;">
                    <img src="/img/jiin/sample1.jpg" style="max-width: 1000px;">
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div style="width: 1178px; height: 50px; margin-top: 20px;">
        <div class="btn newgreen list" style="margin: 0 auto; width: 200px;" v-on:click="onListClick">목록</div>
      </div>
    </div>
    <ReportPdf ref="reportPdf" v-bind:updata="updata" ></ReportPdf>
  </div>
</template>

<script>
import ChipList from '../../datas/ChipList';
import apilist from '../../api/ApiList';
import apiitem from '../../api/ApiItem';
import util from '../../utils/util';
import BaseMixin from '../../components/Mixins/BaseMixin';
import ReportPdf from '../../components/popup/ReportPdf';
import html2pdf from 'html2pdf.js';

export default {
  name: 'ReportView',
  components: { ReportPdf },
  props: ['roption'],
  mixins: [BaseMixin],
  created() {
    this.load_data();
  },
  computed: {
    c_check_main() {
      return this.check_main;
    },
    c_check_percent() {
      return this.check_percent;
    },
    c_plant_day() {
      if (this.c_info.plant_day) {
        return this.c_info.plant_day.substring(0,10).replaceAll('-','.');
      }
      return '';
    },
    c_plant_status() {
      if (this.c_info.plant_status === 1) {
        return '활착기';
      }
      if (this.c_info.plant_status === 2) {
        return '성장기';
      }
      if (this.c_info.plant_status === 3) {
        return '수확기';
      }
      return '';
    },
    c_result_text() {
      if (this.c_info) {
        return this.c_info.result_text;
      }
      return '';
    },
    c_group_name() {
      if (this.c_info) {
        return this.c_info.jitemname;
      }
      return '';
    },
    c_info() {
      return this.info;
    },
    c_check() {
      if (this.check) {
        return this.check;
      }
      return [];
    },
    c_img_url() {
      if (this.imgs.length > 0) {
        let check_seq = -1;
        for (let i = 0; i < this.imgs.length; i++) {
          if (this.imgs[i].filetype === 1) {
            check_seq = this.imgs[i].seq;
            break;
          }
        }
        if (check_seq < 0) {
          check_seq = this.imgs[0].seq;
        }
        return `/apis1/s1/plant/getimg/${check_seq}`;
      } else {
        return '/img/jiin/main_visual_oj2.png';
      }
    },
    c_act() {
      if (this.caselist && this.caselist.itemact) {
        return this.caselist.itemact;
      }
      return null;
    },
    c_case() {
      if (this.caselist && this.caselist.itemcase) {
        return this.caselist.itemcase;
      }
      return null;
    },
    c_recom() {
      if (this.caselist && this.caselist.itemrecom) {
        return this.caselist.itemrecom;
      }
      return null;
    }
  },
  data() {
    return {
      testid: '',
      pageIndex: 1,
      info: {},
      imgs: [],
      check: [],
      patient_name: '',
      req_orgname: '',
      req_title: '',
      imgname: '',
      check_main: '',
      check_percent: '',
      caselist: {},
      updata: {},
    };
  },
  methods: {
    onPdfClicked() {
      this.updata = {
        c_result_text: this.c_result_text,
        c_group_name: this.c_group_name,
        c_plant_status: this.c_plant_status,
        c_plant_day: this.c_plant_day,
        c_img_url: this.c_img_url,
        c_check_main: this.c_check_main,
        c_check_percent: this.c_check_percent,
        c_check: this.c_check,
        c_case: this.c_case,
        c_act: this.c_act,
        c_recom: this.c_recom
      };
      this.$refs.reportPdf.OpenPdf();
    },
    onResultChange() {
      let selIdx = -1;
      const data = {};
      for (let i = 0; i < this.check.length; i++){
        if (this.check[i].select_data === 1) {
          data.plantseq = this.roption.plant_seq;
          data.seq = this.check[i].seq;
          data.result_text = this.check[i].result_text;
          selIdx = i;
          break;
        }
      }
      apilist.changeResult(data)
      .then((result) => {
        if (result.error === 0){
          this.onSuccess('정보가 변경되었습니다.');
          this.$emit('onChangeResult');
        } else {
          this.onError(`오류발생 ${result.message}`);
        }
      })
      .catch((e) => {
        this.onError(`오류발생 ${e}`);
      });
    },
    async onChartClick(seq) {
      this.$log.debug(this.check);
      let itemcode = null;
      for (let i = 0; i < this.check.length; i++) {
        if (this.check[i].seq === seq) {
          this.check[i].select_data = 1;
          this.check_main = this.check[i].result_text;
          this.check_percent = this.check[i].percent;
          this.info.result_text = this.check[i].result_text;
          itemcode = this.check[i].result;
        } else {
          this.check[i].select_data = 0;
        }
      }
      await apiitem.getActioncase(itemcode)
        .then((result) => {
          this.$log.debug(result.result[0]);
          this.caselist = result.result[0];
        })
        .catch((e) => {
        });
    },
    checkMod() {
      this.$emit('onMod' ,this.roption.check_seq);
    },
    load_data() {
      if (!this.roption.plant_seq) {
        this.roption.plant_seq = 1;
      }
      const data = { plant_seq: this.roption.plant_seq };
      this.$log.debug(data);
      apilist.getInfoData(data)
        .then((result) => {
          if (result.error === 0) {
            this.info = result.info[0];
            this.$log.debug('info', this.info);
            this.check = result.check;
            for (const key in this.check) {
              this.check[key].percent = (this.check[key].percent * 100).toFixed(1);
              if (this.check[key].select_data === 1) {
                this.check_main = this.check[key].result_text;
                this.check_percent = this.check[key].percent;
              }
            }
            this.$log.debug('check', this.check);
            this.imgs = result.files;
            this.caselist = {};
            if (result.case) {
              this.caselist = result.case;
              this.$log.debug(this.caselist);
            }
          }
        })
        .catch((e) => {
          this.onError(e);
        });
    },
    onPageClick(page) {
      this.pageIndex = page;
      this.list_data();
    },
    onListClick() {
      this.$emit('onList');
    },
  },
};
</script>

<style scoped>
.checkmain {
  font-weight: 400;
  font-size: 16px;
  color: #504637;
  letter-spacing: -0.5px;
  padding-top: 35px;
  margin-right: 20px;
}

.checkpercent {
  font-weight: 600;
  font-size: 50px;
  color: #296033;
  letter-spacing: -0.5px;
}

.div_sp_one{
  padding-top: 30px;
  margin-top: 30px;
  border-top: 1px solid #ccc;
}

.div_sp {
  display: flex;
  flex-direction: row;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 1px solid #ccc;
}

.div_sp_title {
  width: 130px;
  font-weight: 600;
  font-size: 16px;
  color: #504637;
  letter-spacing: -0.5px;
}

.div_sp_text {
  font-weight: 400;
  font-size: 14px;
  color: #030303;
  letter-spacing: -0.5px;
  line-height: 1.4;
}

.div_sp_img {
  margin-top: 40px;
  font-weight: 400;
  font-size: 14px;
  color: #030303;
  letter-spacing: -0.5px;
  line-height: 1.4;
}

.btn_change {
  height: 40px;
  width: 100px;
  border-radius: 6px;
  border: 1px solid #bccfbf;
  font-weight: 400;
  font-size: 16px;
  color: #336a3c;
  letter-spacing: -0.5px;
  background-color: #fff;
  padding: 7px 0 0 0;
  text-align: center;
  cursor: pointer;
}

.btn_change:hover {
  border: 1px solid #336a3c;
}

.chart {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 3px 3px 6px rgba(32, 94, 46, 0.3);
  display: flex;
  flex-direction: row;
  padding: 9px 0 0 20px;
  margin-top: 5px
}

.chart.on {
  border: 1px solid #336a3c;
  background-color: #336a3c;
}

.chart:hover {
  border: 1px solid #336a3c;
  background-color: #ccc;
  cursor: pointer;
}

.chart > .chart_text{
  width:180px;
  font-weight: 600;
  font-size: 16px;
  color: #336a3c;
  letter-spacing: -0.5px
}

.chart.on > .chart_text {
  color: #ffffff;
}

.chart > .chart_img {
  margin: 6px 10px 0 0;
  width: 14px;
  height: 11px;
  background-image: url('/img/jiin/report_arrow_gray.png');
}

.chart.on > .chart_img {
  background-image: url('/img/jiin/report_arrow_white.png');
}

.chart > .chart_line {
  width: 250px;
  margin-top: 6px;
}

.chart > .chart_line > .chart_line_wrap{
  position: relative;
}

.chart > .chart_line > .chart_line_wrap > .chart_line_graph  {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 0%;
  height: 10px;
  border-radius: 4px;
  background-color: #336a3c;
  z-index: 12;
}

.chart > .chart_line > .chart_line_wrap > .chart_line_back {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 10px;
  border-radius: 4px;
  background-color: #dddddd;
  z-index: 11;
}


.chart.on > .chart_line > .chart_line_wrap > .chart_line_graph {
  background-color: #ffffff;
}

.chart.on > .chart_line > .chart_line_wrap > .chart_line_back {
  background-color: #4d7e58;
}

.layout {
  min-height: 850px;
  height: 100%;
}
.report_wrapper{
  width:100%;
  height: 100%;
  padding: 50px;
  margin-top: 30px;
  background-color: #fff;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
}
.item_title {
  font-weight: 600;
  font-size: 27px;
  color: #030303;
  letter-spacing: -0.5px;
  line-height: 1.2;
  padding-bottom: 20px;
  border-bottom: 2px solid #030303;
}
.item_sub_title{
  font-weight: 300;
  font-size: 21px;
  color: #504637;
  letter-spacing: -0.5px;
}
.item_sub_title_tail{
  font-weight: 400;
  font-size: 16px;
  color: #504637;
  letter-spacing: -0.5px;
  margin-left: 20px;
  margin-top: 7px;
}

.zoom-out {
  /* CSS zoom property not supported by html2canvas */
  transform: scale(0.8);
  transform-origin: 0 0;
  margin: 0 0 0 0;
}

</style>

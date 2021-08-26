<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }" style="">
    <div class="popup newdata" v-on:click.stop="() => false" v-on:mousedown.stop="() => false">
      <div style="width: 790px;">
        <div style="display:flex; flex-direction: row-reverse; width:100%; text-align: right; margin-top: 0px;margin-right: 10px;margin-bottom: 5px;">
          <div class="btn newgreen_empty" style="width:100px;margin-left: 10px;margin-right: 10px;" v-on:click="ClosePdf">닫기</div>
          <div class="btn newgreen" style="width:100px;" v-on:click="onPdfClicked">Pdf Down</div>
        </div>
        <div style="height: 70vh; overflow-y: auto;">
          <div class="report_wrapper" ref="pdfarea" >
            <div class="item_title">
              분석 리포트
            </div>
            <div style="margin-top: 30px;">
              <div style="display: flex; flex-direction: row;">
                <div class="item_sub_title">
                  {{updata.c_result_text}} 의심
                </div>
                <div class="item_sub_title_tail">
                  {{updata.c_jitemname}} / {{updata.c_plant_status}} / {{updata.c_plant_day}}
                </div>
              </div>
              <div style="display: flex; flex-direction: row; margin-top: 20px; ">
                <div style="position: relative; width:395px; height:296px; border: 1px solid #ccc; margin-right: 20px; text-align: center;">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <img v-bind:src="`${updata.c_img_url}`" style="max-width:395px; max-height:296px;">
                  </div>
                </div>
                <div style="width: 395px;">
                  <div style="display: flex; flex-direction: row;">
                    <div class="checkmain">{{updata.c_check_main}} 확률</div>
                    <div class="checkpercent">{{updata.c_check_percent}} %</div>
                  </div>
                  <div style="margin-top: 10px;font-weight: 400; font-size: 14px; color: #aaa297;letter-spacing: -0.5px">
                    아래의 발생원인과 조치사항을 참고 하세요.
                  </div>
                  <div style="margin-top: 25px;background-color: #fff">
                    <template v-for="(item, idx) in updata.c_check">
                      <div class="chart" style="background-color: #fff" v-bind:class="{on: item.select_data === 1}" >
                        <div style="" class="chart_img zoom-out"></div>
                        <div class="chart_text">{{item.result_text}} {{item.percent}}%</div>
                        <div class="chart_line">
                          <div class="chart_line_wrap">
                            <div class="chart_line_back"></div>
                            <div class="chart_line_graph" v-bind:style="{width: `${item.percent}%`}"></div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <template v-if="updata.c_case">
                <div class="page-break"></div>
                <div class="div_sp">
                  <div class="div_sp_title">발생원인</div>
                  <div class="div_sp_text zoom-out-data" v-html="updata.c_case">
                  </div>
                </div>
              </template>
              <template v-if="updata.c_act">
                <div class="div_sp">
                  <div class="div_sp_title">발생원인</div>
                  <div class="div_sp_text zoom-out-data" v-html="updata.c_act">
                  </div>
                </div>
              </template>
              <template v-if="updata.c_recom">
                <div class="page-break"></div>
                <div class="div_sp_one">
                  <div class="div_sp_title">약제추천</div>
                  <div class="div_sp_img"  v-html="updata.c_recom">
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="page-break"></div>
                <div class="div_sp_one">
                  <div class="div_sp_title">약제추천</div>
                  <div class="div_sp_img">
                    <div>
                      <div class="zoom-out-data">
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
                        <img src="/img/jiin/sample1.jpg" style="max-width: 700px;">
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import html2pdf from 'html2pdf.js';

export default {
  name: 'ReportPdf',
  componets: [],
  props: ['updata'],
  data() {
    return {
      testid: '',
      is_open: false,
    };
  },
  computed: {
  },
  methods: {
    ClosePdf() {
      this.is_open = false;
    },
    OpenPdf() {
      this.is_open = true;
    },
    onPdfClicked() {
      this.exportToPDF();
    },
    exportToPDF() {
      // window.scrollTo(0,0);
      html2pdf(this.$refs.pdfarea,{
        margin: 0,
        filename: 'document.pdf',
        image: { type: 'jpg', quality: 0.95 },
        pagebreak: { mode: ['css'] },
        html2canvas: { scrollY: 200, scale: 1, dpi: 300, letterRendering: true,
          ignoreElements : function(element) {
            if( element.id == "pdf-button-area" ) {
              return true;
            }
          }
        },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4', compressPDF: true },
      });
    },
  },
};
</script>

<style scoped>
.page-break {
  page-break-after: always;
  page-break-inside: avoid;
  clear:both;
}
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
  width: 230px;
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
  /*box-shadow: 3px 3px 6px rgba(32, 94, 46, 0.3);*/
  display: flex;
  flex-direction: row;
  padding: 9px 0 0 20px;
  margin-top: 5px
}

.chart.on {
  border: 1px solid #336a3c;
  background-color: #336a3c;
}

.chart > .chart_text{
  width:150px;
  font-weight: 600;
  font-size: 14px;
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
  width: 120px;
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
  padding: 10px;
  margin-top: 30px;
  background-color: #fff;
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
.zoom-out-data {
  /* CSS zoom property not supported by html2canvas */
  transform: scale(0.7);
  transform-origin: 0 0;
  margin: 0 0 0 0;
}

</style>

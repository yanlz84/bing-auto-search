// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.268
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平提出全球治理倡议", "金正恩乘专列来华 现场画面公布", "李幼斌与李云龙跨时空对话", "上合组织经贸合作“含金量”", "多国领导人乘高铁抵达北京", "“中国冷极”已开始供暖", "公安部公布3起打击“黑飞”案例", "小学生报到名字惊艳众人：扶苏 知潼", "80年前的今天日本正式签署投降书", "九三阅兵 具体安排来了", "王毅宣布老挝成为上合成员国", "“全民强制社保”系谣言", "整治农村高额彩礼 中央农办出手了", "贵州小县城让抹茶快没日本什么事了", "钟薛高创始人回应雪糕“烧不化”", "全校3个孩子1名老师升旗高唱国歌", "普京专车换上中国车牌 还有2个8", "湖北一市出生人口8年来首次由降转增", "全球最大冰山面积减少超三分之一", "莫迪发文感谢中方", "雀巢CEO因与下属关系不当被解雇", "李家超将率360人代表团出席九三阅兵", "巴黎世家客服回应新包撞脸塑料袋", "老太与儿子因房款对簿公堂 法院判了", "272万网民选的军训服要来了", "网约车被追尾停运6天咋赔 法院判了", "新疆小伙骑摩托3500公里去郑州上学", "印使馆：莫迪在天津受到热烈欢迎", "尹锡悦在拘留所拒捕监控曝光", "马杜罗：1200枚导弹“瞄准”委内瑞拉", "银行行长纷纷表态“反内卷”", "中方回应“印尼总统取消来华”", "男孩赶14小时作业双手痉挛变鸡爪状", "深圳将全面封杀教辅资料？教育局回应", "“甘蔗姐姐”筹钱救弟终成遗憾", "胖东来燕麦脆被指无生产日期", "涉嫌走私1.2吨毒品 7名荷兰公民被捕", "兰大回应学生持证骑骆驼上学", "买电动车注意三个月过渡期", "这些人可提前发工资", "流浪狗到商店乞食 生下小狗托付老板", "天安门广场布置已基本就绪", "王毅介绍上合组织天津峰会八大成果", "捷克前总理巴比什在竞选活动中遇袭", "北方冷空气VS南方秋老虎", "南京80岁奶奶在遇难同胞姓名前流泪", "硬核开学第一课展示191式步枪模型", "巴方：以吞并行为将摧毁“两国方案”", "苏丹一村庄山体滑坡 遇难者或上千", "抗战胜利80周年纪念大会3日9时举行", "德防长驳斥冯德莱恩向乌派兵言论"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}

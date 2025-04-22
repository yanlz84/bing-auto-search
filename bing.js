// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.3
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
var default_search_words = ["总书记的一周", "聋哑女生因容貌美得不真实被质疑", "受贿超8.22亿 李鹏新被判死缓", "美小企业主：我最近哭泣次数很多", "电商平台全面取消仅退款", "中国被曝能让全球无人机产业停摆1年", "67款APP违法收集使用个人信息被通报", "39岁网红与前妻3天内相继离世", "董明珠：搞小三小四能搞好企业才怪", "女演员闻宝宝脚丫致眼睛感染睁不开", "结婚1年半离婚要回35万彩礼判还6万", "电力抢修人员在废品站卖电线？假", "刘强东给美团饿了么骑手敬酒欢迎", "半挂车高速起火 承运公司回应", "普京：俄方积极看待停火", "特朗普急了 炮轰鲍威尔要求降息", "水利部启动干旱防御Ⅳ级应急响应", "董明珠顺利连任格力电器董事", "网逃男子带70多万现金躲山洞被抓", "男子翻窗进入女邻居家强奸未遂获刑", "金价猛涨 突破1100元每克", "女子被泼汽油案二审择期宣判", "男子回应邻居装修把自己家拆了", "巡视组进驻 河南2天两市委常委落马", "现货黄金突破3480美元/盎司", "马伯骞给弟弟婚礼当伴郎", "被质疑AI美貌女生不想因聋哑被同情", "《哪吒2》延长上映至5月31日", "美市长提议给无家可归者发芬太尼", "长城汽车：打死也不做增程", "特朗普：将与妻子参加教皇方济各葬礼", "中国气门嘴硬控美国汽车", "中方回应日本炒作中国治安形势不佳", "中国“会飞的保温杯”引外媒关注", "广西为何出现“旱涝并存”现象", "男子讨喜钱掰断劳斯莱斯小金人", "周继红任中国游泳协会主席", "商家进口近11吨脏贝壳被罚50万", "为什么黄金会一路狂飙到3400", "中央巡视组进驻后 她主动交代问题", "宁德时代钠新电池2025年底正式量产", "尹锡悦刮起的右倾风会吹翻李在明吗", "《蛮好的人生》邱丽苏酒局出卖丁致远", "清华大学成立新学院", "地铁被辱骂衣服脏乘客家属发声", "价值百万800克黄金越王宝剑被买走", "37岁杜海涛山西探亲瘦好多", "特朗普季报：美股跌得鼻青脸肿", "伊朗外长阿拉格齐将访", "特朗普称3天内公布俄乌和平计划|", "刘强东称未来全职外卖员或超100万人"]

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

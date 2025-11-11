// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.408
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
var default_search_words = ["习近平总书记琼粤行", "我们的飞机再也不用飞两遍", "故宫博物院讣告：耿宝昌逝世", "当甲骨文遇上十五运会", "上海交大回应78万元“天价”学费", "双十一商品到手价全凭运气", "德司令：柏林已做好与莫斯科开战准备", "男子带猪肉记号笔陪产怕孩子抱错", "小孩姐逛清华暴走2万步直呼不考了", "捐款造航母男生获赠福建舰手表", "诸暨网红“麻糍奶奶”遇车祸去世", "芜湖发生特大爆炸火灾系谣言", "12岁小孩做一张AI图吓坏整个小区", "巴菲特谢幕信：已捐13亿美元股票", "全运会大湾鸡爆火 扮演者是武校少年", "空军微电影预告：有新家伙", "环球小姐集体退赛 主办方总监道歉", "印度首都汽车爆炸已致超10死", "最毒的生日祝福", "博士生提供涉密地形图获刑15年", "第一批跳企鹅舞的大学生出现了", "汉堡王中国也被卖了", "最近“企鹅舞”火了", "台退将建议：福建舰的母港选址台湾", "央美学生被指抄袭还获一等奖学金", "女子为减肥参加海岛求生35天减28斤", "苏菲回应卫生巾上有活虫", "鸭子大军下地成“开荒冠军”", "纳斯达克中国金龙指数收涨2.25%", "邓亚萍：全运会太难打了", "董璇回应婚礼餐标67元", "潘展乐收获全运会首金", "台湾逼近“超高龄社会”", "何炅金龟子同台合唱《大风车》", "谷神星一号（遥十九）火箭发射失利", "正直播NBA：奇才vs活塞", "网购豆腐乳里现多条蛆虫蠕动", "学生称4000多元手表被偷 多方回应", "小学没毕业 初二重点课程学完了", "纯银筷子10元一双靠谱吗", "兰州一道路施工倒计时从4天变28天", "陈芋汐全运会双金收官", "刘嘉玲喊话网店欺骗消费者", "五星级酒店推40元剩菜盲盒：有大闸蟹", "印度新德里发生汽车爆炸", "人民空军 祝你生日快乐", "全红婵看台为陈芋汐打Call", "金价涨超2% 创本月最大涨幅", "一小型飞机在美佛罗里达州附近坠毁", "养仨月女儿出院记录显示男 医院通报", "陈芋汐全运会女子10米跳台夺金"]

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

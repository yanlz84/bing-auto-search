// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.17
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
var default_search_words = ["奋斗创造美好未来", "辽宁一饭店发生火灾致22死3伤", "辽宁致22死火灾饭店经营者已被控制", "一季度工业经济整体开局良好", "辽宁饭店火灾现场 火势猛烈浓烟遮天", "神舟十九号载人飞船推迟返回", "曾黎灾难公关", "永辉超市回应标价7.96元实收8元", "33岁抗癌博主小杨哥离世", "协和校长寄语提及董袭莹内容被删", "辽宁省委书记：尽快查清22死火灾原因", "河南南阳火灾致14人遇难？谣言", "日本前首相：台湾问题是中国内政", "章子怡因在领奖后台摔倒坐轮椅出行", "新疆原质监局局长刘新胜被查", "外科医生肖飞事件让人细思极恐", "成都警方：地铁偷拍女性属实", "一线城市开启买房送学位", "酒店机器人3年亏了8个亿", "龚翔宇担任新一届中国女排队长", "程序员坚持跳绳2年跳走了脂肪肝", "汽车漂移致1死救护车半路上被取消", "贾跃亭再任CEO 这次能翻身吗", "100岁中医太姥爷给曾外孙做推拿", "“牛鞭效应”让美国进口商左右为难", "台湾老伯喂狗吃巧克力 狗主人报警", "张云龙翟潇闻中二魂", "黄奕给刘德华解释什么叫画饼", "第一批追高黄金的年轻人已经亏麻了", "外交部回应俄宣布停火三天", "请汇报五一节前各地实况 over", "山西网红“汽车炫锅场”事故致1死", "辽宁饭店火灾事故救援结束", "肖飞被开除 董袭莹问题何时查", "国务院安委会挂牌督办辽宁22死火灾", "#4加4制度是否沦为特权阶层捷径#", "董明珠年薪1437.2万", "巴基斯坦防长：巴印不会爆发核战", "“面具女”电梯内恐吓两幼童", "商务部回应中方已停止接收波音客机", "刘德华：和倪妮合作有找到爱情的感觉", "我的五一出游实况分享", "特朗普第一个百日被称史诗级失败", "博主内六角：白天是医生晚上送外卖", "12岁女孩被虐致死 继母一审被判死刑", "高校回应网传“捉奸坠楼”：不存在", "中方回应菲海军发言人涉台言论", "山西省海归商会要求董明珠道歉", "肖战《漂流》入围第18界肖蒂奖", "交通银行：第一季度净利润253.7亿元", "加拿大自由党在联邦众议院选举中获胜"]

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
